import math
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import Restaurant, MenuCategory, MenuItem, Order, OrderItem, RestaurantTable, CallWaiter, MenuItemExtra, RestaurantUser
from .serializers import (
    RestaurantSerializer, MenuCategorySerializer, MenuItemSerializer,
    OrderSerializer, OrderItemSerializer, MenuItemExtraSerializer
)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


# ═══════════════════════════════════════════════════════════
# ─── AUTHENTICATION HELPERS ────────────────────────────────
# ═══════════════════════════════════════════════════════════

def get_user_restaurant(request):
    """
    Multi-tenancy fix: returns the restaurant associated with the logged-in user.
    Superusers return the first restaurant as fallback.
    """
    if request.user.is_authenticated:
        if request.user.is_superuser:
            return Restaurant.objects.first()
        try:
            return request.user.restaurant_profile.restaurant
        except RestaurantUser.DoesNotExist:
            pass
    return Restaurant.objects.first()


def get_role_redirect(user):
    """Returns the correct dashboard URL based on user role."""
    if user.is_superuser:
        return '/saas/admin/'
    try:
        profile = user.restaurant_profile
        role_map = {
            'OWNER':   '/owner/dashboard/ui/',
            'MANAGER': '/owner/dashboard/ui/',
            'CHEF':    '/kitchen/dashboard/',
            'WAITER':  '/waiter/dashboard/ui/',
        }
        return role_map.get(profile.role, '/owner/dashboard/ui/')
    except RestaurantUser.DoesNotExist:
        return '/admin/'


def require_role(*allowed_roles):
    """Decorator factory: checks login + role."""
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect(f'/staff/login/?next={request.path}')
            if request.user.is_superuser:
                return view_func(request, *args, **kwargs)
            try:
                profile = request.user.restaurant_profile
                if profile.role in allowed_roles:
                    return view_func(request, *args, **kwargs)
            except RestaurantUser.DoesNotExist:
                pass
            return render(request, 'restaurants/error.html', {
                'message': 'ليس لديك صلاحية الوصول لهذه الصفحة',
                'back_url': get_role_redirect(request.user)
            }, status=403)
        wrapper.__name__ = view_func.__name__
        return wrapper
    return decorator


# ═══════════════════════════════════════════════════════════
# ─── AUTH VIEWS ────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════

def staff_login_view(request):
    """Login page for all staff roles."""
    if request.user.is_authenticated:
        return redirect(get_role_redirect(request.user))

    error = None
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            next_url = request.GET.get('next', '') or get_role_redirect(user)
            return redirect(next_url)
        else:
            error = 'اسم المستخدم أو كلمة المرور غير صحيحة'

    return render(request, 'restaurants/login.html', {'error': error})


def staff_logout_view(request):
    """Logout and redirect to login."""
    logout(request)
    return redirect('/staff/login/')


# ═══════════════════════════════════════════════════════════
# ─── TEMPLATE VIEWS (Dashboard Pages) ─────────────────────
# ═══════════════════════════════════════════════════════════

def customer_menu_view(request, slug):
    restaurant = get_object_or_404(Restaurant, slug=slug)
    table_token = request.GET.get('t', '')
    return render(request, 'restaurants/customer_menu.html', {
        'restaurant': restaurant,
        'restaurant_slug': restaurant.slug,
        'table_token': table_token
    })


@require_role('CHEF', 'OWNER', 'MANAGER')
def kitchen_dashboard_view(request):
    restaurant = get_user_restaurant(request)
    user_role = 'SUPERUSER' if request.user.is_superuser else getattr(
        getattr(request.user, 'restaurant_profile', None), 'role', 'OWNER'
    )
    return render(request, 'restaurants/kitchen_dashboard.html', {
        'restaurant': restaurant,
        'user_role': user_role,
    })


@require_role('WAITER', 'OWNER', 'MANAGER')
def waiter_dashboard_view(request):
    restaurant = get_user_restaurant(request)
    user_role = 'SUPERUSER' if request.user.is_superuser else getattr(
        getattr(request.user, 'restaurant_profile', None), 'role', 'OWNER'
    )
    return render(request, 'restaurants/waiter_dashboard.html', {
        'restaurant': restaurant,
        'user_role': user_role,
    })


