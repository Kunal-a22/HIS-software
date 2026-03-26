from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import Group
from .models import Doctor
from .serializers import DoctorSerializer

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().order_by('last_name', 'first_name')
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'specialization', 'license_number']
    ordering_fields = ['last_name', 'specialization', 'years_of_experience', 'join_date']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        # Check if the user is an admin
        if not (request.user.is_superuser or request.user.groups.filter(name='Admin').exists()):
            return Response({"error": "Only administrators can approve doctors."}, status=status.HTTP_403_FORBIDDEN)
            
        doctor = self.get_object()
        doctor.is_approved = True
        doctor.save()
        
        # If there's logic tying a doctor to a User via email or another way, we would add the User to the Doctor group here.
        # Assuming the User registers separately with the same email in the future or previously:
        from django.contrib.auth.models import User
        try:
            user = User.objects.get(email=doctor.email)
            doctor_group, _ = Group.objects.get_or_create(name='Doctor')
            user.groups.add(doctor_group)
        except User.DoesNotExist:
            pass # The user account might not exist yet, they will get the group upon creation later if handled elsewhere
            
        return Response({"status": "Doctor approved."})
