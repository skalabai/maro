from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from main.models import Product
from .wishlist import Wishlist
from cart.cart import Cart
from django.http import JsonResponse

@require_POST
def wishlist_add(request, product_id):
    wishlist = Wishlist(request)
    product = get_object_or_404(Product, id=product_id)
    wishlist.add(product=product)
    
    # Support AJAX requests
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({'success': True, 'count': len(wishlist)})
        
    return redirect('wishlist:wishlist_detail')

@require_POST
def wishlist_remove(request, product_id):
    wishlist = Wishlist(request)
    product = get_object_or_404(Product, id=product_id)
    wishlist.remove(product)
    
    # Support AJAX requests
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({'success': True, 'count': len(wishlist)})
        
    return redirect('wishlist:wishlist_detail')

def wishlist_detail(request):
    wishlist = Wishlist(request)
    products = list(wishlist)
    
    # Get cart product IDs
    cart = Cart(request)
    cart_product_ids = [int(p_id) for p_id in cart.cart.keys()]
    
    context = {
        'wishlist': products,
        'cart_product_ids': cart_product_ids
    }
    
    # Render partial if requested via AJAX or modal param
    if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.GET.get('modal') == 'true':
        return render(request, 'wishlist/wishlist_content.html', context)
        
    return render(request, 'wishlist/wishlist_detail.html', context)
