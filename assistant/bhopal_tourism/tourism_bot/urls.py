from django.urls import path
from . import views

urlpatterns = [
    path("", views.homepage, name="homepage"),  # Default route - Homepage with login/signup
    path("chat/", views.chat_page, name="chat_page"),  # Chat interface (requires login)
    path("api/chat/", views.chat_api, name="chat_api"),  # Chat API endpoint  
    path("api/booking/", views.submit_booking, name="submit_booking"),  # Booking submission
    
    # Authentication endpoints
    path("api/auth/register/", views.register_user, name="register_user"),
    path("api/auth/login/", views.login_user, name="login_user"),
    path("api/auth/logout/", views.logout_user, name="logout_user"),
    
    # path("hello/", views.helloBot, name="helloBot"),  # Original endpoint
]