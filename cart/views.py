from django.shortcuts import render, redirect, get_object_or_404
from main.models import Product
from .cart import Cart
from .forms import CartAddProductForm
from django.views.decorators.http import require_POST


from django.http import JsonResponse
from decimal import Decimal

@require_POST
def cart_add(request, product_slug):
    """
    View to add a product to the cart or update its quantity.
    """
    cart = Cart(request)
    product = get_object_or_404(Product, slug=product_slug)
    form = CartAddProductForm(request.POST) 
    
    if form.is_valid():
        cd = form.cleaned_data
        cart.add(
            product=product,
            quantity=cd['quantity'],
            override_quantity=cd['override']
        )
        
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            product_id = str(product.id)
            item = cart.cart[product_id]
            item_price = Decimal(item['price'])
            item_total_price = item_price * item['quantity']
            
            return JsonResponse({
                'success': True,
                'cart_count': cart.count,
                'cart_total_price': float(cart.get_total_price()),
                'item_total_price': float(item_total_price),
                'item_quantity': item['quantity']
            })

    return redirect('cart:cart_show')

def cart_show(request):
    cart = Cart(request)
    for item in cart:
        item['update_quantity_form'] = CartAddProductForm(
            initial={
                'quantity': item['quantity'],
                'override': True
            }
        )
    return render(request, 'cart/cart_detail.html', {'cart': cart})

@require_POST
def cart_update(request, product_slug):
    """
    Reuse logic but force override=True for updates from the cart page.
    Actually, the cart page form already sends 'override': True in initial data, 
    but the view logic in original cart_update was identical to cart_add except for the hardcoded override=True comment.
    Since the form field 'override' handles this, we can just redirect to cart_add or keep this simple wrapper if we want distinct URLs.
    Let's keep it simple: cart_update essentially just calls the same add logic but might need to ensure override is True if the form doesn't carry it (though it does).
    In the original code, cart_update was manually passing override_quantity=True ignoring cd['override'].
    Let's assume the form in the template sets it correctly, or we can enforce it.
    """
    cart = Cart(request)
    product = get_object_or_404(Product, slug=product_slug)
    form = CartAddProductForm(request.POST)
    if form.is_valid():
        cd = form.cleaned_data
        cart.add(
            product=product,
            quantity=cd['quantity'],
            override_quantity=True
        )
    return redirect('cart:cart_show')

@require_POST
def cart_remove(request, product_slug):
    cart = Cart(request)
    product = get_object_or_404(Product, slug=product_slug)
    cart.remove(product)
    return redirect('cart:cart_show')