@require_role('OWNER', 'MANAGER')
def owner_dashboard_view(request):
    restaurant = get_user_restaurant(request)
    user_role = 'SUPERUSER' if request.user.is_superuser else getattr(
        getattr(request.user, 'restaurant_profile', None), 'role', 'OWNER'
    )
    return render(request, 'restaurants/owner_dashboard.html', {
        'restaurant': restaurant,
        'user_role': user_role,
    })


def super_admin_dashboard_view(request):
    """Only Django superusers can access this."""
    if not request.user.is_authenticated:
        return redirect(f'/staff/login/?next={request.path}')
    if not request.user.is_superuser:
        return render(request, 'restaurants/error.html', {
            'message': 'هذه الصفحة متاحة للمشرف العام فقط',
            'back_url': get_role_redirect(request.user)
        }, status=403)

    restaurants = Restaurant.objects.all().order_by('-created_at')
    total_restaurants = restaurants.count()
    active_subscriptions = restaurants.filter(is_active=True).count()
    total_orders_platform = Order.objects.count()

    return render(request, 'restaurants/super_admin_dashboard.html', {
        'restaurants': restaurants[:5],
        'total_restaurants': total_restaurants,
        'active_subscriptions': active_subscriptions,
        'total_orders_platform': total_orders_platform
    })


def generate_qr_view(request, table_token):
    table = get_object_or_404(RestaurantTable, unique_token=table_token)
    return render(request, 'restaurants/generate_qr.html', {'table': table, 'restaurant': table.restaurant})


@require_role('OWNER', 'MANAGER')
def print_all_qrs_view(request):
    restaurant = get_user_restaurant(request)
    tables = RestaurantTable.objects.filter(restaurant=restaurant)
    return render(request, 'restaurants/print_qrs.html', {'restaurant': restaurant, 'tables': tables})


# ═══════════════════════════════════════════════════════════
# ─── API VIEWS ─────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════

class RestaurantMenuView(APIView):
    def get(self, request, slug):
        restaurant = get_object_or_404(Restaurant, slug=slug)
        categories = MenuCategory.objects.filter(restaurant=restaurant).order_by('order')
        serializer = MenuCategorySerializer(categories, many=True)
        return Response({
            "restaurant": RestaurantSerializer(restaurant).data,
            "categories": serializer.data,
            "can_order": True
        })


@method_decorator(csrf_exempt, name='dispatch')
class RestaurantTablesView(APIView):
    """Returns all tables for a restaurant — used when customer has no QR token."""
    def get(self, request, slug):
        restaurant = get_object_or_404(Restaurant, slug=slug)
        tables = RestaurantTable.objects.filter(restaurant=restaurant).order_by('table_number')
        return Response({
            'tables': [
                {'number': t.table_number, 'token': str(t.unique_token)}
                for t in tables
            ]
        })


@method_decorator(csrf_exempt, name='dispatch')
class PlaceOrderView(APIView):
    def calculate_distance(self, lat1, lon1, lat2, lon2):
        R = 6371000
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    def post(self, request):
        restaurant_id = request.data.get('restaurant_id')
        table_token = request.data.get('table_token')
        items_data = request.data.get('items', [])
        payment_method = request.data.get('payment_method', 'CASH')

        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        table = get_object_or_404(RestaurantTable, unique_token=table_token, restaurant=restaurant)

        order = Order.objects.create(
            restaurant=restaurant, table=table,
            payment_method=payment_method, status='PENDING'
        )

        total_price = 0
        for item_data in items_data:
            menu_item = get_object_or_404(MenuItem, id=item_data['item_id'], category__restaurant=restaurant)
            quantity = int(item_data.get('quantity', 1))
            item_unit_price = menu_item.price
            extras_ids = item_data.get('extras', [])

            order_item = OrderItem.objects.create(
                order=order, menu_item=menu_item, quantity=quantity,
                price_at_order=menu_item.price, item_notes=item_data.get('notes', '')
            )

            if extras_ids:
                extras = MenuItemExtra.objects.filter(id__in=extras_ids, item=menu_item)
                for extra in extras:
                    order_item.selected_extras.add(extra)
                    item_unit_price += extra.price

            total_price += (item_unit_price * quantity)

        order.total_price = total_price
        order.save()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'restaurant_{order.restaurant.id}_kitchen',
            {'type': 'new_order', 'order': OrderSerializer(order).data}
        )

        async_to_sync(channel_layer.group_send)(
            f'restaurant_{order.restaurant.id}_notifications',
            {'type': 'new_order_staff', 'payment_method': order.payment_method, 'table': order.table.table_number}
        )

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class ConfirmPaymentView(APIView):
    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        order.status = 'PAYMENT_VERIFY'
        order.save()
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'restaurant_{order.restaurant.id}_notifications',
            {
                'type': 'payment_alert',
                'table': order.table.table_number,      # ← الآن يحتوي table كما يتوقعه payment_alert
            }
        )
        return Response({"message": "Staff notified"})


