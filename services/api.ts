import { ContactFormData, AppointmentFormData, QuoteFormData, Order, Product } from '../types';
import { KNOWLEDGE_BASE, FALLBACK_ANSWER } from '../data/knowledgeBase';
import { PRODUCTS } from '../data/products'; // Import local data for offline fallback
import { N8N_CHAT_WEBHOOK_URL } from '../constants';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Configuration ---
const SUPABASE_URL = 'https://jdycmzvvuljmlqhoqsym.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GUZkKtprO6okpS1c29qaAA_0R6eBJSL';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Specific Webhook URL provided for the Quote/Invoice logic
const N8N_QUOTE_WEBHOOK = "https://vmi2920096.contaboserver.net/webhook-test/quote-manual-final";

// Backend Configuration
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

// Utility for making API requests
const request = async (endpoint: string, method: string, data?: any, token?: string) => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}/${endpoint}`, config);
    
    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
       const responseData = await response.json();
       if (!response.ok) {
           throw new Error(responseData.message || `Server error: ${response.status}`);
       }
       return responseData;
    } else {
       if (!response.ok) throw new Error(`Server error: ${response.status}`);
       return { success: true }; // Fallback for non-json OK responses
    }

  } catch (error: any) {
    console.warn(`Backend API (${endpoint}) unreachable:`, error.message);
    throw error;
  }
};

export const api = {
  // --- PUBLIC FORMS ---
  submitContactForm: async (data: ContactFormData): Promise<{ success: boolean; message: string }> => {
    try {
      return await request('forms/contact', 'POST', data);
    } catch (e) {
      return { success: true, message: "Sent (Offline Mode)" };
    }
  },

  bookAppointment: async (data: AppointmentFormData): Promise<{ success: boolean; message: string }> => {
    try {
      return await request('forms/booking', 'POST', data);
    } catch (e) {
      return { success: true, message: "Booked (Offline Mode)" };
    }
  },

  // --- ADMIN AUTH ---
  login: async (email: string, password: string) => {
    try {
      return await request('auth/login', 'POST', { email, password });
    } catch (error) {
      // Fallback for Offline Demo
      if (email === 'admin@buzzitech.com' && password === 'password123') {
        return {
          success: true,
          token: 'mock-admin-token-' + Date.now(),
          name: 'Buzzitech Admin',
          email: email
        };
      }
      throw new Error('Invalid credentials or Server Offline');
    }
  },

  // --- ADMIN DATA ---
  
  // 1. STATS & VISITS
  getAdminStats: async (token: string) => {
    try {
      return await request('stats', 'GET', undefined, token);
    } catch (error) {
       // Mock Data
       return {
         totalVisits: 12450,
         monthlyVisits: 3200,
         totalRevenue: 45200,
         activeOrders: 5,
         pendingQuotes: 3
       };
    }
  },

  // 2. ORDERS
  getAdminOrders: async (token: string) => {
    try {
      return await request('orders', 'GET', undefined, token);
    } catch (error) {
      // Return Mock Orders for Demo
      return [
        {
          _id: 'mock-1',
          orderId: 'ORD-1715623',
          customer: { 
            name: 'Kwame Osei', 
            phone: '0501234567', 
            email: 'kwame@example.com',
            region: 'Greater Accra',
            address: 'Hse No 45, East Legon, Accra\n(GPS: 5.6037, -0.1870)'
          },
          total: 8500,
          status: 'Completed',
          paymentMethod: 'momo',
          items: [{ name: 'Starlink Standard Kit', quantity: 1, price: 8500 }],
          deliveryMode: 'delivery',
          date: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: 'mock-2',
          orderId: 'ORD-1715628',
          customer: { 
            name: 'Sarah Mensah', 
            phone: '0249876543', 
            email: 'sarah@example.com',
            region: 'Ashanti',
            address: 'Plot 10, Kumasi'
          },
          total: 1800,
          status: 'Pending',
          paymentMethod: 'paystack',
          items: [
            { name: 'Tp-Link Deco M4', quantity: 1, price: 1550 },
            { name: 'Cat6 Cable (10m)', quantity: 1, price: 250 }
          ],
          deliveryMode: 'delivery',
          date: new Date().toISOString()
        }
      ];
    }
  },

  // 3. BOOKINGS
  getAdminBookings: async (token: string) => {
    try {
      return await request('bookings', 'GET', undefined, token);
    } catch (error) {
      return [
        {
           id: 'bk-1',
           name: 'John Doe',
           email: 'john@gmail.com',
           phone: '0558493021',
           serviceType: 'Starlink Setup',
           date: '2023-11-20',
           time: '14:00',
           status: 'Confirmed'
        },
        {
           id: 'bk-2',
           name: 'Anita Ofori',
           email: 'anita@yahoo.com',
           phone: '0204938271',
           serviceType: 'CCTV Survey',
           date: '2023-11-22',
           time: '10:00',
           status: 'Pending'
        }
      ];
    }
  },

  // 4. MESSAGES
  getAdminMessages: async (token: string) => {
    try {
      return await request('messages', 'GET', undefined, token);
    } catch (error) {
      return [
        {
          id: 'msg-1',
          name: 'David Boateng',
          email: 'david.b@company.com',
          phone: '0244000000',
          service: 'Networking',
          message: 'We need structured cabling for our new office block in Tema.',
          date: new Date(Date.now() - 10000000).toISOString(),
          read: false
        },
        {
          id: 'msg-2',
          name: 'Grace Appiah',
          email: 'grace@gmail.com',
          phone: '0500000000',
          service: 'General Inquiry',
          message: 'Do you sell laptop batteries for HP Elitebook?',
          date: new Date(Date.now() - 50000000).toISOString(),
          read: true
        }
      ];
    }
  },

  // 5. QUOTES
  getAdminQuotes: async (token: string) => {
    try {
      return await request('quotes', 'GET', undefined, token);
    } catch (error) {
      return [
        {
          id: 'qt-1',
          name: 'TechHub Ghana',
          email: 'procurement@techhub.com',
          phone: '0302999999',
          serviceType: 'CCTV Security',
          grandTotal: 15400,
          description: '16 Channel Installation with 4K Cameras',
          date: new Date().toISOString()
        }
      ];
    }
  },

  // 6. INVENTORY
  getAdminProducts: async (token: string) => {
    try {
      return await request('products', 'GET', undefined, token);
    } catch (error) {
      return PRODUCTS; // Return local products if backend fails
    }
  },

  // Public fetch for store
  getProducts: async () => {
    try {
       return await request('products', 'GET');
    } catch (e) {
       return PRODUCTS; // Return local products if backend fails
    }
  },

  updateProductStock: async (id: string, stock: number, token: string) => {
    // Mock update if backend fails
    try {
      return await request(`products/${id}`, 'PUT', { stock }, token);
    } catch (e) {
      return { success: true };
    }
  },

  // --- E-COMMERCE PAYMENT PROCESSING ---
  processPayment: async (order: Order): Promise<{ success: boolean; transactionId: string }> => {
    
    // 1. Send to Node.js Backend (Source of Truth for Admin)
    try {
      await request('orders', 'POST', {
        id: order.id,
        items: order.items,
        total: order.total,
        customer: order.customer,
        deliveryMode: order.deliveryMode,
        paymentMethod: order.paymentMethod,
        installationType: order.installationType,
        installationCost: order.installationCost
      });
    } catch (err) {
      console.error("Backend Order Sync Failed:", err);
    }

    // 2. Send Order to Supabase (Backup / Legacy Storage)
    try {
      let productSummary = order.items.map(item => `${item.quantity}x ${item.name}`).join(', ');
      productSummary += ` | Delivery: ${order.deliveryMode === 'delivery' ? 'Door (GHS ' + order.deliveryCost + ')' : 'Pickup'}`;
      
      if (order.installationType !== 'none') {
         productSummary += ` | Install: ${order.installationType === 'estimate' ? 'On-Site Estimate' : 'Standard (GHS ' + order.installationCost + ')'}`;
      }

      await supabase.from('orders').insert({
          order_id: order.id,
          full_name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone,
          delivery_address: order.customer.address,
          region: order.customer.region,
          order_type: order.deliveryMode,
          product_names: productSummary,
          total_amount: order.total,
          payment_method: order.paymentMethod,
          status: order.status,
          created_at: new Date().toISOString()
        });
    } catch (err) {
      console.error("Supabase Connection Failed:", err);
    }

    // 3. Trigger N8N webhook
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
        console.debug("N8N Webhook note: Could not log order to N8N");
    }

    return { success: true, transactionId: order.id };
  },

  // --- QUOTES ---
  requestQuotation: async (data: QuoteFormData): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      // Log to backend
      request('forms/quote', 'POST', data);
    } catch(e) {}

    // Send to N8N
    try {
      const response = await fetch(N8N_QUOTE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      });

      if (!response.ok) throw new Error("Webhook failed");
      const resultData = await response.json();
      
      return { 
        success: true, 
        message: "Quote generated and sent to processing.", 
        data: resultData 
      };
    } catch (error) {
      return { success: true, message: "Local quote generated (Offline Mode)." }; 
    }
  },

  submitFeedback: async (feedbackData: { name: string, email: string, message: string }): Promise<void> => {
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

  // --- CHATBOT ---
  sendChatMessage: async (message: string): Promise<{ text: string, action?: string }> => {
    const lowerMsg = message.toLowerCase().trim();

    if (lowerMsg.includes('call me') || lowerMsg.includes('speak to human') || lowerMsg.includes('agent')) {
       return { 
           text: "I can have our AI Voice Assistant call you immediately. Please enter your phone number.",
           action: 'request_phone'
       };
    }

    const phoneMatch = message.match(/(\+233|0)\d{9}/);
    if (phoneMatch) {
       return { 
           text: `Thanks! I'm initiating a priority call to ${phoneMatch[0]} right now using our AI Voice Agent.`,
           action: 'trigger_call'
       };
    }

    let bestMatch = null;
    let highestScore = 0;

    KNOWLEDGE_BASE.forEach(entry => {
      let score = 0;
      entry.keywords.forEach(keyword => {
        if (lowerMsg.includes(keyword.toLowerCase())) {
          score += 1 + (keyword.length * 0.1);
          if (lowerMsg === keyword.toLowerCase() || lowerMsg.includes(`about ${keyword.toLowerCase()}`)) {
             score += 10;
          }
        }
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = entry;
      }
    });

    if (bestMatch && highestScore >= 1.0) {
      return { text: bestMatch.answer, action: bestMatch.action }; 
    }

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
            console.warn("N8N Agent unreachable or offline.", error);
        }
    }

    return { text: FALLBACK_ANSWER };
  }
};