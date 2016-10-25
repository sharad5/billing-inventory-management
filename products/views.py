from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from products.models import Product
from django.shortcuts import get_object_or_404
import json
from django.http import HttpResponse
from django.core import serializers

# Create your views here.
@csrf_exempt
def lookup_upc(request,upc):
    data = serializers.serialize('json', Product.objects.filter(upc__contains=upc), fields=('upc','title','selling_price','stock'))
    return HttpResponse(data,content_type="application/json")

@csrf_exempt
def product_details(request,id):
    data = serializers.serialize('json',[get_object_or_404(Product, pk=id)], fields=('upc','title','selling_price','stock'))
    return HttpResponse(data,content_type="application/json")
