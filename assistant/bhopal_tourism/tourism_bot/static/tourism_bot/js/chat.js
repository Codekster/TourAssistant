// // Modern WanderAI Chat System - Updated for new HTML structure
// document.addEventListener('DOMContentLoaded', function() {
//     // Global variables
//     let currentUser = null;

//     // DOM Elements
//     const chatMessages = document.getElementById('chatMessages');
//     const userInput = document.getElementById('userInput');
//     const sendButton = document.getElementById('sendButton');
//     const bookingModal = document.getElementById('bookingModal');
//     const closeBooking = document.getElementById('closeBooking');
//     const bookingForm = document.getElementById('bookingForm');
//     const logoutBtn = document.getElementById('logoutBtn');
//     const totalAmountSpan = document.getElementById('totalAmount');
//     const numTicketsSelect = document.getElementById('num_tickets');

//     // CSRF Token
//     function getCSRFToken() {
//         return document.querySelector('[name=csrfmiddlewaretoken]').value;
//     }

//     // Set minimum date to today
//     if (document.getElementById('visit_date')) {
//         document.getElementById('visit_date').min = new Date().toISOString().split('T')[0];
//     }

//     // Update total amount when number of tickets changes
//     if (numTicketsSelect) {
//         numTicketsSelect.addEventListener('change', function() {
//             const numTickets = parseInt(this.value);
//             const pricePerTicket = 50;
//             const totalAmount = numTickets * pricePerTicket;
//             if (totalAmountSpan) {
//                 totalAmountSpan.textContent = `₹${totalAmount}`;
//             }
//         });
//     }

//     // Message Functions - Updated for new design
//     function addMessage(content, isUser = false, sources = null) {
//         const messageDiv = document.createElement('div');
//         messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 message-slide-in`;
        
//         const messageContent = `
//             <div class="max-w-[80%] ${isUser ? 'bg-blue-600 text-white rounded-2xl rounded-br-md' : 'bg-white border border-slate-200 rounded-2xl rounded-bl-md shadow-sm'} px-6 py-4">
//                 ${isUser ? `<div class="flex items-center space-x-2 mb-2">
//                     <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
//                         <span class="text-xs text-white font-semibold">👤</span>
//                     </div>
//                     <span class="text-sm font-medium text-blue-100">You</span>
//                 </div>` : `<div class="flex items-center space-x-2 mb-3">
//                     <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
//                         <span class="text-white font-bold">🧭</span>
//                     </div>
//                     <div>
//                         <div class="font-semibold text-slate-900">WanderAI</div>
//                         <div class="text-xs text-slate-500">Bhopal Tourism Assistant</div>
//                     </div>
//                 </div>`}
                
//                 <div class="${isUser ? 'text-white' : 'text-slate-700'}">${content}</div>
                
//                 ${sources && sources.length > 0 ? `
//                     <div class="mt-3 pt-3 border-t border-slate-200">
//                         <div class="text-xs text-slate-500 mb-1">Sources:</div>
//                         <div class="text-xs text-slate-600">
//                             ${sources.map(source => source.replace(/.*[\/\\]/, '')).join(', ')}
//                         </div>
//                     </div>
//                 ` : ''}
//             </div>
//         `;
        
//         messageDiv.innerHTML = messageContent;
//         chatMessages.appendChild(messageDiv);
//         chatMessages.scrollTop = chatMessages.scrollHeight;
//     }

//     function addLoadingMessage() {
//         const messageDiv = document.createElement('div');
//         messageDiv.className = 'flex justify-start mb-4 message-slide-in';
//         messageDiv.id = 'loadingMessage';
        
//         messageDiv.innerHTML = `
//             <div class="bg-white border border-slate-200 rounded-2xl rounded-bl-md shadow-sm px-6 py-4">
//                 <div class="flex items-center space-x-2 mb-3">
//                     <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
//                         <span class="text-white font-bold">🧭</span>
//                     </div>
//                     <div>
//                         <div class="font-semibold text-slate-900">WanderAI</div>
//                         <div class="text-xs text-slate-500">Thinking...</div>
//                     </div>
//                 </div>
//                 <div class="flex items-center space-x-2 text-slate-600">
//                     <div class="flex space-x-1">
//                         <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
//                         <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
//                         <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
//                     </div>
//                     <span class="text-sm">Searching through Bhopal's knowledge...</span>
//                 </div>
//             </div>
//         `;
        
//         chatMessages.appendChild(messageDiv);
//         chatMessages.scrollTop = chatMessages.scrollHeight;
//     }

//     function removeLoadingMessage() {
//         const loadingMessage = document.getElementById('loadingMessage');
//         if (loadingMessage) {
//             loadingMessage.remove();
//         }
//     }

