from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from doctors.serializers import DoctorSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    # Read-only fields for display purposes
    patient_name = serializers.CharField(source='patient.__str__', read_only=True)
    doctor_name = serializers.CharField(source='doctor.__str__', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'doctor', 'patient_name', 'doctor_name', 
            'appointment_date', 'reason', 'status', 'report', 'report_name', 'created_at'
        ]
