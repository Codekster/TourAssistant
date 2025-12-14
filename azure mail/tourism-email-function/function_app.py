import azure.functions as func
from azure.communication.email import EmailClient
import datetime
import json
import logging
import os

app = func.FunctionApp()
# @app.route(route="test")
# def test(req: func.HttpRequest) -> func.HttpResponse:
#     logging.info('Python HTTP trigger function processed a request.')
#     return func.HttpResponse("Hello from test function")

@app.route(route="SendBookingEmail",methods=["POST"])
def sendBookingEmail(req:func.HttpRequest)->func.HttpResponse:
    logging.info("Email function procesed a request,")
    try:
        req_body=req.get_json()
        booking_data=req_body.get('booking_data')
        recipient_email=req_body.get('recipient_email')

        if not booking_data or not recipient_email:
            return func.HttpResponse("Missing required booking or recipient data",
                                     status_code=400
                                     )
        
        connection_string=os.environ["ACS_CONNECTION_STRING"]
        email_client=EmailClient.from_connection_string(connection_string)
        sender=os.environ["ACS_SENDER_EMAIL"]

        #Email Content
        subject = f"Booking Confirmation - Ticket #{booking_data['ticket_id']}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Booking Confirmation</h2>
                <p>Dear {booking_data['name']},</p>
                <p>Your booking has been confirmed!</p>
                
                <div style="padding: 15px;">
                    <h3>Booking Details:</h3>
                    <ul>
                        <li>Ticket ID: <strong>{booking_data['ticket_id']}</strong></li>
                        <li>Attraction: {booking_data['attraction']}</li>
                        <li>Visit Date: {booking_data['visit_date']}</li>
                        <li>Number of Tickets: {booking_data['num_tickets']}</li>
                        <li>Total Amount: ₹{booking_data['total_price']}</li>
                    </ul>
                </div>
            </body>
        </html>
        """
        try:
            message = {
                "content": {
                    "subject": subject,
                    "html": html_content,
                    "plainText": f"Booking Confirmation - Ticket #{booking_data['ticket_id']}"
                },
                "recipients": {
                    "to": [
                        {"address": recipient_email}
                    ]
                },
                "senderAddress": sender
            }
            logging.info(f"Attempting to send email with message: {json.dumps(message)}")
            poller=email_client.begin_send(message)
            logging.info(f"Email sent successfully to {recipient_email}")
            return func.HttpResponse(
                json.dumps({
                    "message": "Email sent successfully",
                    "ticket_id": booking_data['ticket_id']
                }),
                status_code=200,
                mimetype="application/json"
            )
        except Exception as email_error:
            logging.error(f"Email sending failed: {str(email_error)}")
            return func.HttpResponse(
                f"Failed to send email: {str(email_error)}",
                status_code=500
            )
        
    except Exception as e:
        logging.error(f"Function error: {str(e)}")
        return func.HttpResponse(
            f"Error processing request: {str(e)}",
            status_code=500
        )
        