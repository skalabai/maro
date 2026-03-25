from django.shortcuts import redirect, render,get_object_or_404
from cart.forms import CartAddProductForm
from .models import Product, Category, ExtraImage, HeroImage
from wishlist.wishlist import Wishlist


def index(request):
    products = Product.objects.prefetch_related('images').all()
    categories = Category.objects.all()
    wishlist = Wishlist(request)
    hero_images = HeroImage.objects.filter(is_active=True).order_by('order')[:3]
    return render(request, 'products/index.html', context={
        'products': products,
        'categories': categories,
        'hero_images': hero_images
    })

def show_product(request, product_slug):
    product = get_object_or_404(Product, slug=product_slug)
    images = ExtraImage.objects.filter(product=product)
    form = CartAddProductForm()
    
    wishlist = Wishlist(request)
    is_in_wishlist = str(product.id) in wishlist.wishlist
    
    # 4 Recommended products (from same category if possible)
    recommended_products = Product.objects.filter(cat=product.cat).exclude(id=product.id).order_by('?')[:4]
    
    # If less than 4, fill with others
    if len(recommended_products) < 4:
        needed = 4 - len(recommended_products)
        existing_ids = [p.id for p in recommended_products] + [product.id]
        more_products = Product.objects.exclude(id__in=existing_ids).order_by('?')[:needed]
        recommended_products = list(recommended_products) + list(more_products)
    
    return render(request, 'products/product_info.html', context={
        'product': product,
        'images': images,
        'form': form,
        'is_in_wishlist': is_in_wishlist,
        'recommended_products': recommended_products
    })

def privacy_policy(request):
    return render(request, 'privacy_policy.html')

def returns_policy(request):
    return render(request, 'returns_policy.html')

