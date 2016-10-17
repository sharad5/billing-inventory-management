from django.db import models

# Create your models here.
class Category(models.Model):
    name=models.TextField(blank=False,null=False)
    date_created=models.DateField(auto_now_add=True, blank=True)
    date_updated=models.DateField(auto_now=True)

class Attribute(models.Model):
    name=models.TextField(blank=False,null=False)
    value=models.TextField(blank=False,null=False)

class Product(models.Model):
    upc=models.TextField(blank=True, null=False)
    title=models.TextField(blank=False, null=False)
    description=models.TextField(blank=True,null=True)
    date_created=models.DateField(auto_now_add=True, blank=True)
    date_updated=models.DateField(auto_now=True)
    cost_price=models.FloatField(blank=True,null=True,default=None)
    selling_price=models.FloatField(blank=True,null=True,default=None)
    stock=models.PositiveIntegerField(default=0)
    category=models.ForeignKey(Category)
    attributes=models.ManyToManyField(Attribute)

    def __str__(self):
        return self.title+" ("+self.upc+")"
