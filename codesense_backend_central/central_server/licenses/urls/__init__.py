from django.urls import path, include
from licenses.views.dashboard_views import DashboardView

urlpatterns = [
    path("licenses/", include("licenses.urls.license_urls")),
    path("local/", include("licenses.urls.local_urls")),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),

]