//     // Send Message Function
//     async function sendMessage() {
//         const message = userInput.value.trim();
//         if (!message) return;

//         // Add user message
//         addMessage(message, true);
//         userInput.value = '';

//         // Add loading message
//         addLoadingMessage();

//         try {
//             const response = await fetch('/api/chat/', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-CSRFToken': getCSRFToken()
//                 },
//                 body: JSON.stringify({ message: message })
//             });
            
//             const data = await response.json();
//             this.hideTypingIndicator();
            
//             if (data.success) {
//                 this.addMessage(data.response, 'bot');
//                 if (data.show_booking_form) {
//                     this.showBookingForm();
//                 }
//             } else {
//                 this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
//             }
            
//         } catch (error) {
//             this.hideTypingIndicator();
//             this.addMessage('Sorry, there was a connection error. Please try again.', 'bot');
//         }
        
//         this.scrollToBottom();
//     }
    
//     addMessage(content, sender) {
//         const messageDiv = document.createElement('div');
//         messageDiv.className = `message ${sender}`;
        
//         const avatar = sender === 'user' ? '👤' : '🤖';
        
//         messageDiv.innerHTML = `
//             <div class="message-avatar">${avatar}</div>
//             <div class="message-content">${content}</div>
//         `;
        
//         this.messagesContainer.appendChild(messageDiv);
//         this.scrollToBottom();
//     }
    
//     showTypingIndicator() {
//         const typingDiv = document.createElement('div');
//         typingDiv.className = 'message bot typing-message';
//         typingDiv.innerHTML = `
//             <div class="message-avatar">🤖</div>
//             <div class="typing-indicator">
//                 <div class="typing-dots">
//                     <span></span>
//                     <span></span>
//                     <span></span>
//                 </div>
//             </div>
//         `;
        
//         this.messagesContainer.appendChild(typingDiv);
//         this.scrollToBottom();
//     }
    
//     hideTypingIndicator() {
//         const typingMessage = document.querySelector('.typing-message');
//         if (typingMessage) {
//             typingMessage.remove();
//         }
//     }
    
//     handleBookingIntent(data) {
//         // Add booking form or redirect to booking page
//         const bookingMessage = `
//             <p>Great! I can help you book tickets. Would you like to:</p>
//             <div class="quick-suggestions">
//                 <button class="suggestion-btn" onclick="showBookingForm()">Book tickets now</button>
//                 <button class="suggestion-btn">Get more information</button>
//             </div>
//         `;
//         this.addMessage(bookingMessage, 'bot');
//     }
    
//     scrollToBottom() {
//         this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
//     }
    
//     getCSRFToken() {
//         return document.querySelector('[name=csrfmiddlewaretoken]').value;
//     }

// }

// // Initialize chatbot when page loads
// document.addEventListener('DOMContentLoaded', function() {
//     const chatbot = new BhopalChatBot();
    
//     // Booking form event listeners
//     const bookingModal = document.getElementById('bookingModal');
//     const bookingForm = document.getElementById('bookingForm');
//     const closeBooking = document.getElementById('closeBooking');
//     const cancelBooking = document.getElementById('cancelBooking');
    
//     // Close booking form
//     function closeBookingForm() {
//         bookingModal.style.display = 'none';
//         bookingForm.reset();
//     }
    
//     closeBooking.addEventListener('click', closeBookingForm);
//     cancelBooking.addEventListener('click', closeBookingForm);
    
//     // Close when clicking outside modal
//     bookingModal.addEventListener('click', (e) => {
//         if (e.target === bookingModal) {
//             closeBookingForm();
//         }
//     });
    
//     // Handle booking form submission
//     bookingForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
        
//         const formData = new FormData(bookingForm);
//         const bookingData = {
//             name: formData.get('name'),
//             email: formData.get('email'),
//             phone: formData.get('phone'),
//             attraction: formData.get('attraction'),
//             visit_date: formData.get('visit_date'),
//             num_tickets: formData.get('num_tickets')
//         };
        
//         try {
//             const response = await fetch('/api/booking/', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-CSRFToken': chatbot.getCSRFToken()
//                 },
//                 body: JSON.stringify(bookingData)
//             });
            
//             const result = await response.json();
            
//             if (result.success) {
//                 // Generate PDF directly in frontend
//                 generateTicketPDF(result.booking_data);
                
//                 // Show success message
//                 const successMessage = `🎉 Booking Confirmed! 
                
// Ticket ID: ${result.booking_data.ticket_id}
// Total Amount: Rs. ${result.booking_data.total_price}

// Your beautiful ticket has been downloaded! Present it at the attraction entrance. Have a wonderful visit! 🌊`;
                
