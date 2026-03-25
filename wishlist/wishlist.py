from decimal import Decimal
from django.conf import settings
from main.models import Product

class Wishlist:
    def __init__(self, request):
        """
        Инициализация корзины избранного.
        """
        self.session = request.session
        wishlist = self.session.get(settings.WISHLIST_SESSION_ID)
        if not wishlist:
            # save an empty wishlist in the session
            wishlist = self.session[settings.WISHLIST_SESSION_ID] = []
        self.wishlist = wishlist

    def add(self, product):
        """
        Добавить продукт в избранное.
        """
        product_id = str(product.id)
        if product_id not in self.wishlist:
            self.wishlist.append(product_id)
            self.save()

    def remove(self, product):
        """
        Удалить продукт из избранного.
        """
        product_id = str(product.id)
        if product_id in self.wishlist:
            self.wishlist.remove(product_id)
            self.save()

    def save(self):
        # Обновление сессии
        self.session.modified = True

    def __iter__(self):
        """
        Перебор элементов в избранном и получение продуктов из базы данных.
        """
        product_ids = self.wishlist
        products = Product.objects.filter(id__in=product_ids)
        for product in products:
            yield product

    def __len__(self):
        """
        Подсчет количества элементов в избранном.
        """
        return len(self.wishlist)

    def clear(self):
        # удаление корзины из сессии
        del self.session[settings.WISHLIST_SESSION_ID]
        self.save()

    @property
    def count(self):
        return len(self)
