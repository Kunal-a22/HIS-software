from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Get groups the user belongs to
        groups = [group.name for group in user.groups.all()]
        
        # Build role based on groups, defaulting to 'Patient' or 'Unknown'
        primary_role = 'Unknown'
        if user.is_superuser or user.is_staff or 'Admin' in groups:
            primary_role = 'Admin'
        elif 'Doctor' in groups:
            primary_role = 'Doctor'
            
            # Check if this doctor is approved
            from doctors.models import Doctor
            try:
                # Assuming email links the User to Doctor record
                doctor = Doctor.objects.get(email=user.email)
                if not doctor.is_approved:
                    primary_role = 'PendingDoctor'
            except Doctor.DoesNotExist:
                # If they are in the group but have no record, they are essentially pending full setup
                primary_role = 'PendingDoctor'
                
        elif 'Receptionist' in groups:
            primary_role = 'Receptionist'
        elif 'Patient' in groups:
            primary_role = 'Patient'
        elif len(groups) > 0:
            primary_role = groups[0]
            
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_superuser': user.is_superuser,
            'groups': groups,
            'role': primary_role
        })
