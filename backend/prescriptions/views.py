from rest_framework import viewsets, permissions
from .models import Prescription, Medication
from .serializers import PrescriptionSerializer, MedicationSerializer

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all().order_by('-created_at')
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

class MedicationViewSet(viewsets.ModelViewSet):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permission_classes = [permissions.IsAuthenticated]
