import { ContactFormData, AppointmentFormData, QuoteFormData, Order } from '../types';
import { KNOWLEDGE_BASE, FALLBACK_ANSWER } from '../data/knowledgeBase';
import { N8N_CHAT_WEBHOOK_URL } from '../constants';

// Specific Webhook URL provided for the Quote/Invoice logic
const N8N_QUOTE_WEBHOOK = "https://vmi2920096.contaboserver.net/webhook-test/quote-manual-final";

// Points to the local Node.js server (from server/server.js) - kept for other forms if needed
const BACKEND_URL = 'http://localhost:5000/api';
const CONTACT_EMAIL = "buzzitechgh@gmail.com";

// Utility to simulate network delay for fallback
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to try sending to backend, falling back to simulation if offline
const postToBackend = async (endpoint: string, data: any) => {
  try {
    const response = await fetch(`${BACKEND_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`[Backend Offline] Could not connect to ${BACKEND_URL}. Using simulation mode.`, error);
    return null; // Return null to indicate failure/fallback
  }
};

export const api = {
  submitContactForm: async (data: ContactFormData): Promise<{ success: boolean; message: string }> => {
    console.log("Submitting Contact Form...", data);
    const result = await postToBackend('contact', data);
    if (result && result.success) return result;
    await delay(1500);
    return { success: true, message: "Message sent successfully!" };
  },

  bookAppointment: async (data: AppointmentFormData): Promise<{ success: boolean; message: string }> => {
    console.log("Submitting Booking...", data);
    const result = await postToBackend('booking', data);
    if (result && result.success) return result;
    await delay(1500);
    return { success: true, message: "Appointment request submitted successfully!" };
  },

  // E-COMMERCE PAYMENT PROCESSING
  processPayment: async (order: Order): Promise<{ success: boolean; transactionId: string }> => {
    console.log(`Processing ${order.paymentMethod} Payment for GHS ${order.total}`, order);
    await delay(3000); // Simulate processing time
    
    // Simulate webhooks/backend recording
    try {
        await fetch(N8N_QUOTE_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...order,
                type: 'STORE_ORDER',
                paymentStatus: 'SUCCESS'
            })
        });
    } catch (e) {
        console.warn("Could not log order to N8N");
    }

    return { 
        success: true, 
        transactionId: `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}` 
    };
  },

  // Updated Quote Request to use the specific N8N Webhook
  requestQuotation: async (data: QuoteFormData): Promise<{ success: boolean; message: string; data?: any }> => {
    console.log("Submitting Quote to N8N...", data);
    
    const payload = {
      customer_name: data.name,
      customer_email: data.email,
      customer_phone: data.phone,
      selected_services: data.items.map(item => ({
        name: item.name,
        category: item.category,
        description: item.description || "",
        unit_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      })),
      grand_total: data.grandTotal,
      notes: data.description,
      quote_generated: true,
      invoice_requested: true
    };

    try {
      const response = await fetch(N8N_QUOTE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook Error: ${response.status} ${response.statusText}`);
      }

      const resultData = await response.json();
      return { 
        success: true, 
        message: "Quote generated and sent to processing.", 
        data: resultData 
      };
    } catch (error) {
      // Log as warning instead of error since we have a fallback
      console.warn("N8N Webhook unreachable, switching to offline generation.", error);
      // Fallback only if webhook fails totally, to ensure user still gets PDF
      return { success: true, message: "Local quote generated (Offline Mode)." }; 
    }
  },

  // New: Handle Customer Feedback
  submitFeedback: async (feedbackData: { name: string, email: string, message: string }): Promise<void> => {
    console.log("Sending Feedback to N8N...");
    try {
      await fetch(N8N_QUOTE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: feedbackData.name,
          customer_email: feedbackData.email,
          feedback_message: feedbackData.message,
          customer_feedback: true
        })
      });
    } catch (error) {
      console.warn("Feedback submission failed", error);
    }
  },

  // Intelligent Chatbot Logic utilizing Knowledge Base and N8N Sync
  sendChatMessage: async (message: string): Promise<{ text: string, action?: string }> => {
    const lowerMsg = message.toLowerCase().trim();

    // 1. Phone / Action Detection (High Priority)
    if (lowerMsg.includes('call me') || lowerMsg.includes('speak to human') || lowerMsg.includes('agent')) {
       await delay(500);
       return { 
           text: "I can have our AI Voice Assistant call you immediately to discuss your needs. Please enter your phone number.",
           action: 'request_phone'
       };
    }

    const phoneMatch = message.match(/(\+233|0)\d{9}/);
    if (phoneMatch) {
       await delay(800);
       return { 
           text: `Thanks! I'm initiating a priority call to ${phoneMatch[0]} right now using our AI Voice Agent. Please keep your line open, you will receive a call within 30 seconds.`,
           action: 'trigger_call'
       };
    }

    // 2. Check Local Knowledge Base (Medium Priority - Accurate Company Info & Troubleshooting)
    let bestMatch = null;
    let highestScore = 0;

    KNOWLEDGE_BASE.forEach(entry => {
      let score = 0;
      entry.keywords.forEach(keyword => {
        if (lowerMsg.includes(keyword.toLowerCase())) {
          // Weighted scoring: Longer keywords usually mean more specific matches
          score += 1 + (keyword.length * 0.1);
          
          // Boost score significantly if it's a direct topic match (e.g. from buttons)
          if (lowerMsg === keyword.toLowerCase() || lowerMsg === `tell me about ${keyword.toLowerCase()}` || lowerMsg.includes(`about ${keyword.toLowerCase()}`)) {
             score += 10;
          }
        }
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = entry;
      }
    });

    // If we have a confident match in local KB, use it.
    if (bestMatch && highestScore >= 1.0) {
      await delay(600); // Simulate "typing"
      return { text: bestMatch.answer, action: bestMatch.action }; // Include action trigger
    }

    // 3. Fallback to N8N AI Agent (Low Priority - General Queries)
    if (N8N_CHAT_WEBHOOK_URL && !N8N_CHAT_WEBHOOK_URL.includes('your-n8n-instance')) {
        try {
            const response = await fetch(N8N_CHAT_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    chatInput: message,
                    sessionId: localStorage.getItem('chat_session_id') || `session-${Date.now()}`
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.output || data.text) {
                    return { 
                        text: data.output || data.text,
                        action: data.action
                    };
                }
            }
        } catch (error) {
            console.warn("N8N Agent unreachable or offline, switching to fallback.", error);
        }
    }

    await delay(500);
    return { text: FALLBACK_ANSWER };
  }
};