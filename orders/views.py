from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader
from django.shortcuts import get_object_or_404
import json
import datetime
from orders.models import *
from django.contrib.auth import authenticate, login,logout
# Create your views here.
def new_sale(request):
    if not request.user.is_authenticated():
        return HttpResponseRedirect('/orders/login/?next=orders/new-sale')
    return render(request,'orders/sale.html',{'user':request.user})

def redirect(request):
    return HttpResponseRedirect("/login")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect("/orders/login/")

def login_init(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect("/orders/new-sale")
    return render(request,'orders/login.html',{})

def login_auth(request):
    username=request.POST['username']
    password=request.POST['password']
    next = request.GET.get('next')
    user=authenticate(username=username,password=password)
    print(user)
    if user is not None:
        if user.is_active:
            login(request,user)
            if next is not None:
                return HttpResponseRedirect(next)
            return HttpResponseRedirect("/orders/new-sale")
        else:
            return HttpResponse("User Disabled")
    if next is not None:
        return HttpResponseRedirect("/login/?next="+next+"&error=True")
    return HttpResponseRedirect("/login/?error=True")


@csrf_exempt
def save_order(request):
    json_data = request.POST.get('data',False)
    data = json.JSONDecoder().decode( json_data )
    print(data)
    lines = data['lines']
    order = Order.objects.create(name=lines[0]['title'][:20]+"..",billing_details=data['billing_details'] ,total_price_before_tax=data['total_price'], tax = 0, discount = data['discount'], total_price=data['total_price'], total_quantity=data['total_quantity'], date=datetime.datetime.now(), user=request.user)
    for line in  lines:
        product = Product.objects.get(pk=line['id'])
        product.stock -= line['quantity']
        OrderLine.objects.create(product=product, unit_price=line['price'], quantity=line['quantity'], total_price=line['total_price'], order=order)
        product.save()
    return HttpResponse(json.dumps({"id":order.id}),content_type="application/json")

def view_invoice(request,order_id):
    order = get_object_or_404(Order, pk=order_id)
    lines = OrderLine.objects.filter(order=order)
    context = {'order':order, 'lines':lines}
    template = loader.get_template('orders/invoice.html')
    return HttpResponse(template.render(context,request))
