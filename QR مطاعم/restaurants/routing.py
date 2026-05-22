from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/kitchen/<int:restaurant_id>/', consumers.OrderConsumer.as_asgi()),
    path('ws/notifications/<int:restaurant_id>/', consumers.NotificationConsumer.as_asgi()),
    path('ws/order-status/<uuid:table_token>/', consumers.CustomerOrderConsumer.as_asgi()),
]
