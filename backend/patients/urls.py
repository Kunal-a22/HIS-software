from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, MedicalReportViewSet

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'medical-reports', MedicalReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
