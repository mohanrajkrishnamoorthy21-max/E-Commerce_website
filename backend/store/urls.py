from django.urls import path
from . import views

urlpatterns = [
    path('health', views.health),

    # Auth
    path('auth/register', views.register),
    path('auth/login', views.login),
    path('auth/me', views.get_me),

    # Products
    path('products', views.product_list_create),
    path('products/categories', views.product_categories),
    path('products/<int:pk>', views.product_detail_update_delete),

    # Cart
    path('cart', views.cart_detail),
    path('cart/add', views.cart_add),
    path('cart/remove', views.cart_remove),
    path('cart/update', views.cart_update),
    path('cart/clear', views.cart_clear),

    # Orders
    path('orders', views.order_create),
    path('orders/user', views.order_user_list),
    path('orders/all', views.order_all_list),
    path('orders/<int:pk>/status', views.order_update_status),
]
