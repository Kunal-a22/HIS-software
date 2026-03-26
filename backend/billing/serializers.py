from rest_framework import serializers
from .models import Invoice, InvoiceItem
from patients.serializers import PatientSerializer

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['id', 'invoice', 'description', 'quantity', 'unit_price', 'amount']
        read_only_fields = ['amount']

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, required=False)
    patient_name = serializers.CharField(source='patient.first_name', read_only=True)
    patient_last_name = serializers.CharField(source='patient.last_name', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'patient', 'patient_name', 'patient_last_name', 
            'appointment', 'total_amount', 'paid_amount', 
            'status', 'due_date', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['total_amount', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = self.context.get('request').data.get('items', [])
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            # We remove 'invoice' from item_data if it exists because we're linking it via the model
            item_data.pop('invoice', None)
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        return invoice
