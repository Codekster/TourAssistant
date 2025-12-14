from django.db import models
from django.contrib.auth.models import User

class Booking(models.Model):
    ticket_id = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    attraction = models.CharField(max_length=100)
    visit_date = models.DateField()
    num_tickets = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    booking_date = models.DateTimeField(auto_now_add=True)
    qr_data = models.JSONField(null=True, blank=True)
    
    def __str__(self):
        return f"Ticket {self.ticket_id} - {self.name}"
