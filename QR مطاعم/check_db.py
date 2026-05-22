import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from restaurants.models import Restaurant, RestaurantTable, RestaurantUser
from django.contrib.auth import get_user_model
User = get_user_model()

print("=== Users ===")
for u in User.objects.all():
    role = ""
    try:
        role = u.restaurant_profile.role
    except:
        pass
    print(f"  username={u.username} | superuser={u.is_superuser} | role={role}")

print("\n=== Restaurants ===")
for r in Restaurant.objects.all():
    print(f"  ID={r.id} | Name={r.name} | Slug={r.slug} | Active={r.is_active}")

print("\n=== Tables (first 10) ===")
for t in RestaurantTable.objects.all()[:10]:
    print(f"  Table={t.table_number} | Token={t.unique_token} | Restaurant={t.restaurant.slug}")
