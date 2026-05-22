import json
from channels.generic.websocket import AsyncWebsocketConsumer


class OrderConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for kitchen — receives new orders in real-time."""

    async def connect(self):
        self.restaurant_id = self.scope['url_route']['kwargs']['restaurant_id']
        self.room_group_name = f'restaurant_{self.restaurant_id}_kitchen'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def new_order(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_order',
            'order': event['order']
        }))


class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for waiter — receives all staff notifications."""

    async def connect(self):
        self.restaurant_id = self.scope['url_route']['kwargs']['restaurant_id']
        self.room_group_name = f'restaurant_{self.restaurant_id}_notifications'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # ── مُنجزة من قبل ─────────────────────────────────────

    async def order_ready(self, event):
        """طلب جاهز للتسليم — يُرسله المطبخ عند تغيير الحالة لـ READY."""
        await self.send(text_data=json.dumps({
            'type': 'order_ready',
            'message': f'الأوردر #{event["order_id"]} للطاولة {event["table_number"]} جاهز!',
            'order_id': event['order_id'],
            'table_number': event['table_number'],
        }))

    async def waiter_call(self, event):
        """نداء النادل من العميل (خدمة أو فاتورة)."""
        await self.send(text_data=json.dumps({
            'type': 'waiter_call',
            'message': f'طاولة {event["table_number"]} تطلب {event["call_type"]}',
            'call_type': event['call_type'],
            'table_number': event['table_number'],
        }))

    # ── مُضافة الآن (كانت مفقودة) ─────────────────────────

    async def new_order_staff(self, event):
        """
        طلب جديد وصل من العميل — يُرسله PlaceOrderView.
        يُنبّه النادل فوراً عند وضع أي طلب (كاش أو رقمي).
        """
        await self.send(text_data=json.dumps({
            'type': 'new_order_staff',
            'message': f'طلب جديد من طاولة {event["table"]} — طريقة الدفع: {event["payment_method"]}',
            'payment_method': event['payment_method'],
            'table': event['table'],
        }))

    async def payment_alert(self, event):
        """
        تنبيه تأكيد دفع رقمي — يُرسله ConfirmPaymentView.
        يطلب النادل التحقق من الدفع عبر المحفظة / InstaPay.
        """
        await self.send(text_data=json.dumps({
            'type': 'payment_alert',
            'message': f'⚠️ طاولة {event["table"]} تطلب تأكيد الدفع الرقمي',
            'table': event['table'],
        }))

    async def payment_verification_required(self, event):
        """تنبيه تفصيلي لتأكيد الدفع مع قيمة الطلب."""
        await self.send(text_data=json.dumps({
            'type': 'payment_verify',
            'message': event['message'],
            'order_id': event['order_id'],
            'table_number': event['table_number'],
            'total_price': event['total_price'],
        }))


class CustomerOrderConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer للعميل — يستقبل تحديثات حالة طلبه."""

    async def connect(self):
        self.table_token = self.scope['url_route']['kwargs']['table_token']
        self.room_group_name = f'table_{self.table_token}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def status_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'order_id': event['order_id'],
            'new_status': event['new_status'],
            'message': event['message'],
        }))