//                 chatbot.addMessage(successMessage, 'bot');
                
//                 closeBookingForm();
//             } else {
//                 alert('Booking failed: ' + result.error);
//             }
            
//         } catch (error) {
//             console.error('Booking error:', error);
//             alert('Booking failed. Please try again.');
//         }
//     });
// });

// // Beautiful PDF Ticket Generator - Frontend Only
// function generateTicketPDF(bookingData) {
//     const { jsPDF } = window.jspdf;
//     const doc = new jsPDF('portrait', 'mm', 'a4');
    
//     // Color palette - Minimal & Aesthetic
//     const primaryColor = [41, 128, 185];      // Professional blue
//     const accentColor = [52, 73, 94];        // Dark gray
//     const lightGray = [236, 240, 241];       // Light background
//     const darkGray = [44, 62, 80];          // Text color
//     const successGreen = [46, 204, 113];     // Green for confirmed badge
    
//     // Function to clean text and remove unsupported characters
//     function cleanText(text) {
//         return String(text)
//             .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
//             .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc symbols
//             .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport symbols
//             .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
//             .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
//             .trim();
//     }
    
//     // Background
//     doc.setFillColor(...lightGray);
//     doc.rect(0, 0, 210, 297, 'F');
    
//     // Header section
//     doc.setFillColor(...primaryColor);
//     doc.rect(0, 0, 210, 60, 'F');
    
//     // WanderAI title
//     doc.setTextColor(255, 255, 255);
//     doc.setFontSize(28);
//     doc.setFont('helvetica', 'bold');
//     doc.text('WanderAI', 105, 25, { align: 'center' });
    
//     doc.setFontSize(16);
//     doc.setFont('helvetica', 'normal');
//     doc.text('Bhopal Tourism - Official Entry Pass', 105, 35, { align: 'center' });
    
//     // Ticket ID - Prominent display
//     doc.setFontSize(16);
//     doc.setFont('helvetica', 'bold');
//     doc.text(`TICKET ID: ${cleanText(bookingData.ticket_id)}`, 105, 50, { align: 'center' });
    
//     // Main content area - White card with border
//     doc.setFillColor(255, 255, 255);
//     doc.setDrawColor(...primaryColor);
//     doc.setLineWidth(0.5);
//     doc.rect(20, 70, 170, 150, 'FD');
    
//     // Visitor Information Section
//     let yPos = 90;
//     doc.setFontSize(12);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(...primaryColor);
//     doc.text('VISITOR INFORMATION', 30, yPos);
    
//     // Underline for section
//     doc.setDrawColor(...primaryColor);
//     doc.line(30, yPos + 2, 90, yPos + 2);
    
//     yPos += 15;
//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(10);
//     doc.setTextColor(...accentColor);
    
//     // Clean information layout
//     const visitorInfo = [
//         ['Name', cleanText(bookingData.name)],
//         ['Email', cleanText(bookingData.email)],
//         ['Phone', cleanText(bookingData.phone)]
//     ];
    
//     visitorInfo.forEach(([label, value]) => {
//         doc.setFont('helvetica', 'bold');
//         doc.text(`${label}:`, 30, yPos);
//         doc.setFont('helvetica', 'normal');
//         doc.text(value, 75, yPos);
//         yPos += 8;
//     });
    
//     // Visit Details Section
//     yPos += 15;
//     doc.setFontSize(12);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(...primaryColor);
//     doc.text('VISIT DETAILS', 30, yPos);
    
//     // Underline for section
//     doc.line(30, yPos + 2, 75, yPos + 2);
    
//     yPos += 15;
//     doc.setFontSize(10);
//     doc.setTextColor(...accentColor);
    
//     const visitInfo = [
//         ['Attraction', cleanText(bookingData.attraction)],
//         ['Visit Date', cleanText(bookingData.visit_date)],
//         ['No. of Tickets', cleanText(bookingData.num_tickets)],
//         ['Total Amount', `Rs. ${cleanText(bookingData.total_price)}`]
//     ];
    
//     visitInfo.forEach(([label, value]) => {
//         doc.setFont('helvetica', 'bold');
//         doc.text(`${label}:`, 30, yPos);
//         doc.setFont('helvetica', 'normal');
//         doc.text(value, 75, yPos);
//         yPos += 8;
//     });
    
//     // Status badge - enhanced
//     yPos += 10;
//     doc.setFillColor(...successGreen);
//     doc.roundedRect(30, yPos - 3, 30, 10, 2, 2, 'F');
//     doc.setTextColor(255, 255, 255);
//     doc.setFontSize(8);
//     doc.setFont('helvetica', 'bold');
//     doc.text('CONFIRMED', 32, yPos + 2);
    
