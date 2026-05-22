from rest_framework import serializers
from .models import Restaurant, MenuCategory, MenuItem, RestaurantTable, Order, OrderItem, RestaurantUser, MenuItemExtra

class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = '__all__'

class MenuItemExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItemExtra
        fields = ['id', 'name_ar', 'name_en', 'price']

class MenuItemSerializer(serializers.ModelSerializer):
    extras = MenuItemExtraSerializer(many=True, read_only=True)
    
    class Meta:
        model = MenuItem
        fields = ['id', 'category', 'name_ar', 'name_en', 'description_ar', 'description_en', 'price', 'image', 'is_available', 'is_featured', 'extras']

class MenuCategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = MenuCategory
        fields = ['id', 'name_ar', 'name_en', 'image', 'order', 'items']

class RestaurantTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantTable
        fields = ['id', 'table_number', 'unique_token']

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name_ar = serializers.SerializerMethodField()
    menu_item_name_en = serializers.SerializerMethodField()
    selected_extras = MenuItemExtraSerializer(many=True, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name_ar', 'menu_item_name_en', 'quantity', 'price_at_order', 'item_notes', 'selected_extras']

    def get_menu_item_name_ar(self, obj):
        return obj.menu_item.name_ar if obj.menu_item else 'عنصر محذوف'

    def get_menu_item_name_en(self, obj):
        return obj.menu_item.name_en if obj.menu_item else 'Deleted Item'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    table_number = serializers.CharField(source='table.table_number', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'table', 'table_number', 'status', 'payment_method', 'total_price', 'general_notes', 'items', 'created_at']
