from decimal import Decimal
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Product, Cart, CartItem, Order, OrderItem
from .permissions import IsAdmin
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    ProductSerializer,
    OrderSerializer,
)


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


def format_cart(cart):
    items = []
    total = Decimal('0')
    item_count = 0

    for item in cart.items.select_related('product').all():
        subtotal = item.product.price * item.quantity
        total += subtotal
        item_count += item.quantity
        items.append({
            '_id': item.id,
            'product': {
                '_id': item.product.id,
                'title': item.product.title,
                'description': item.product.description,
                'price': float(item.product.price),
                'image': item.product.image,
                'category': item.product.category,
                'stock': item.product.stock,
            },
            'quantity': item.quantity,
            'subtotal': float(subtotal),
        })

    return {'items': items, 'total': float(total), 'itemCount': item_count}


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


# ── Auth ──────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    token = get_tokens(user)
    data = UserSerializer(user).data
    data['token'] = token
    return Response({'success': True, 'data': data}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response(
            {'success': False, 'message': 'Email and password are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'success': False, 'message': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.check_password(password):
        return Response(
            {'success': False, 'message': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token = get_tokens(user)
    data = UserSerializer(user).data
    data['token'] = token
    return Response({'success': True, 'data': data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    return Response({'success': True, 'data': UserSerializer(request.user).data})


# ── Products ──────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def product_list_create(request):
    if request.method == 'POST':
        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({'success': False, 'message': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response({'success': True, 'data': ProductSerializer(product).data}, status=status.HTTP_201_CREATED)

    queryset = Product.objects.all()
    search = request.query_params.get('search', '').strip()
    category = request.query_params.get('category', '').strip().lower()

    if search:
        queryset = queryset.filter(
            Q(title__icontains=search) | Q(description__icontains=search)
        )
    if category and category != 'all':
        queryset = queryset.filter(category=category)

    serializer = ProductSerializer(queryset, many=True)
    return Response({'success': True, 'count': len(serializer.data), 'data': serializer.data})


@api_view(['GET'])
@permission_classes([AllowAny])
def product_categories(request):
    categories = Product.objects.values_list('category', flat=True).distinct()
    return Response({'success': True, 'data': list(categories)})


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def product_detail_update_delete(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'success': False, 'message': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({'success': True, 'data': ProductSerializer(product).data})

    if not request.user.is_authenticated or request.user.role != 'admin':
        return Response({'success': False, 'message': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response({'success': True, 'data': ProductSerializer(product).data})

    product.delete()
    return Response({'success': True, 'message': 'Product deleted successfully.'})


# ── Cart ──────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart_detail(request):
    cart = get_or_create_cart(request.user)
    return Response({'success': True, 'data': format_cart(cart)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cart_add(request):
    product_id = request.data.get('productId')
    quantity = int(request.data.get('quantity', 1))

    if not product_id:
        return Response({'success': False, 'message': 'Product ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if quantity < 1:
        return Response({'success': False, 'message': 'Quantity must be at least 1.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({'success': False, 'message': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

    cart = get_or_create_cart(request.user)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={'quantity': quantity})

    if not created:
        new_qty = item.quantity + quantity
        if product.stock < new_qty:
            return Response({'success': False, 'message': 'Insufficient stock.'}, status=status.HTTP_400_BAD_REQUEST)
        item.quantity = new_qty
        item.save()
    elif product.stock < quantity:
        item.delete()
        return Response({'success': False, 'message': 'Insufficient stock.'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'success': True, 'data': format_cart(cart)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cart_remove(request):
    product_id = request.data.get('productId')
    quantity = request.data.get('quantity')

    if not product_id:
        return Response({'success': False, 'message': 'Product ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

    cart = get_or_create_cart(request.user)
    try:
        item = CartItem.objects.get(cart=cart, product_id=product_id)
    except CartItem.DoesNotExist:
        return Response({'success': False, 'message': 'Item not in cart.'}, status=status.HTTP_404_NOT_FOUND)

    if quantity and int(quantity) > 0:
        item.quantity -= int(quantity)
        if item.quantity <= 0:
            item.delete()
        else:
            item.save()
    else:
        item.delete()

    return Response({'success': True, 'data': format_cart(cart)})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def cart_update(request):
    product_id = request.data.get('productId')
    quantity = int(request.data.get('quantity', 0))

    if not product_id:
        return Response({'success': False, 'message': 'Product ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if quantity < 1:
        return Response({'success': False, 'message': 'Quantity must be at least 1.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({'success': False, 'message': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

    if product.stock < quantity:
        return Response({'success': False, 'message': 'Insufficient stock.'}, status=status.HTTP_400_BAD_REQUEST)

    cart = get_or_create_cart(request.user)
    try:
        item = CartItem.objects.get(cart=cart, product_id=product_id)
    except CartItem.DoesNotExist:
        return Response({'success': False, 'message': 'Item not in cart.'}, status=status.HTTP_404_NOT_FOUND)

    item.quantity = quantity
    item.save()
    return Response({'success': True, 'data': format_cart(cart)})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cart_clear(request):
    cart = get_or_create_cart(request.user)
    cart.items.all().delete()
    return Response({'success': True, 'data': format_cart(cart)})


# ── Orders ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def order_create(request):
    cart = get_or_create_cart(request.user)
    items = cart.items.select_related('product').all()

    if not items:
        return Response({'success': False, 'message': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

    total_price = Decimal('0')
    order_items = []

    for item in items:
        product = item.product
        if product.stock < item.quantity:
            return Response(
                {'success': False, 'message': f'Insufficient stock for {product.title}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        subtotal = product.price * item.quantity
        total_price += subtotal
        order_items.append({
            'product': product,
            'title': product.title,
            'price': product.price,
            'quantity': item.quantity,
            'image': product.image,
        })

    order = Order.objects.create(user=request.user, total_price=total_price, status='pending')

    for oi in order_items:
        OrderItem.objects.create(order=order, **oi)
        product = oi['product']
        product.stock -= oi['quantity']
        product.save()

    cart.items.all().delete()
    order = Order.objects.prefetch_related('products', 'user').get(pk=order.pk)
    return Response({'success': True, 'data': OrderSerializer(order).data}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_user_list(request):
    orders = Order.objects.filter(user=request.user).prefetch_related('products', 'user')
    serializer = OrderSerializer(orders, many=True)
    return Response({'success': True, 'count': len(serializer.data), 'data': serializer.data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def order_all_list(request):
    orders = Order.objects.prefetch_related('products', 'user').all()
    serializer = OrderSerializer(orders, many=True)
    return Response({'success': True, 'count': len(serializer.data), 'data': serializer.data})


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def order_update_status(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'success': False, 'message': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    valid = ['pending', 'shipped', 'delivered', 'cancelled']
    if new_status not in valid:
        return Response(
            {'success': False, 'message': f'Status must be one of: {", ".join(valid)}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    order.status = new_status
    order.save()
    order = Order.objects.prefetch_related('products', 'user').get(pk=order.pk)
    return Response({'success': True, 'data': OrderSerializer(order).data})


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    return Response({'success': True, 'message': 'API is running'})


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        'success': True,
        'message': 'ShopLead API is running',
        'endpoints': {
            'health': '/api/health',
            'auth': '/api/auth/login',
            'products': '/api/products',
        },
    })
