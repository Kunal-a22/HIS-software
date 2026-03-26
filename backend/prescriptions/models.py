from django.db import models
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment

class Prescription(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='prescriptions')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='prescriptions')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription for {self.patient} by Dr. {self.doctor.last_name}"

class Medication(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='medications')
    name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    instructions = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.dosage}"