@method_decorator(csrf_exempt, name='dispatch')
class RequestWaiterView(APIView):
    def post(self, request):
        table_token = request.data.get('table_token')
        request_type = request.data.get('type')
        table = get_object_or_404(RestaurantTable, unique_token=table_token)
        call = CallWaiter.objects.create(restaurant=table.restaurant, table=table, request_type=request_type)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'restaurant_{table.restaurant.id}_notifications',
            {'type': 'waiter_call', 'call_type': call.request_type, 'table_number': table.table_number}
        )
        return Response({"message": "Success"})


class KitchenOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]   # ← مشكلة #3: كانت مفتوحة بدون auth

    def get_queryset(self):
        restaurant = get_user_restaurant(self.request)
        if restaurant:
            return Order.objects.filter(
                restaurant=restaurant,
                status__in=['PENDING', 'PAYMENT_VERIFY', 'COOKING']
            ).order_by('created_at')
        return Order.objects.none()


class UpdateOrderStatusView(APIView):
    permission_classes = [IsAuthenticated]   # ← مؤمَّن
    def patch(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        new_status = request.data.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'table_{order.table.unique_token}',
                {
                    'type': 'status_update',
                    'order_id': order.id,
                    'new_status': new_status,
                    'message': f'حالة طلبك: {order.get_status_display()}'
                }
            )
            if new_status == 'COOKING':
                async_to_sync(channel_layer.group_send)(
                    f'restaurant_{order.restaurant.id}_kitchen',
                    {'type': 'new_order', 'order': OrderSerializer(order).data}
                )
            elif new_status == 'READY':
                async_to_sync(channel_layer.group_send)(
                    f'restaurant_{order.restaurant.id}_notifications',
                    {'type': 'order_ready', 'table': order.table.table_number, 'order_id': order.id}
                )
            return Response(OrderSerializer(order).data)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class WaiterDashboardView(APIView):
    permission_classes = [IsAuthenticated]   # ← مؤمَّن

    def get(self, request):
        restaurant = get_user_restaurant(request)
        ready_orders = Order.objects.filter(restaurant=restaurant, status='READY')
        active_calls = CallWaiter.objects.filter(restaurant=restaurant, is_resolved=False)
        verifying_payments = Order.objects.filter(restaurant=restaurant, status='PAYMENT_VERIFY')
        return Response({
            'ready_orders': OrderSerializer(ready_orders, many=True).data,
            'verifying_payments': OrderSerializer(verifying_payments, many=True).data,
            'active_calls': [
                {'id': c.id, 'table': c.table.table_number, 'type': c.request_type, 'created_at': c.created_at}
                for c in active_calls
            ]
        })


class ResolveCallView(APIView):
    permission_classes = [IsAuthenticated]   # ← مؤمَّن

    def post(self, request, call_id):
        call = get_object_or_404(CallWaiter, id=call_id)
        call.is_resolved = True
        call.save()
        return Response({"message": "Resolved"})


class OwnerAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]   # ← مؤمَّن
    def get(self, request):
        restaurant = get_user_restaurant(request)
        today = timezone.now().date()

        today_sales = Order.objects.filter(
            restaurant=restaurant,
            created_at__date=today,
            status='DELIVERED'
        ).aggregate(Sum('total_price'))['total_price__sum'] or 0

        total_orders = Order.objects.filter(
            restaurant=restaurant, created_at__date=today
        ).count()

        occupied_tables = Order.objects.filter(
            restaurant=restaurant,
            status__in=['PENDING', 'COOKING', 'READY']
        ).values('table').distinct().count()

        top_items = OrderItem.objects.filter(
            order__restaurant=restaurant
        ).values('menu_item__name_ar').annotate(
            total_qty=Sum('quantity')
        ).order_by('-total_qty')[:5]

        return Response({
            "today_sales": float(today_sales),
            "total_orders": total_orders,
            "occupied_tables": occupied_tables,
            "top_items": [
                {"menu_item__name": item['menu_item__name_ar'] or "عنصر محذوف", "total_qty": item['total_qty']}
                for item in top_items
            ]
        })


# ═══════════════════════════════════════════════════════════
# ─── SUPER ADMIN API (Real Data) ──────────────────────────
# ═══════════════════════════════════════════════════════════

class SuperAdminStatsView(APIView):
    """Real-time stats for the super admin dashboard charts."""
    def get(self, request):
        if not request.user.is_superuser:
            return Response(status=status.HTTP_403_FORBIDDEN)

        today = timezone.now().date()

        # Orders per day for the last 7 days (real data)
        days_labels = []
        orders_per_day = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            count = Order.objects.filter(created_at__date=day).count()
            days_labels.append(day.strftime('%a'))
            orders_per_day.append(count)

        # Subscription breakdown
        basic_count = Restaurant.objects.filter(subscription_type='BASIC').count()
        premium_count = Restaurant.objects.filter(subscription_type='PREMIUM').count()

        # Platform totals
        total_revenue = Order.objects.filter(status='DELIVERED').aggregate(
            Sum('total_price')
        )['total_price__sum'] or 0

        total_active_orders = Order.objects.filter(
            status__in=['PENDING', 'COOKING', 'READY', 'PAYMENT_VERIFY']
        ).count()

        return Response({
            'orders_chart': {
                'labels': days_labels,
                'data': orders_per_day,
            },
            'subscription_chart': {
                'labels': ['Basic', 'Premium'],
                'data': [basic_count, premium_count],
            },
            'totals': {
                'total_revenue': float(total_revenue),
                'total_active_orders': total_active_orders,
            }
        })


# ═══════════════════════════════════════════════════════════
# ─── SUPER ADMIN RESTAURANT MANAGEMENT ───────────────
# ═══════════════════════════════════════════════════════════

class SuperAdminRestaurantsListView(APIView):
    """Returns full list of all restaurants with details."""

    def get(self, request):
        if not request.user.is_superuser:
            return Response(status=status.HTTP_403_FORBIDDEN)

        restaurants = Restaurant.objects.all().order_by('-created_at')
        data = []
        for r in restaurants:
            total_orders = Order.objects.filter(restaurant=r).count()
            total_revenue = Order.objects.filter(
                restaurant=r, status='DELIVERED'
            ).aggregate(Sum('total_price'))['total_price__sum'] or 0

            data.append({
                'id': r.id,
                'name': r.name,
                'slug': r.slug,
                'address': r.address,
                'phone': r.phone,
                'subscription_type': r.subscription_type,
                'subscription_label': r.get_subscription_type_display(),
                'is_active': r.is_active,
                'wallet_number': r.wallet_number or '',
                'instapay_id': r.instapay_id or '',
                'total_orders': total_orders,
                'total_revenue': float(total_revenue),
                'created_at': r.created_at.strftime('%Y-%m-%d'),
            })

        return Response({'restaurants': data})