//     // Booking timestamp
//     doc.setTextColor(...accentColor);
//     doc.setFontSize(8);
//     doc.setFont('helvetica', 'normal');
//     doc.text(`Booked: ${cleanText(bookingData.booking_date)} at ${cleanText(bookingData.booking_time)}`, 70, yPos + 2);
    
//     // Generate QR Code
//     function generateQRCode(data) {
//         try {
//             // Create a canvas element for QR code generation
//             const canvas = document.createElement('canvas');
//             const qr = new QRious({
//                 element: canvas,
//                 value: data,
//                 size: 200,
//                 background: 'white',
//                 foreground: 'black',
//                 level: 'M'
//             });
//             return canvas.toDataURL('image/png');
//         } catch (error) {
//             console.error('QR Code generation failed:', error);
//             return null;
//         }
//     }
    
//     // QR Code section - Generate QR code with ticket verification data
//     const qrData = JSON.stringify({
//         ticketId: bookingData.ticket_id,
//         name: bookingData.name,
//         attraction: bookingData.attraction,
//         visitDate: bookingData.visit_date,
//         numTickets: bookingData.num_tickets,
//         status: 'CONFIRMED',
//         verificationUrl: `https://bhopaltourism.com/verify/${bookingData.ticket_id}`
//     });
    
//     const qrX = 130;
//     const qrY = 160;
    
//     // QR Code background with border
//     doc.setFillColor(255, 255, 255);
//     doc.setDrawColor(...primaryColor);
//     doc.setLineWidth(2);
//     doc.rect(qrX, qrY, 45, 45, 'FD');
    
//     // Generate and add QR code
//     const qrCodeDataURL = generateQRCode(qrData);
//     if (qrCodeDataURL) {
//         try {
//             doc.addImage(qrCodeDataURL, 'PNG', qrX + 2, qrY + 2, 41, 41);
//         } catch (error) {
//             console.error('Failed to add QR code to PDF:', error);
//             // Fallback: Add text if QR code fails
//             doc.setTextColor(...darkGray);
//             doc.setFontSize(8);
//             doc.text('QR Code', qrX + 22.5, qrY + 20, { align: 'center' });
//             doc.text('Generation', qrX + 22.5, qrY + 25, { align: 'center' });
//             doc.text('Failed', qrX + 22.5, qrY + 30, { align: 'center' });
//         }
//     } else {
//         // Fallback: Add ticket ID as text if QR generation completely fails
//         doc.setTextColor(...darkGray);
//         doc.setFontSize(8);
//         doc.text('Ticket ID:', qrX + 22.5, qrY + 20, { align: 'center' });
//         doc.text(cleanText(bookingData.ticket_id), qrX + 22.5, qrY + 28, { align: 'center' });
//     }
    
//     // QR Code label
//     doc.setTextColor(...accentColor);
//     doc.setFontSize(7);
//     doc.text('Scan for Verification', qrX + 22.5, qrY + 52, { align: 'center' });
//     doc.text('Ticket ID: ' + cleanText(bookingData.ticket_id), qrX + 22.5, qrY + 58, { align: 'center' });
    
//     // Terms and conditions section
//     yPos = 235;
//     doc.setFillColor(248, 249, 250);
//     doc.rect(20, yPos - 5, 170, 40, 'F');
    
//     doc.setTextColor(...primaryColor);
//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'bold');
//     doc.text('TERMS & CONDITIONS', 30, yPos);
    
//     doc.setFontSize(8);
//     doc.setFont('helvetica', 'normal');
//     doc.setTextColor(...accentColor);
//     const terms = [
//         '- Present this ticket with valid photo ID at entrance',
//         '- Valid only for specified date and attraction',
//         '- Entry subject to operating hours and availability',
//         '- No refunds, exchanges, or date modifications allowed',
//         '- Keep ticket safe - duplicate copies will not be issued'
//     ];
    
//     let termY = yPos + 8;
//     terms.forEach(term => {
//         doc.text(term, 30, termY);
//         termY += 6;
//     });
    
//     // Footer - WanderAI branding
//     doc.setFillColor(...darkGray);
//     doc.rect(0, 280, 210, 17, 'F');
//     doc.setTextColor(255, 255, 255);
//     doc.setFontSize(8);
//     doc.text('WanderAI - Bhopal Tourism | support@wanderai.com | +91-755-123456', 105, 290, { align: 'center' });
    
//     // Download with clean filename
//     const cleanTicketId = cleanText(bookingData.ticket_id);
//     doc.save(`WanderAI_Bhopal_Ticket_${cleanTicketId}.pdf`);
// }

// // Legacy function for compatibility
// function showBookingForm() {
//     document.getElementById('bookingModal').style.display = 'flex';
// }