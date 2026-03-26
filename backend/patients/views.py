from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Patient, MedicalReport
from .serializers import PatientSerializer, MedicalReportSerializer
import django_filters.rest_framework as django_filters

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('-registration_date')
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'phone_number', 'email']
    ordering_fields = ['last_name', 'registration_date']

class MedicalReportViewSet(viewsets.ModelViewSet):
    queryset = MedicalReport.objects.all().order_by('-created_at')
    serializer_class = MedicalReportSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['patient', 'doctor']
    search_fields = ['disease', 'symptoms']
    ordering_fields = ['created_at']
