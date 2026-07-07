from django.core.management.base import BaseCommand
from store.models import User, Product


PRODUCTS = [
    {
        'title': 'Wireless Bluetooth Headphones',
        'description': 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality.',
        'price': 79.99,
        'image': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        'category': 'electronics',
        'stock': 50,
    },
    {
        'title': 'Smart Watch Pro',
        'description': 'Feature-rich smartwatch with heart rate monitor, GPS tracking, and 7-day battery life. Water resistant up to 50m.',
        'price': 199.99,
        'image': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
        'category': 'electronics',
        'stock': 30,
    },
    {
        'title': 'Classic Leather Jacket',
        'description': 'Genuine leather jacket with premium stitching. Timeless style that pairs with any outfit. Available in classic black.',
        'price': 149.99,
        'image': 'https://images.unsplash.com/photo-1551028711-00167b16eac5?w=500&h=500&fit=crop',
        'category': 'fashion',
        'stock': 25,
    },
    {
        'title': 'Running Sneakers',
        'description': 'Lightweight running shoes with responsive cushioning and breathable mesh upper. Perfect for daily runs and gym workouts.',
        'price': 89.99,
        'image': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
        'category': 'fashion',
        'stock': 60,
    },
    {
        'title': 'Organic Coffee Beans',
        'description': 'Single-origin Arabica coffee beans, medium roast. Rich flavor notes of chocolate and caramel. 1kg bag.',
        'price': 24.99,
        'image': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55c?w=500&h=500&fit=crop',
        'category': 'food',
        'stock': 100,
    },
    {
        'title': 'Stainless Steel Water Bottle',
        'description': 'Insulated 32oz water bottle keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and leak-proof.',
        'price': 29.99,
        'image': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
        'category': 'home',
        'stock': 75,
    },
    {
        'title': 'Yoga Mat Premium',
        'description': 'Extra thick 6mm yoga mat with non-slip surface. Includes carrying strap. Eco-friendly TPE material.',
        'price': 39.99,
        'image': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop',
        'category': 'sports',
        'stock': 40,
    },
    {
        'title': 'Mechanical Keyboard',
        'description': 'RGB backlit mechanical keyboard with Cherry MX switches. Aluminum frame with programmable macro keys.',
        'price': 129.99,
        'image': 'https://images.unsplash.com/photo-1511467687858-7d0a625ad9c3?w=500&h=500&fit=crop',
        'category': 'electronics',
        'stock': 35,
    },
    {
        'title': 'Ceramic Plant Pot Set',
        'description': 'Set of 3 minimalist ceramic plant pots in varying sizes. Includes drainage holes and saucers.',
        'price': 34.99,
        'image': 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&h=500&fit=crop',
        'category': 'home',
        'stock': 45,
    },
    {
        'title': 'Fitness Resistance Bands',
        'description': 'Set of 5 resistance bands with different tension levels. Includes door anchor, handles, and carry bag.',
        'price': 19.99,
        'image': 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&h=500&fit=crop',
        'category': 'sports',
        'stock': 80,
    },
    {
        'title': 'Denim Slim Fit Jeans',
        'description': 'Classic slim fit denim jeans with stretch comfort. Durable construction with modern styling.',
        'price': 59.99,
        'image': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
        'category': 'fashion',
        'stock': 55,
    },
    {
        'title': 'Portable Bluetooth Speaker',
        'description': 'Waterproof portable speaker with 360° sound, 20-hour playtime, and built-in microphone for calls.',
        'price': 49.99,
        'image': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
        'category': 'electronics',
        'stock': 65,
    },
]


class Command(BaseCommand):
    help = 'Seed database with demo users and products'

    def handle(self, *args, **options):
        Product.objects.all().delete()
        User.objects.filter(email__in=['admin@shop.com', 'user@shop.com']).delete()

        User.objects.create_user('admin@shop.com', 'Admin User', 'admin123', role='admin')
        User.objects.create_user('user@shop.com', 'Demo User', 'user123', role='user')

        for p in PRODUCTS:
            Product.objects.create(**p)

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
        self.stdout.write('Admin: admin@shop.com / admin123')
        self.stdout.write('User:  user@shop.com / user123')
