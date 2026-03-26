from django.db import models

class Doctor(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    SPECIALIZATION_CHOICES = [
        ('Cardiology', 'Cardiology'),
        ('Neurology', 'Neurology'),
        ('Orthopedics', 'Orthopedics'),
        ('Pediatrics', 'Pediatrics'),
        ('Gynecology', 'Gynecology'),
        ('Dermatology', 'Dermatology'),
        ('Oncology', 'Oncology'),
        ('Psychiatry', 'Psychiatry'),
        ('Radiology', 'Radiology'),
        ('General Practice', 'General Practice'),
        ('Emergency Medicine', 'Emergency Medicine'),
        ('Anesthesiology', 'Anesthesiology'),
        ('Ophthalmology', 'Ophthalmology'),
        ('ENT', 'ENT (Ear, Nose & Throat)'),
        ('Urology', 'Urology'),
        ('Nephrology', 'Nephrology'),
        ('Gastroenterology', 'Gastroenterology'),
        ('Endocrinology', 'Endocrinology'),
        ('Other', 'Other'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100, choices=SPECIALIZATION_CHOICES)
    license_number = models.CharField(max_length=50, unique=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(unique=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    availability = models.CharField(max_length=200, blank=True, default='')
    bio = models.TextField(blank=True, null=True)
    join_date = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name} ({self.specialization})"
