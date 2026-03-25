from django.db import models
from django.urls import reverse


class Category(models.Model):
    name = models.CharField(max_length=255,db_index=True)
    slug = models.CharField(max_length=300, unique=True, db_index=True)
    def __str__(self):
        return self.name
    

class ProductGroup(models.Model):
    name = models.CharField(max_length=255, db_index=True, verbose_name="Название модели/группы")
    
    def __str__(self):
        return self.name
    class Meta:
        verbose_name = 'Группа товаров (Модель)'
        verbose_name_plural = 'Группы товаров (Модели)'


class Product(models.Model):
    cat=models.ForeignKey(Category,related_name='products',on_delete=models.CASCADE)
    group = models.ForeignKey(ProductGroup, related_name='variants', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Группа товаров (Модель)")
    color_name = models.CharField(max_length=100, blank=True, verbose_name="Название цвета")
    color_hex = models.CharField(max_length=7, default="#000000", help_text="HEX код цвета (например, #000000)", verbose_name="Код цвета")
    title = models.CharField(max_length=255,db_index=True)
    slug = models.CharField(max_length=300, unique=True, blank=True)
    price = models.DecimalField(max_digits=10,decimal_places=2)
    description = models.TextField(blank=True)
    width = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    length = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    depth = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    material = models.CharField(max_length=255,default='-')
    weight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    quantity = models.IntegerField(default=1)
    image = models.ImageField(upload_to='products/%Y/%m/%d',blank=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    def get_extra_images(self):
        """Возвращает список дополнительных изображений"""
        return self.images.all()  # related_name='images'
    
    def __str__(self):
        return self.title


    def get_absolute_url(self):
        return reverse("product", kwargs={"product_slug": self.slug})


class ExtraImage(models.Model):
    product = models.ForeignKey(Product,related_name='images',on_delete=models.CASCADE)
    extra_image = models.ImageField(upload_to='products/%Y/%m/%d',blank=True)


class HeroImage(models.Model):
    image = models.ImageField(upload_to='hero_images/', verbose_name="Изображение")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок вывода")
    is_active = models.BooleanField(default=True, verbose_name="Активно")
    link = models.URLField(blank=True, verbose_name="Ссылка при клике (необязательно)")
    
    class Meta:
        verbose_name = 'Изображение на главном экране'
        verbose_name_plural = 'Изображения на главном экране'
        ordering = ['order', '-id']
        
    def __str__(self):
        return f"Изображение {self.id}"