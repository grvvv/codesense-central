from django.urls import path, include
from ..views.license_views import LicenseCreateView, LicenseListView, LicenseDetailView, LicenseStatusUpdateView, LicenseConfigExportView

urlpatterns = [
    path("create/", LicenseCreateView.as_view(), name="create_license"),
    path("", LicenseListView.as_view(), name="license_list"),
    path("<str:license_id>/", LicenseDetailView.as_view(), name="license_details_by_if"),
    path("update_status/<str:license_id>", LicenseStatusUpdateView.as_view(), name="update_license_status"),
    path("config/<str:license_id>", LicenseConfigExportView.as_view(), name="license_config")
]

