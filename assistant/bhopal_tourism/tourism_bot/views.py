from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
import json
import re
from datetime import datetime
from .simple_chroma import SimpleTourismDB
from .models import Booking
from django.conf import settings
import requests
tourism_db = None

def get_tourism_db():
    global tourism_db
    if tourism_db is None:
        tourism_db = SimpleTourismDB()
        tourism_db.ask_question("test")
    return tourism_db

def format_bot_response(text):
    """Format the bot response for better HTML presentation"""
    if not text:
        return text
    
    # Convert **bold** to HTML bold
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    
    # Convert bullet points to HTML lists
    # Handle bullet points with * at the beginning of lines
    lines = text.split('\n')
    formatted_lines = []
    in_list = False
    
    for line in lines:
        line = line.strip()
        
        # Check if this line is a bullet point
        if line.startswith('* ') or line.startswith('• '):
            if not in_list:
                # Start a new list
                formatted_lines.append('<ul class="list-disc pl-6 my-3 space-y-1">')
                in_list = True
            # Add list item (remove the * and format)
            list_content = line[2:].strip()  # Remove '* ' or '• '
            formatted_lines.append(f'<li class="text-slate-700">{list_content}</li>')
        else:
            if in_list:
                # Close the current list
                formatted_lines.append('</ul>')
                in_list = False
            if line:  # Only add non-empty lines
                formatted_lines.append(f'<p class="mb-3">{line}</p>')
    
    # Close list if it's still open
    if in_list:
        formatted_lines.append('</ul>')
    
    formatted_text = '\n'.join(formatted_lines)
    
    # Clean up multiple consecutive line breaks
    formatted_text = re.sub(r'\n\s*\n\s*\n+', '\n\n', formatted_text)
    
    return formatted_text

def homepage(request):
    # Render homepage with login/signup options
    return render(request, 'tourism_bot/homepage.html')

def chat_page(request):
    # Render chat interface
    return render(request, 'tourism_bot/chat.html')

@csrf_exempt
@api_view(['POST'])
def chat_api(request):
    # Handle chat messages and return RAG responses
    try:
        data = request.data
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return JsonResponse({
                'success': False,
                'error': 'Empty message'
            })
        
        booking_keywords = ['book', 'ticket', 'reserve', 'buy', 'purchase', 'booking']
        has_booking_keyword = any(word in user_message.lower() for word in booking_keywords)
        
        db = get_tourism_db()
        rag_response = db.ask_question(user_message)
        
        # Format the response for better presentation
        formatted_response = format_bot_response(rag_response['answer'])
        
        show_booking_form = False
        if has_booking_keyword:
            booking_intent_confirmed = check_booking_intent_with_gemini(user_message, db)
            if booking_intent_confirmed:
                show_booking_form = True
        
        if show_booking_form:
            return JsonResponse({
                'success': True,
                'response': formatted_response,
                'sources': rag_response['sources'],
                'show_booking_form': True
            })
        else:
            return JsonResponse({
                'success': True,
                'response': formatted_response,
                'sources': rag_response['sources']
            })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Server error: {str(e)}'
        })

def check_booking_intent_with_gemini(user_message, db):
    # Use Gemini to determine booking intent
    try:
        booking_intent_prompt = f"""
        User message: "{user_message}"
        
        Question: Does this user message explicitly say they want to book a ticket, make a reservation, or purchase entry passes for a tourist attraction?
        
        Answer only with: YES or NO
        
        Guidelines:
        - Answer YES only if the user clearly expresses intent to book/purchase/reserve tickets
        - Answer NO for general questions about attractions, prices, or information
        - Answer NO for casual mentions of booking without clear intent
        """
        
        # Ask Gemini directly using the LLM from the RAG system
        gemini_response = db.llm.invoke(booking_intent_prompt)
        
        # Check if response contains "YES"
        response_content = gemini_response.content.strip().upper()
        return "YES" in response_content
        
    except Exception as e:
        return False

