// Modern WanderAI Chat System - Clean Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentUser = null;

    // DOM Elements
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const bookingModal = document.getElementById('bookingModal');
    const closeBooking = document.getElementById('closeBooking');
    const bookingForm = document.getElementById('bookingForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const totalAmountSpan = document.getElementById('totalAmount');
    const numTicketsSelect = document.getElementById('num_tickets');

    // CSRF Token
    function getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }

    // Set minimum date to today
    if (document.getElementById('visit_date')) {
        document.getElementById('visit_date').min = new Date().toISOString().split('T')[0];
    }

    // Update total amount when number of tickets changes
    if (numTicketsSelect) {
        numTicketsSelect.addEventListener('change', function() {
            const numTickets = parseInt(this.value);
            const pricePerTicket = 50;
            const totalAmount = numTickets * pricePerTicket;
            if (totalAmountSpan) {
                totalAmountSpan.textContent = `₹${totalAmount}`;
            }
        });
    }

    // Message Functions - Updated for new design
    function addMessage(content, isUser = false, sources = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 message-slide-in`;
        
        const messageContent = `
            <div class="max-w-[80%] ${isUser ? 'bg-blue-600 text-white rounded-2xl rounded-br-md' : 'bg-white border border-slate-200 rounded-2xl rounded-bl-md shadow-sm'} px-6 py-4">
                ${isUser ? `<div class="flex items-center space-x-2 mb-2">
                    <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span class="text-xs text-white font-semibold">👤</span>
                    </div>
                    <span class="text-sm font-medium text-blue-100">You</span>
                </div>` : `<div class="flex items-center space-x-2 mb-3">
                    <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span class="text-white font-bold">🧭</span>
                    </div>
                    <div>
                        <div class="font-semibold text-slate-900">WanderAI</div>
                        <div class="text-xs text-slate-500">Bhopal Tourism Assistant</div>
                    </div>
                </div>`}
                
                <div class="${isUser ? 'text-white' : 'text-slate-700'}">${content}</div>
                
                ${sources && sources.length > 0 ? `
                    <div class="mt-3 pt-3 border-t border-slate-200">
                        <div class="text-xs text-slate-500 mb-1">Sources:</div>
                        <div class="text-xs text-slate-600">
                            ${sources.map(source => source.replace(/.*[\/\\]/, '')).join(', ')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        messageDiv.innerHTML = messageContent;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addLoadingMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex justify-start mb-4 message-slide-in';
        messageDiv.id = 'loadingMessage';
        
        messageDiv.innerHTML = `
            <div class="bg-white border border-slate-200 rounded-2xl rounded-bl-md shadow-sm px-6 py-4">
                <div class="flex items-center space-x-2 mb-3">
                    <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span class="text-white font-bold">🧭</span>
                    </div>
                    <div>
                        <div class="font-semibold text-slate-900">WanderAI</div>
                        <div class="text-xs text-slate-500">Thinking...</div>
                    </div>
                </div>
                <div class="flex items-center space-x-2 text-slate-600">
                    <div class="flex space-x-1">
                        <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                        <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                    <span class="text-sm">Searching through Bhopal's knowledge...</span>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeLoadingMessage() {
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    // Send Message Function
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, true);
        userInput.value = '';

        // Add loading message
        addLoadingMessage();

        try {
            const response = await fetch('/api/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            removeLoadingMessage();

            if (data.success) {
                addMessage(data.response, false, data.sources);
                
                if (data.show_booking_form) {
                    setTimeout(() => {
                        bookingModal.classList.remove('hidden');
                        bookingModal.classList.add('flex');
                    }, 500);
                }
            } else {
                addMessage(`Sorry, I encountered an error: ${data.error}`, false);
            }
        } catch (error) {
            removeLoadingMessage();
            addMessage(`Sorry, I'm having trouble connecting. Please try again.`, false);
            console.error('Chat error:', error);
        }
    }

    // Event Listeners
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        // Set focus on input
        userInput.focus();
    }

    // Modal Functions
    function openModal() {
        if (bookingModal) {
            bookingModal.classList.remove('hidden');
            bookingModal.classList.add('flex');
        }
    }

    function closeModal() {
        if (bookingModal) {
            bookingModal.classList.add('hidden');
            bookingModal.classList.remove('flex');
        }
    }

    if (closeBooking) {
        closeBooking.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    if (bookingModal) {
        bookingModal.addEventListener('click', (e) => {
            if (e.target === bookingModal) closeModal();
        });
    }

    // Booking Form Submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(bookingForm);
            const bookingData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                attraction: formData.get('attraction'),
                visit_date: formData.get('visit_date'),
                num_tickets: formData.get('num_tickets')
            };

            try {
                const response = await fetch('/api/booking/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken()
                    },
                    body: JSON.stringify(bookingData)
                });

                const result = await response.json();

                if (result.success) {
                    closeModal();
                    
                    // Generate PDF ticket
                    generateTicketPDF(result.booking_data);
                    
                    // Show success message
                    const successMessage = `🎉 Booking Confirmed! 

Ticket ID: ${result.booking_data.ticket_id}
Total Amount: ₹${result.booking_data.total_price}

Your beautiful ticket has been downloaded! Present it at the attraction entrance. Have a wonderful visit! 🌊`;
                    
                    addMessage(successMessage, false);
                    bookingForm.reset();
                    if (totalAmountSpan) {
                        totalAmountSpan.textContent = '₹50'; // Reset total amount
                    }
                } else {
                    if (result.redirect_to_homepage) {
                        alert('Please login to book tickets. Redirecting to homepage...');
                        window.location.href = '/';
                    } else {
                        alert('Booking failed: ' + result.error);
                    }
                }
            } catch (error) {
                alert('Booking error: ' + error.message);
                console.error('Booking error:', error);
            }
        });
    }

    // Logout Function
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/auth/logout/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCSRFToken()
                    }
                });

                const result = await response.json();
                if (result.success) {
                    window.location.href = '/';
                } else {
                    console.error('Logout failed:', result.error);
                }
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
});

