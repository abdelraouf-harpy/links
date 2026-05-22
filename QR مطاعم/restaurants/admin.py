from django.contrib import admin
from .models import Restaurant, RestaurantUser, MenuCategory, MenuItem, RestaurantTable, Order, OrderItem, CallWaiter, MenuItemExtra

class RestaurantUserInline(admin.TabularInline):
    model = RestaurantUser
    extra = 1

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'subscription_type', 'is_active', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [RestaurantUserInline]

@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ('name_ar', 'name_en', 'restaurant', 'order')
    list_filter = ('restaurant',)

class MenuItemExtraInline(admin.TabularInline):
    model = MenuItemExtra
    extra = 1

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name_ar', 'name_en', 'category', 'price', 'is_available')
    list_filter = ('category__restaurant', 'category', 'is_available')
    search_fields = ('name_ar', 'name_en', 'description_ar', 'description_en')
    inlines = [MenuItemExtraInline]

@admin.register(RestaurantTable)
class RestaurantTableAdmin(admin.ModelAdmin):
    list_display = ('table_number', 'restaurant', 'unique_token')
    list_filter = ('restaurant',)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'restaurant', 'table', 'status', 'total_price', 'created_at')
    list_filter = ('restaurant', 'status')
    inlines = [OrderItemInline]

@admin.register(CallWaiter)
class CallWaiterAdmin(admin.ModelAdmin):
    list_display = ('request_type', 'restaurant', 'table', 'is_resolved', 'created_at')
    list_filter = ('restaurant', 'is_resolved')

@admin.register(MenuItemExtra)
class MenuItemExtraAdmin(admin.ModelAdmin):
    list_display = ('name_ar', 'item', 'price')