@api_view(['POST'])
def submit_booking(request):
    # Handle booking form submission with authentication check and database save
    try:
        if not request.user.is_authenticated:
            return JsonResponse({
                'success': False,
                'error': 'Please login to book tickets',
                'redirect_to_homepage': True
            })
        
        data = request.data
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        attraction = data.get('attraction', '').strip()
        visit_date = data.get('visit_date', '').strip()
        num_tickets = int(data.get('num_tickets', 1))
        
        if not all([name, email, phone, attraction, visit_date]):
            return JsonResponse({
                'success': False,
                'error': 'All fields are required'
            })
        
        import uuid
        ticket_id = str(uuid.uuid4())[:8].upper()
        
        price_per_ticket = 50
        total_price = price_per_ticket * num_tickets
        
        qr_data = {
            'ticketId': ticket_id,
            'name': name,
            'attraction': attraction,
            'visitDate': visit_date,
            'numTickets': num_tickets,
            'status': 'CONFIRMED',
            'verificationUrl': f'/verify/{ticket_id}'
        }
        
        # SAVE TO DATABASE
        booking = Booking.objects.create(
            ticket_id=ticket_id,
            user=request.user,  # Always required (authenticated user)
            name=name,
            email=email,
            phone=phone,
            attraction=attraction,
            visit_date=visit_date,
            num_tickets=num_tickets,
            total_price=total_price,
            qr_data=qr_data
        )
        
        booking_data = {
            'ticket_id': ticket_id,
            'name': name,
            'email': email,
            'phone': phone,
            'attraction': attraction,
            'visit_date': visit_date,
            'num_tickets': num_tickets,
            'price_per_ticket': price_per_ticket,
            'total_price': total_price,
            'booking_date': booking.booking_date.strftime('%d %B %Y'),
            'booking_time': booking.booking_date.strftime('%I:%M %p'),
            'status': 'CONFIRMED'
        }

        try:
            email_data={
                 "booking_data": {
                    "ticket_id": ticket_id,
                    "name": name,
                    "attraction": attraction,
                    "visit_date": visit_date,
                    "num_tickets": num_tickets,
                    "total_price": total_price
                },
                "recipient_email": email
            }
            response=requests.post(
                settings.AZURE_FUNCTION_URL,
                json=email_data,
                headers={"Content-Type":"application/json"}
            )
            if response.status_code != 200:
                print(f"Email sending failed with status code {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Error calling Azure Function: {str(e)}")
        
        return JsonResponse({
            'success': True,
            'message': f'Booking confirmed! Ticket ID: {ticket_id}',
            'booking_data': booking_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

@api_view(['GET'])
def helloBot(request):
    return Response({"message": "Hello, I am your travel assistant!"})

@csrf_exempt
@api_view(['POST'])
def register_user(request):
    # Handle user registration
    try:
        data = request.data
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        
        # Basic validation
        if not all([name, email, password]):
            return JsonResponse({
                'success': False,
                'error': 'All fields are required'
            })
        
        if User.objects.filter(username=email).exists():
            return JsonResponse({
                'success': False,
                'error': 'User with this email already exists'
            })
        
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name
        )
        
        login(request, user)
        
        return JsonResponse({
            'success': True,
            'message': 'Account created successfully',
            'user': {
                'name': user.first_name,
                'email': user.email
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

@csrf_exempt
@api_view(['POST'])
def login_user(request):
    # Handle user login
    try:
        data = request.data
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        
        if not all([email, password]):
            return JsonResponse({
                'success': False,
                'error': 'Email and password are required'
            })
        
        user = authenticate(request, username=email, password=password)
        
        if user:
            login(request, user)
            return JsonResponse({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'name': user.first_name,
                    'email': user.email
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Invalid email or password'
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

@api_view(['POST'])
def logout_user(request):
    # Handle user logout
    logout(request)
    return JsonResponse({
        'success': True,
        'message': 'Logged out successfully'
    })

def warm_up_system():
    # Initialize RAG system to avoid first response delay
    try:
        get_tourism_db()
    except Exception as e:
        print(f"Warm-up error: {e}")

warm_up_system()