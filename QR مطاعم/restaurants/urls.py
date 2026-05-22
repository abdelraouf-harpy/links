from django.urls import path
from .views import (
    # Auth
    staff_login_view, staff_logout_view,
    # Template views
    customer_menu_view, kitchen_dashboard_view,
    waiter_dashboard_view, owner_dashboard_view,
    generate_qr_view, print_all_qrs_view, super_admin_dashboard_view,
    # Customer APIs
    RestaurantMenuView, PlaceOrderView, ConfirmPaymentView, RequestWaiterView,
    RestaurantTablesView,
    # Kitchen/Staff APIs
    KitchenOrderListView, UpdateOrderStatusView,
    # Waiter/Owner APIs
    WaiterDashboardView, ResolveCallView, OwnerAnalyticsView,
    # Super Admin APIs
    SuperAdminStatsView,
    SuperAdminRestaurantsListView,
    SuperAdminAddRestaurantView,
    SuperAdminToggleRestaurantView,
    SuperAdminRestaurantDetailView,
    SuperAdminUpdateRestaurantView,
)

urlpatterns = [
    # ─── Auth ────────────────────────────────────────────
    path('staff/login/', staff_login_view, name='staff-login'),
    path('staff/logout/', staff_logout_view, name='staff-logout'),

    # ─── Customer APIs ───────────────────────────────────
    path('api/menu/<slug:slug>/', RestaurantMenuView.as_view(), name='customer-menu'),
    path('api/tables/<slug:slug>/', RestaurantTablesView.as_view(), name='restaurant-tables'),
    path('api/order/place/', PlaceOrderView.as_view(), name='place-order'),
    path('api/order/<int:order_id>/confirm-payment/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('api/call-waiter/', RequestWaiterView.as_view(), name='call-waiter'),

    # ─── Kitchen/Staff APIs ──────────────────────────────
    path('api/kitchen/orders/', KitchenOrderListView.as_view(), name='kitchen-orders'),
    path('api/order/<int:order_id>/update-status/', UpdateOrderStatusView.as_view(), name='update-order-status'),

    # ─── Waiter APIs ─────────────────────────────────────
    path('api/waiter/dashboard/', WaiterDashboardView.as_view(), name='waiter-dashboard'),
    path('api/waiter/call/<int:call_id>/resolve/', ResolveCallView.as_view(), name='resolve-call'),

    # ─── Owner APIs ──────────────────────────────────────
    path('api/owner/analytics/', OwnerAnalyticsView.as_view(), name='owner-analytics'),

    # ─── Super Admin API ─────────────────────────────────
    path('api/saas/stats/', SuperAdminStatsView.as_view(), name='super-admin-stats'),
    path('api/saas/restaurants/', SuperAdminRestaurantsListView.as_view(), name='saas-restaurants-list'),
    path('api/saas/restaurant/add/', SuperAdminAddRestaurantView.as_view(), name='saas-restaurant-add'),
    path('api/saas/restaurant/<int:restaurant_id>/toggle/', SuperAdminToggleRestaurantView.as_view(), name='saas-restaurant-toggle'),
    path('api/saas/restaurant/<int:restaurant_id>/', SuperAdminRestaurantDetailView.as_view(), name='saas-restaurant-detail'),
    path('api/saas/restaurant/<int:restaurant_id>/update/', SuperAdminUpdateRestaurantView.as_view(), name='saas-restaurant-update'),

    # ─── Frontend Pages ───────────────────────────────────
    path('m/<slug:slug>/', customer_menu_view, name='customer-menu-ui'),
    path('kitchen/dashboard/', kitchen_dashboard_view, name='kitchen-dashboard-ui'),
    path('waiter/dashboard/ui/', waiter_dashboard_view, name='waiter-dashboard-ui'),
    path('owner/dashboard/ui/', owner_dashboard_view, name='owner-dashboard-ui'),
    path('saas/admin/', super_admin_dashboard_view, name='super-admin-dashboard'),
    path('table/<uuid:table_token>/qr/', generate_qr_view, name='generate-qr'),
    path('owner/print-qrs/', print_all_qrs_view, name='print-qrs'),
]
