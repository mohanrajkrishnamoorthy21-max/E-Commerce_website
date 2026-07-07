from rest_framework import serializers
from .models import User, Product, CartItem, Order, OrderItem


class UserSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = User
        fields = ['_id', 'name', 'email', 'role']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['name', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class ProductSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source='id', read_only=True)
    price = serializers.FloatField()

    class Meta:
        model = Product
        fields = ['_id', 'title', 'description', 'price', 'image', 'category', 'stock', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate_category(self, value):
        return value.lower().strip()


class CartProductSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source='id')

    class Meta:
        model = Product
        fields = ['_id', 'title', 'description', 'price', 'image', 'category', 'stock']


class CartItemSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source='id', read_only=True)
    product = CartProductSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['_id', 'product', 'quantity', 'subtotal']

    def get_subtotal(self, obj):
        return float(obj.product.price * obj.quantity)


class OrderUserSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = User
        fields = ['_id', 'name', 'email']


class OrderItemSerializer(serializers.ModelSerializer):
    price = serializers.FloatField()

    class Meta:
        model = OrderItem
        fields = ['title', 'price', 'quantity', 'image', 'product']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.product_id:
            data['product'] = instance.product_id
        return data


class OrderSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source='id', read_only=True)
    totalPrice = serializers.FloatField(source='total_price', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    user = OrderUserSerializer(read_only=True)
    products = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['_id', 'user', 'products', 'totalPrice', 'status', 'createdAt']
