from django.db.models.signals import post_save
from django.dispatch import receiver
from appointments.models import Appointment
from .models import Invoice, InvoiceItem

@receiver(post_save, sender=Appointment)
def create_invoice_on_completion(sender, instance, **kwargs):
    if instance.status == 'Completed':
        # Check if invoice already exists
        invoice, created = Invoice.objects.get_or_create(
            appointment=instance,
            defaults={'patient': instance.patient, 'status': 'Unpaid'}
        )
        
        if created:
            # Add a base consultation fee
            InvoiceItem.objects.create(
                invoice=invoice,
                description=f"Consultation Fee - Dr. {instance.doctor.last_name}",
                quantity=1,
                unit_price=50.00 # Base fee
            )
