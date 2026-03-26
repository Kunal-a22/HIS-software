from rest_framework import serializers
from .models import Patient, MedicalReport, PrescribedMedicine
import json

class PrescribedMedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescribedMedicine
        fields = ['id', 'name', 'timing', 'condition', 'frequency']
        read_only_fields = ['id']

class MedicalReportSerializer(serializers.ModelSerializer):
    medicines = PrescribedMedicineSerializer(many=True, required=False)
    patient_name = serializers.SerializerMethodField(read_only=True)
    doctor_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MedicalReport
        fields = '__all__'
        read_only_fields = ['created_at']

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}" if obj.patient else None

    def get_doctor_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}" if obj.doctor else None

    def to_internal_value(self, data):
        # Handle medicines sent as JSON string in multipart form data
        if 'medicines' in data and isinstance(data['medicines'], str):
            try:
                # We need to make a mutable copy of the QueryDict
                if hasattr(data, '_mutable'):
                    mutable = data._mutable
                    data._mutable = True
                    data['medicines'] = json.loads(data['medicines'])
                    data._mutable = mutable
                else:
                    data = data.copy()
                    data['medicines'] = json.loads(data['medicines'])
            except json.JSONDecodeError:
                pass
        return super().to_internal_value(data)

    def create(self, validated_data):
        medicines_data = validated_data.pop('medicines', [])
        report = MedicalReport.objects.create(**validated_data)
        for medicine_data in medicines_data:
            PrescribedMedicine.objects.create(medical_report=report, **medicine_data)
        return report

    def update(self, instance, validated_data):
        medicines_data = validated_data.pop('medicines', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if medicines_data is not None:
            instance.medicines.all().delete()
            for medicine_data in medicines_data:
                PrescribedMedicine.objects.create(medical_report=instance, **medicine_data)
        return instance

class PatientSerializer(serializers.ModelSerializer):
    medical_reports = MedicalReportSerializer(many=True, read_only=True)
    prescriptions = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = '__all__'

    def get_prescriptions(self, obj):
        from prescriptions.serializers import PrescriptionSerializer
        return PrescriptionSerializer(obj.prescriptions.all(), many=True).data