class SuperAdminAddRestaurantView(APIView):
    """Create a new restaurant from Super Admin dashboard."""

    def post(self, request):
        if not request.user.is_superuser:
            return Response(status=status.HTTP_403_FORBIDDEN)

        name = request.data.get('name', '').strip()
        slug = request.data.get('slug', '').strip()
        address = request.data.get('address', '').strip()
        phone = request.data.get('phone', '').strip()
        subscription_type = request.data.get('subscription_type', 'BASIC')
        wallet_number = request.data.get('wallet_number', '').strip() or None
        instapay_id = request.data.get('instapay_id', '').strip() or None
        lat = request.data.get('latitude') or None
        lng = request.data.get('longitude') or None
        radius = int(request.data.get('location_radius', 50))

        if not name or not slug or not address or not phone:
            return Response(
                {'error': 'الاسم، الـ Slug، العنوان، والهاتف مطلوبون'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Restaurant.objects.filter(slug=slug).exists():
            return Response(
                {'error': f'الـ Slug "{slug}" مستخدم بالفعل، اختر آخر'},
                status=status.HTTP_400_BAD_REQUEST
            )

        restaurant = Restaurant.objects.create(
            name=name,
            slug=slug,
            address=address,
            phone=phone,
            subscription_type=subscription_type,
            wallet_number=wallet_number,
            instapay_id=instapay_id,
            latitude=lat,
            longitude=lng,
            location_radius=radius,
            is_active=True,
        )

        return Response({
            'success': True,
            'message': f'تم إنشاء مطعم "{restaurant.name}" بنجاح',
            'restaurant_id': restaurant.id,
            'slug': restaurant.slug,
        }, status=status.HTTP_201_CREATED)


class SuperAdminToggleRestaurantView(APIView):
    """Toggle is_active for a restaurant."""

    def post(self, request, restaurant_id):
        if not request.user.is_superuser:
            return Response(status=status.HTTP_403_FORBIDDEN)

        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        restaurant.is_active = not restaurant.is_active
        restaurant.save()

        action = 'تفعيل' if restaurant.is_active else 'تعطيل'
        return Response({
            'success': True,
            'is_active': restaurant.is_active,
            'message': f'تم {action} مطعم "{restaurant.name}"',
        })


class SuperAdminRestaurantDetailView(APIView):
    """Get full settings of one restaurant (for the settings tab)."""

    def get(self, request, restaurant_id):
        if not request.user.is_superuser:
            return Response(status=status.HTTP_403_FORBIDDEN)

        r = get_object_or_404(Restaurant, id=restaurant_id)
        return Response({
            'id': r.id,
            'name': r.name,
            'slug': r.slug,
            'address': r.address,
            'phone': r.phone,
            'subscription_type': r.subscription_type,
            'is_active': r.is_active,
            'wallet_number': r.wallet_number or '',
            'instapay_id': r.instapay_id or '',
            'latitude': str(r.latitude) if r.latitude else '',
            'longitude': str(r.longitude) if r.longitude else '',
            'location_radius': r.location_radius,
        })


class SuperAdminUpdateRestaurantView(APIView):
    """Update settings of an existing restaurant."""

    def put(self, request, restaurant_id):
        if not request.user.is_superuser:
            return Response(status=status.HTTP_403_FORBIDDEN)

        r = get_object_or_404(Restaurant, id=restaurant_id)

        name = request.data.get('name', '').strip()
        slug = request.data.get('slug', '').strip()
        address = request.data.get('address', '').strip()
        phone = request.data.get('phone', '').strip()

        if not name or not slug or not address or not phone:
            return Response(
                {'error': 'الاسم، الـ Slug، العنوان، والهاتف مطلوبون'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check slug uniqueness (ignore current restaurant)
        if Restaurant.objects.filter(slug=slug).exclude(id=restaurant_id).exists():
            return Response(
                {'error': f'الـ Slug "{slug}" مستخدم من مطعم آخر'},
                status=status.HTTP_400_BAD_REQUEST
            )

        r.name = name
        r.slug = slug
        r.address = address
        r.phone = phone
        r.subscription_type = request.data.get('subscription_type', r.subscription_type)
        r.wallet_number = request.data.get('wallet_number', '').strip() or None
        r.instapay_id = request.data.get('instapay_id', '').strip() or None
        r.latitude = request.data.get('latitude') or None
        r.longitude = request.data.get('longitude') or None
        r.location_radius = int(request.data.get('location_radius', r.location_radius) or r.location_radius)
        r.is_active = request.data.get('is_active', r.is_active)
        r.save()

        return Response({
            'success': True,
            'message': f'تم تحديث إعدادات "{r.name}" بنجاح',
        })
