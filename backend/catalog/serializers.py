from rest_framework import serializers
from .models import NamingConvention, CatalogEntry

class NamingConventionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NamingConvention
        fields = '__all__'

class CatalogEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogEntry
        fields = '__all__'
