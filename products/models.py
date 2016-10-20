from django.db import models

# Create your models here.
class Category(models.Model):
    name=models.CharField(max_length=1000,blank=False,null=False)
    date_created=models.DateField(auto_now_add=True, blank=True)
    date_updated=models.DateField(auto_now=True)
    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product(models.Model):
    upc=models.CharField(max_length=1000,blank=True, null=False)
    title=models.CharField(max_length=1000,blank=False, null=False)
    description=models.TextField(blank=True,null=True)
    date_created=models.DateField(auto_now_add=True, blank=True)
    date_updated=models.DateField(auto_now=True)
    cost_price=models.FloatField(blank=True,null=True,default=None)
    selling_price=models.FloatField(blank=True,null=True,default=None)
    is_hidden=models.BooleanField(default=False)
    stock=models.PositiveIntegerField(default=0)
    category=models.ForeignKey(Category)

    def __str__(self):
        return self.title+" ("+self.upc+")"

class Attribute(models.Model):
    name=models.CharField(max_length=1000,blank=False,null=False)
    value=models.CharField(max_length=1000,blank=False,null=False)
    product=models.ForeignKey(Product)
