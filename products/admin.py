from django.contrib import admin
from products.models import *
# Register your models here.
class AttributeInline(admin.TabularInline):
    model=Attribute
    extra=0


class ProductAdmin(admin.ModelAdmin):
    list_filter=['date_created','date_updated']
    list_display=('id','upc','title','stock')
    search_fields=('upc','title')
    inlines=[AttributeInline]

admin.site.register(Product,ProductAdmin)
admin.site.register(Category)
