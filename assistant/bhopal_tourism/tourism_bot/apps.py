from django.apps import AppConfig


class TourismBotConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tourism_bot'

    def ready(self):
        """Called when the app is ready - perfect for warm-up"""
        from .views import warm_up_system
        warm_up_system()
