from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Appointment
from .serializers import AppointmentSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().order_by('-appointment_date')
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['patient__first_name', 'patient__last_name', 'doctor__first_name', 'doctor__last_name', 'reason']
    ordering_fields = ['appointment_date', 'status', 'created_at']
