from django.db import models

class NamingConvention(models.Model):
    name = models.CharField(max_length=255)

class CatalogEntry(models.Model):
    name = models.CharField(max_length=255)
    added_date = models.DateTimeField(auto_now_add=True)