// Beautiful PDF Ticket Generator - Frontend Only - Updated with WanderAI branding
function generateTicketPDF(bookingData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('portrait', 'mm', 'a4');
    
    // Color palette - Professional WanderAI theme
    const primaryColor = [59, 130, 246];      // Blue-600 (matching homepage)
    const accentColor = [51, 65, 85];         // Slate-700
    const lightGray = [248, 250, 252];        // Slate-50
    const darkGray = [15, 23, 42];           // Slate-900
    const successGreen = [34, 197, 94];       // Green-500
    
    // Function to clean text and remove unsupported characters
    function cleanText(text) {
        return String(text)
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc symbols
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport symbols
            .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
            .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
            .trim();
    }
    
    // Background
    doc.setFillColor(...lightGray);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Header section - WanderAI branding
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 60, 'F');
    
    // WanderAI title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('WanderAI', 105, 25, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Bhopal Tourism - Official Entry Pass', 105, 35, { align: 'center' });
    
    // Ticket ID - Prominent display
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`TICKET ID: ${cleanText(bookingData.ticket_id)}`, 105, 50, { align: 'center' });
    
    // Main content area - White card with rounded corners effect
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(20, 70, 170, 150, 'FD');
    
    // Visitor Information Section
    let yPos = 90;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('VISITOR INFORMATION', 30, yPos);
    
    // Underline for section
    doc.setDrawColor(...primaryColor);
    doc.line(30, yPos + 2, 100, yPos + 2);
    
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...accentColor);
    
    // Clean information layout
    const visitorInfo = [
        ['Name', cleanText(bookingData.name)],
        ['Email', cleanText(bookingData.email)],
        ['Phone', cleanText(bookingData.phone)]
    ];
    
    visitorInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, 30, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 75, yPos);
        yPos += 8;
    });
    
    // Visit Details Section
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('VISIT DETAILS', 30, yPos);
    
    // Underline for section
    doc.line(30, yPos + 2, 85, yPos + 2);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(...accentColor);
    
    const visitInfo = [
        ['Attraction', cleanText(bookingData.attraction)],
        ['Visit Date', cleanText(bookingData.visit_date)],
        ['No. of Tickets', cleanText(bookingData.num_tickets)],
        ['Total Amount', `₹${cleanText(bookingData.total_price)}`]
    ];
    
    visitInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, 30, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 85, yPos);
        yPos += 8;
    });
    
    // Status badge - enhanced
    yPos += 10;
    doc.setFillColor(...successGreen);
    doc.roundedRect(30, yPos - 3, 30, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIRMED', 32, yPos + 2);
    
    // Booking timestamp
    doc.setTextColor(...accentColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Booked: ${cleanText(bookingData.booking_date)} at ${cleanText(bookingData.booking_time)}`, 70, yPos + 2);
    
    // Generate QR Code
    function generateQRCode(data) {
        try {
            // Create a canvas element for QR code generation
            const canvas = document.createElement('canvas');
            const qr = new QRious({
                element: canvas,
                value: data,
                size: 200,
                background: 'white',
                foreground: 'black',
                level: 'M'
            });
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('QR Code generation failed:', error);
            return null;
        }
    }
    
    // QR Code section - Generate QR code with ticket verification data
    const qrData = JSON.stringify({
        ticketId: bookingData.ticket_id,
        name: bookingData.name,
        attraction: bookingData.attraction,
        visitDate: bookingData.visit_date,
        numTickets: bookingData.num_tickets,
        status: 'CONFIRMED',
        verificationUrl: `https://wanderai.com/verify/${bookingData.ticket_id}`
    });
    
    const qrX = 130;
    const qrY = 160;
    
    // QR Code background with border
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(2);
    doc.rect(qrX, qrY, 45, 45, 'FD');
    
    // Generate and add QR code
    const qrCodeDataURL = generateQRCode(qrData);
    if (qrCodeDataURL) {
        try {
            doc.addImage(qrCodeDataURL, 'PNG', qrX + 2, qrY + 2, 41, 41);
        } catch (error) {
            console.error('Failed to add QR code to PDF:', error);
            // Fallback: Add text if QR code fails
            doc.setTextColor(...darkGray);
            doc.setFontSize(8);
            doc.text('QR Code', qrX + 22.5, qrY + 20, { align: 'center' });
            doc.text('Generation', qrX + 22.5, qrY + 25, { align: 'center' });
            doc.text('Failed', qrX + 22.5, qrY + 30, { align: 'center' });
        }
    } else {
        // Fallback: Add ticket ID as text if QR generation completely fails
        doc.setTextColor(...darkGray);
        doc.setFontSize(8);
        doc.text('Ticket ID:', qrX + 22.5, qrY + 20, { align: 'center' });
        doc.text(cleanText(bookingData.ticket_id), qrX + 22.5, qrY + 28, { align: 'center' });
    }
    
    // QR Code label
    doc.setTextColor(...accentColor);
    doc.setFontSize(7);
    doc.text('Scan for Verification', qrX + 22.5, qrY + 52, { align: 'center' });
    doc.text('Ticket ID: ' + cleanText(bookingData.ticket_id), qrX + 22.5, qrY + 58, { align: 'center' });
    
    // Terms and conditions section
    yPos = 235;
    doc.setFillColor(248, 249, 250);
    doc.rect(20, yPos - 5, 170, 40, 'F');
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS', 30, yPos);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...accentColor);
    const terms = [
        '• Present this ticket with valid photo ID at entrance',
        '• Valid only for specified date and attraction',
        '• Entry subject to operating hours and availability',
        '• No refunds, exchanges, or date modifications allowed',
        '• Keep ticket safe - duplicate copies will not be issued'
    ];
    
    let termY = yPos + 8;
    terms.forEach(term => {
        doc.text(term, 30, termY);
        termY += 6;
    });
    
    // Footer - WanderAI branding
    doc.setFillColor(...darkGray);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('WanderAI - Bhopal Tourism | support@wanderai.com | +91-755-123456', 105, 290, { align: 'center' });
    
    // Download with clean filename
    const cleanTicketId = cleanText(bookingData.ticket_id);
    doc.save(`WanderAI_Bhopal_Ticket_${cleanTicketId}.pdf`);
    
    console.log('PDF ticket generated successfully!');
}