from django.db import models

class Patient(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField()
    emergency_contact_name = models.CharField(max_length=100)
    emergency_contact_phone = models.CharField(max_length=15)
    medical_history_notes = models.TextField(blank=True, null=True)
    registration_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class MedicalReport(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_reports')
    doctor = models.ForeignKey('doctors.Doctor', on_delete=models.SET_NULL, null=True, blank=True, related_name='medical_reports')
    disease = models.CharField(max_length=255)
    symptoms = models.TextField()
    illness_duration = models.CharField(max_length=100)
    report_file = models.FileField(upload_to='medical_reports/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report for {self.patient} - {self.disease}"

class PrescribedMedicine(models.Model):
    medical_report = models.ForeignKey(MedicalReport, on_delete=models.CASCADE, related_name='medicines')
    name = models.CharField(max_length=255)
    timing = models.CharField(max_length=100)  # e.g., 'Morning, Night'
    condition = models.CharField(max_length=100)  # e.g., 'Empty Stomach'
    frequency = models.CharField(max_length=100)  # e.g., '2 times a day'

    def __str__(self):
        return f"{self.name} for {self.medical_report.patient}"
