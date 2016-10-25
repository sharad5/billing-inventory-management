from django.conf.urls import url
from . import views

urlpatterns = [
	url(r'^upc-search/(?P<upc>[a-zA-Z0-9]+)$',views.lookup_upc, name='search_by_upc'),
	url(r'^product-details/(?P<id>[0-9]+)$',views.product_details, name='product_details'),
]
