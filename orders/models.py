from django.db import models
from products.models import Product
from django.contrib.auth.models import User

# Create your models here.
class Order(models.Model):
    name=models.CharField(max_length=1000,blank=True, null=True)
    total_price_before_tax=models.PositiveIntegerField(blank=False,null=False)
    tax=models.PositiveIntegerField(blank=False,null=False)
    discount=models.PositiveIntegerField(blank=False,null=False)
    total_price=models.PositiveIntegerField(blank=False,null=False)
    total_quantity=models.PositiveIntegerField(blank=False,null=False)
    invoice=models.TextField(blank=True,null=True)
    date=models.DateTimeField(blank=False)
    user=models.ForeignKey(User)
    billing_details = models.TextField(blank=True,null=True)

    def __str__(self):
        return self.name + " (Order# "+str(self.id)+")"

class OrderLine(models.Model):
    product=models.ForeignKey(Product)
    unit_price=models.PositiveIntegerField(default=0)
    quantity=models.PositiveIntegerField(default=1)
    total_price=models.PositiveIntegerField(default=0)
    date_created=models.DateField(auto_now_add=True)
    order=models.ForeignKey(Order)
