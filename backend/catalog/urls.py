from django.urls import path
from .views import get_naming_conventions, add_to_catalog, get_catalog, smart_lookup

urlpatterns = [
    path('naming_conventions/', get_naming_conventions),
    path('add_to_catalog/', add_to_catalog),
    path('catalog/', get_catalog),
    path('smart_lookup/', smart_lookup, name='smart_lookup'),
]

