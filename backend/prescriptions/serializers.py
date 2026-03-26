from rest_framework import serializers
from .models import Prescription, Medication

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ['id', 'prescription', 'name', 'dosage', 'frequency', 'duration', 'instructions']
        read_only_fields = ['prescription']

class PrescriptionSerializer(serializers.ModelSerializer):
    medications = MedicationSerializer(many=True, required=False)
    patient_name = serializers.CharField(source='patient.first_name', read_only=True)
    patient_last_name = serializers.CharField(source='patient.last_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.first_name', read_only=True)
    doctor_last_name = serializers.CharField(source='doctor.last_name', read_only=True)

    class Meta:
        model = Prescription
        fields = [
            'id', 'patient', 'patient_name', 'patient_last_name',
            'doctor', 'doctor_name', 'doctor_last_name',
            'appointment', 'notes', 'created_at', 'medications'
        ]

    def create(self, validated_data):
        medications_data = validated_data.pop('medications', [])
        prescription = Prescription.objects.create(**validated_data)
        for med_data in medications_data:
            Medication.objects.create(prescription=prescription, **med_data)
        return prescription
