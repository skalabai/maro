from django.conf import settings
from main.models import Product

from decimal import Decimal

class Cart:
    def __init__(self,request):
        self.session = request.session
        cart = self.session.get(settings.CART_SESSION_ID)
        if not cart:
            cart = self.session[settings.CART_SESSION_ID] = {}
        self.cart = cart
    
    def add(self,product,quantity = 1,override_quantity = False):
        product_id = str(product.id)
        if product_id not in self.cart:
            self.cart[product_id]={'quantity':0,'price':str(product.price)}
            
        if override_quantity:
            self.cart[product_id]['quantity'] = quantity
        else:
            self.cart[product_id]['quantity'] += quantity
            
        # Enforce max quantity limit
        if self.cart[product_id]['quantity'] > 10:
            self.cart[product_id]['quantity'] = 10
            
        self.save()
    
    def save(self):
        self.session.modified = True
    
    def remove(self,product):
        product_id = str(product.id)
        if product_id in self.cart:
            del self.cart[product_id]
            self.save()
    
    def __iter__(self):
        product_ids = list(self.cart.keys())
        products = Product.objects.filter(id__in=product_ids)
        
        products_dict = {str(product.id): product for product in products}
        
        # Clean up cart: remove items that no longer exist in the DB
        cart_needs_save = False
        for product_id in product_ids:
            if product_id not in products_dict:
                del self.cart[product_id]
                cart_needs_save = True
                
        if cart_needs_save:
            self.save()
            
        # Create a deep copy of the cart items to avoid modifying the session
        cart = self.cart.copy()
        for key in cart:
            cart[key] = cart[key].copy()
            cart[key]['product'] = products_dict.get(key)

        for item in cart.values():
            item['price'] = Decimal(item['price'])
            item['total_price'] = item['price'] * item['quantity']
            yield item
        
    def __len__(self):
        return sum(item['quantity'] for item in self.cart.values())
    
    def get_total_price(self):
        return sum(Decimal(item['price']) * item['quantity'] for item in self.cart.values())
    
    def clear(self):
        del self.session[settings.CART_SESSION_ID]
        self.save()
        
    def get_product(self, product_id):
        product_id = str(product_id)
        if product_id in self.cart:
            return self.cart[product_id]
        return None

    @property
    def count(self):
        return len(self)
