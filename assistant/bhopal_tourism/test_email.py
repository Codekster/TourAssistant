"""
WanderAI Email Test Script
Test email configuration before implementing the full feature
"""

import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bhopal_tourism.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_email_configuration():
    """Test basic email sending capability"""
    
    print("🧪 Testing WanderAI Email Configuration...")
    print(f"📧 Email Backend: {settings.EMAIL_BACKEND}")
    print(f"📬 Email Host: {settings.EMAIL_HOST}")
    print(f"📮 From Email: {settings.DEFAULT_FROM_EMAIL}")
    
    # Test email content
    subject = "🎫 WanderAI Email Test - Configuration Check"
    message = """
    Hello from WanderAI!
    
    This is a test email to verify that our email configuration is working correctly.
    
    If you receive this email, the basic email setup is successful! ✅
    
    Next steps:
    1. Generate PDF tickets on the backend
    2. Send booking confirmation emails
    3. Include download links
    
    Best regards,
    WanderAI Bhopal Tourism Team
    🏛️ Your AI guide to the City of Lakes
    """
    
    from_email = settings.DEFAULT_FROM_EMAIL
    # For testing, send to your own email
    recipient_list = ['abhij@example.com']  # Replace with your test email
    
    try:
        # Send test email
        result = send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        
        if result:
            print("✅ Email sent successfully!")
            print(f"📨 Sent to: {', '.join(recipient_list)}")
            return True
        else:
            print("❌ Email sending failed - no error but result is 0")
            return False
            
    except Exception as e:
        print(f"❌ Email sending failed with error:")
        print(f"   {type(e).__name__}: {e}")
        print("\n💡 Common solutions:")
        print("   - Check email credentials in settings.py")
        print("   - Enable 'Less secure apps' or use App Password for Gmail")
        print("   - Check firewall/network settings")
        print("   - Verify SMTP settings (host, port, TLS)")
        return False

def test_console_backend():
    """Test with console backend (for development)"""
    print("\n🔧 Testing with Console Backend (Development Mode)")
    
    # Temporarily switch to console backend
    from django.conf import settings
    original_backend = settings.EMAIL_BACKEND
    settings.EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    
    try:
        result = send_mail(
            subject="WanderAI Console Test",
            message="This email should appear in the console/terminal.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['test@example.com'],
            fail_silently=False,
        )
        print("✅ Console email test completed!")
        return True
    except Exception as e:
        print(f"❌ Console email test failed: {e}")
        return False
    finally:
        # Restore original backend
        settings.EMAIL_BACKEND = original_backend

if __name__ == "__main__":
    print("=" * 60)
    print("🎫 WanderAI Email Configuration Test")
    print("=" * 60)
    
    # Test console backend first (always works)
    test_console_backend()
    
    print("\n" + "-" * 60)
    
    # Test actual email (will fail until credentials are configured)
    print("\n📧 Testing Actual Email Sending...")
    print("⚠️  This will fail until you configure actual email credentials")
    print("   To configure:")
    print("   1. Create Gmail account: wanderai.bhopal@gmail.com")
    print("   2. Enable 2FA and create App Password")
    print("   3. Update settings.py with real credentials")
    
    test_email_configuration()
    
    print("\n" + "=" * 60)
    print("✅ Email test script completed!")
    print("📝 Next: Configure real Gmail credentials for production")
    print("=" * 60)