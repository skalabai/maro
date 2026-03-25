from django.urls import path,re_path
from . import views
urlpatterns = [

    path('',views.index,name='home'),
    path('product/<slug:product_slug>',views.show_product,name='product'),
    path('privacy-policy/', views.privacy_policy, name='privacy_policy'),
    path('returns-policy/', views.returns_policy, name='returns_policy'),
]