from django.contrib import admin
from orders.models import *
# Register your models here.

class OrderLineInline(admin.TabularInline):
    model = OrderLine
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    list_filter=['date']
    list_display=('id','name','date','total_price','total_quantity')
    search_fields=('name','total_price')
    inlines=[OrderLineInline]

admin.site.register(Order,OrderAdmin)
