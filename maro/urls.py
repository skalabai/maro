from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',include('main.urls')),
    path('cart/', include('cart.urls', namespace='cart')),
    path('wishlist/', include('wishlist.urls', namespace='wishlist')),

]


if settings.DEBUG:
    urlpatterns +=static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)