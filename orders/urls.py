from django.conf.urls import url
from . import views

urlpatterns = [
	url(r'^$',views.redirect, name='redirect'),
	url(r'^new-sale/$',views.new_sale, name='new_sale'),
	url(r'^login/$',views.login_init, name='login'),
	url(r'^logout/$',views.logout_view, name='logout_view'),
	url(r'^login/auth/$',views.login_auth, name='login_auth'),
	url(r'^save-order/$',views.save_order, name='save_order'),
	url(r'^invoice/(?P<order_id>[0-9]+)/$',views.view_invoice, name='view_invoice'),
]
