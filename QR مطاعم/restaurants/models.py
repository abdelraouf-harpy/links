from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
import uuid

class Restaurant(models.Model):
    SUBSCRIPTION_CHOICES = [
        ('BASIC', 'Menu Only (Display Only)'),
        ('PREMIUM', 'Full System (Real-time Ordering)'),
    ]
    
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, help_text="Used for the restaurant's unique URL")
    logo = models.ImageField(upload_to='restaurant_logos/', null=True, blank=True)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    
    # Digital Payment Info
    wallet_number = models.CharField(max_length=20, blank=True, null=True, help_text="Vodafone Cash / etc")
    instapay_id = models.CharField(max_length=100, blank=True, null=True, help_text="InstaPay Username")
    
    # Geofencing (Anti-Fraud)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_radius = models.PositiveIntegerField(default=50, help_text="Allowed radius in meters")

    subscription_type = models.CharField(
        max_length=10, 
        choices=SUBSCRIPTION_CHOICES, 
        default='BASIC'
    )
    
    # Subscription Management
    subscription_start_date = models.DateTimeField(null=True, blank=True)
    subscription_end_date = models.DateTimeField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class RestaurantUser(models.Model):
    ROLE_CHOICES = [
        ('OWNER', 'Owner'),
        ('MANAGER', 'Manager'),
        ('CHEF', 'Chef'),
        ('WAITER', 'Waiter'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='restaurant_profile')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='staff')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.role} ({self.restaurant.name})"

class MenuCategory(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='categories')
    name_ar = models.CharField(max_length=100, default='')
    name_en = models.CharField(max_length=100, default='')
    image = models.ImageField(upload_to='category_images/', null=True, blank=True)
    order = models.PositiveIntegerField(default=0, help_text="Display order")

    class Meta:
        verbose_name_plural = "Menu Categories"
        ordering = ['order']

    def __str__(self):
        return f"{self.name_ar} / {self.name_en} - {self.restaurant.name}"

class MenuItem(models.Model):
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, related_name='items')
    name_ar = models.CharField(max_length=255, default='')
    name_en = models.CharField(max_length=255, default='')
    description_ar = models.TextField(blank=True, default='')
    description_en = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='menu_items/', null=True, blank=True)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name_ar} / {self.name_en}"

class MenuItemExtra(models.Model):
    item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='extras')
    name_ar = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.name_ar} (+{self.price} ج.م)"

class RestaurantTable(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='tables')
    table_number = models.CharField(max_length=20)
    unique_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    def __str__(self):
        return f"Table {self.table_number} - {self.restaurant.name}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending (New)'),
        ('PAYMENT_VERIFY', 'Waiting Payment Verification'),
        ('COOKING', 'Cooking'),
        ('READY', 'Ready for Delivery'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('CASH', 'Cash'),
        ('DIGITAL', 'Digital (Wallet/InstaPay)'),
        ('CARD', 'Credit/Debit Card (Mock)'),
    ]
    
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='orders')
    table = models.ForeignKey(RestaurantTable, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='CASH')
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    general_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.restaurant.name} (Table {self.table.table_number})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price_at_order = models.DecimalField(max_digits=10, decimal_places=2)
    item_notes = models.TextField(blank=True, null=True) # Per-item notes (e.g., "No onions")
    selected_extras = models.ManyToManyField(MenuItemExtra, blank=True)

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name_ar if self.menu_item else 'Deleted Item'}"

class CallWaiter(models.Model):
    TYPE_CHOICES = [
        ('SERVICE', 'Request Service'),
        ('BILL', 'Request Bill'),
    ]
    
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    table = models.ForeignKey(RestaurantTable, on_delete=models.CASCADE)
    request_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.request_type} at Table {self.table.table_number}"
