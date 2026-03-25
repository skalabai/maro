from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import Category, ProductGroup, Product, ExtraImage, HeroImage

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug')
    list_display_links = ('id', 'name')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(ProductGroup)
class ProductGroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    list_display_links = ('id', 'name')
    search_fields = ('name',)

class ExtraImageInline(admin.TabularInline):
    model = ExtraImage
    extra = 1
    readonly_fields = ('image_preview',)

    @admin.display(description="Превью")
    def image_preview(self, obj):
        if obj.extra_image:
            return mark_safe(f'<img src="{obj.extra_image.url}" style="height: 50px; border-radius: 5px; border: 1px solid #ccc;" />')
        return "-"

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'cat', 'group', 'color_display', 'price', 'quantity', 'created')
    list_display_links = ('id', 'title')
    list_filter = ('group', 'cat', 'created')
    search_fields = ('title', 'description', 'color_name')
    prepopulated_fields = {'slug': ('title', 'color_name')}
    inlines = [ExtraImageInline]
    readonly_fields = ('created', 'updated')
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'slug', 'cat', 'group', 'description', 'image')
        }),
        ('Цвет', {
            'fields': ('color_name', 'color_hex')
        }),
        ('Финансы и склад', {
            'fields': ('price', 'quantity')
        }),
        ('Характеристики (необязательно)', {
            'fields': ('material', 'width', 'length', 'depth', 'weight')
        }),
        ('Техническая информация', {
            'fields': ('created', 'updated'),
            'classes': ('collapse',)
        }),
    )

    @admin.display(description="Цвет")
    def color_display(self, obj):
        if obj.color_hex:
            return mark_safe(f'<div style="width: 20px; height: 20px; background-color: {obj.color_hex}; border-radius: 50%; border: 1px solid #ccc;" title="{obj.color_name}"></div>')
        return "-"

    class Media:
        js = ('admin/js/color_autofill.js',)

# admin.site.register(ExtraImage)

@admin.register(HeroImage)
class HeroImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'image_preview', 'order', 'is_active', 'link')
    list_display_links = ('id',)
    list_editable = ('order', 'is_active')
    list_filter = ('is_active',)

    @admin.display(description="Превью")
    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" style="height: 50px;" />')
        return "-"