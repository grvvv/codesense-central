from django.urls import path, include
from ..views.local_views import LocalProvisionView, ChallengeRequestView, ChallengeAssertionView, UpdateUsageView, LocalDetailsView

urlpatterns = [
    path("provision/", LocalProvisionView.as_view(), name="local_provision"),
    path("challenge/", ChallengeRequestView.as_view(), name="request_challenge"),
    path("assertion/", ChallengeAssertionView.as_view(), name="assertion_request"),
    path("update-usage/", UpdateUsageView.as_view(), name="assertion_request"),
    path("license/<str:license_id>/", LocalDetailsView.as_view(), name="local_by_license_id"),
]
