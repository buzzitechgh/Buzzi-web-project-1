import { ContactFormData, AppointmentFormData, QuoteFormData, Order, Product, Technician } from '../types';
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
const DEFAULT_FORMSPREE_URL = "https://formspree.io/f/mgvgdbyr";

// Backend Configuration
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get dynamic settings
const getStoredSettings = () => {
  const saved = localStorage.getItem('buzzitech_settings');
  return saved ? JSON.parse(saved) : {};
};

// Helper to send to Formspree
const sendToFormspree = async (data: any, formType: string) => {
  const settings = getStoredSettings();
  const url = settings.formspreeUrl || DEFAULT_FORMSPREE_URL;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...data,
        _subject: `New ${formType} from Buzzitech Website`,
        form_type: formType,
        timestamp: new Date().toLocaleString()
      })
    });
    
    if (!response.ok) {
        console.warn(`Formspree submission failed: ${response.statusText}`);
    }
  } catch (error) {
    console.warn("Formspree connection error:", error);
  }
};

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

// Mock Data Stores for Demo
let MOCK_TECHNICIANS: Technician[] = [
  { id: 't1', name: "Kwame Osei", role: "Network Engineer", rating: 4.8, feedback: "Very professional cabling work.", status: 'Active' },
  { id: 't2', name: "John Mensah", role: "CCTV Specialist", rating: 4.5, feedback: "Clean installation, polite.", status: 'Busy' },
  { id: 't3', name: "Sarah Addo", role: "Software Support", rating: 5.0, feedback: "Solved the POS issue quickly.", status: 'Active' },
  { id: 't4', name: "Emmanuel K.", role: "Field Technician", rating: 4.2, feedback: "Good work but arrived slightly late.", status: 'Active' }
];

let MOCK_ORDERS = [
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
    status: 'Processing',
    paymentMethod: 'paystack',
    items: [
      { name: 'Tp-Link Deco M4', quantity: 1, price: 1550 },
      { name: 'Cat6 Cable (10m)', quantity: 1, price: 250 }
    ],
    deliveryMode: 'delivery',
    date: new Date().toISOString()
  }
];

export const api = {
  // --- PUBLIC FORMS ---
  submitContactForm: async (data: ContactFormData): Promise<{ success: boolean; message: string; ticketId?: string }> => {
    // 1. Send to Formspree (Primary Collection)
    await sendToFormspree(data, 'Contact Inquiry');

    try {
      const settings = getStoredSettings();
      // If Ticketing, generate ID
      const ticketId = data.service === 'Technical Support' ? `TKT-${Math.floor(100000 + Math.random() * 900000)}` : undefined;
      
      // Use configured N8N if available, else default
      const webhookUrl = settings.n8nWebhook || N8N_QUOTE_WEBHOOK;
      
      // Attempt webhook
      fetch(webhookUrl, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ ...data, ticketId, type: 'CONTACT_FORM' })
      }).catch(e => console.log("Webhook skipped"));

      // Try Backend (might fail if offline, but Formspree handles the data collection)
      try {
        await request('forms/contact', 'POST', { ...data, ticketId });
      } catch (backendError) {
        console.log("Backend offline, relying on Formspree");
      }

      return { success: true, message: "Message Sent Successfully", ticketId };
    } catch (e) {
      const ticketId = data.service === 'Technical Support' ? `TKT-${Math.floor(100000 + Math.random() * 900000)}` : undefined;
      return { success: true, message: "Sent (Formspree Mode)", ticketId };
    }
  },

  submitLead: async (contact: string): Promise<{ success: boolean }> => {
    // Send quick leads to Formspree too
    await sendToFormspree({ contact, type: 'Quick Lead' }, 'Lead Generation');
    try {
      console.log("Lead captured:", contact);
      // Simulate API call
      return { success: true };
    } catch (e) {
      return { success: true };
    }
  },

  bookAppointment: async (data: AppointmentFormData): Promise<{ success: boolean; message: string }> => {
    // 1. Send to Formspree (Primary Collection)
    await sendToFormspree(data, 'Appointment Booking');

    try {
      try {
        await request('forms/booking', 'POST', data);
      } catch (backendError) {
        console.log("Backend offline, relying on Formspree");
      }
      return { success: true, message: "Booking Request Sent" };
    } catch (e) {
      return { success: true, message: "Booked (Formspree Mode)" };
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
         pendingQuotes: 3,
         openTickets: 4
       };
    }
  },

  // 2. ORDERS MANAGEMENT
  getAdminOrders: async (token: string) => {
    try {
      return await request('orders', 'GET', undefined, token);
    } catch (error) {
      return MOCK_ORDERS;
    }
  },

  updateOrderStatus: async (orderId: string, status: string, token: string) => {
    try {
      // Mock update
      MOCK_ORDERS = MOCK_ORDERS.map(o => o.orderId === orderId ? { ...o, status } : o);
      return await request(`orders/${orderId}/status`, 'PUT', { status }, token);
    } catch (error) {
      // Fallback update
      return { success: true, message: "Status updated locally" };
    }
  },

  // 3. TRACKING (PUBLIC)
  trackOrder: async (orderId: string) => {
    try {
      // Check real backend first
      return await request(`orders/track/${orderId}`, 'GET');
    } catch (error) {
      // Mock search
      const order = MOCK_ORDERS.find(o => o.orderId.toLowerCase() === orderId.toLowerCase());
      if (order) return order;
      throw new Error("Order not found");
    }
  },

  // 4. TECHNICIAN MANAGEMENT
  getTechnicians: async (token: string) => {
    // In a real app, fetch from DB
    return MOCK_TECHNICIANS;
  },

  addTechnician: async (techData: Partial<Technician>, token: string) => {
    const newTech: Technician = {
        id: `t-${Date.now()}`,
        name: techData.name || 'New Tech',
        role: techData.role || 'General Staff',
        rating: techData.rating || 5,
        feedback: techData.feedback || 'No records yet.',
        status: 'Active'
    };
    MOCK_TECHNICIANS.push(newTech);
    return { success: true, technicians: MOCK_TECHNICIANS };
  },

  // 5. BOOKINGS & TASKS & RATINGS
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
           status: 'Completed',
           technician: 'Kwame Osei', 
           taskStatus: 'Done',
           rating: 5,
           workDone: 'Mounted dish on roof, routed cable through attic, set up router. Speed test: 150Mbps.',
           customerFeedback: 'Excellent service, very neat work.'
        },
        {
           id: 'bk-2',
           name: 'Anita Ofori',
           email: 'anita@yahoo.com',
           phone: '0204938271',
           serviceType: 'CCTV Survey',
           date: '2023-11-22',
           time: '10:00',
           status: 'Pending',
           technician: null,
           taskStatus: 'Unassigned',
           rating: null
        }
      ];
    }
  },

  assignTechnician: async (bookingId: string, technicianName: string, token: string) => {
      console.log(`Assigning ${technicianName} to booking ${bookingId}`);
      return { success: true };
  },

  // 6. MESSAGES & TICKETS
  getAdminMessages: async (token: string) => {
    try {
      return await request('messages', 'GET', undefined, token);
    } catch (error) {
      return [
        {
          id: 'msg-1',
          ticketId: 'TKT-829301',
          name: 'David Boateng',
          email: 'david.b@company.com',
          phone: '0244000000',
          service: 'Technical Support',
          message: 'We need structured cabling for our new office block in Tema.',
          date: new Date(Date.now() - 10000000).toISOString(),
          status: 'Open',
          replies: []
        },
        {
          id: 'msg-2',
          name: 'Grace Appiah',
          email: 'grace@gmail.com',
          phone: '0500000000',
          service: 'General Inquiry',
          message: 'Do you sell laptop batteries for HP Elitebook?',
          date: new Date(Date.now() - 50000000).toISOString(),
          status: 'Resolved',
          replies: [{ sender: 'Admin', text: 'Yes, we have them in stock.', date: new Date().toISOString() }]
        }
      ];
    }
  },

  replyToMessage: async (messageId: string, replyText: string, token: string) => {
      console.log(`Replying to ticket ${messageId}: ${replyText}`);
      return { success: true };
  },

  // 7. QUOTES
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

  // 8. INVENTORY
  getAdminProducts: async (token: string) => {
    try {
      return await request('products', 'GET', undefined, token);
    } catch (error) {
      return PRODUCTS; 
    }
  },

  // Public fetch for store
  getProducts: async () => {
    try {
       return await request('products', 'GET');
    } catch (e) {
       return PRODUCTS;
    }
  },

  updateProductStock: async (id: string, stock: number, token: string) => {
    try {
      return await request(`products/${id}`, 'PUT', { stock }, token);
    } catch (e) {
      return { success: true };
    }
  },

  updateProductDetails: async (product: Product, token: string) => {
      console.log("Updating product:", product);
      return { success: true };
  },

  addProduct: async (product: Product, token: string) => {
      console.log("Creating new product:", product);
      // In a real app, this posts to the backend
      return { success: true, product };
  },

  // --- UPLOAD SERVICE ---
  uploadImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      // We use plain fetch here because headers content-type multipart/form-data
      // is automatically set by browser with boundary when using FormData
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if(!response.ok) throw new Error("Upload failed");
      
      const data = await response.json();
      
      // If backend returns partial path, prepend URL base
      // NOTE: In production, ensure this points to the right static server
      return data.image.startsWith('http') ? data.image : `${(import.meta as any).env?.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${data.image}`;
    } catch (e) {
      console.error("Upload error", e);
      // Fallback for demo
      return URL.createObjectURL(file);
    }
  },

  // 9. SITE SETTINGS & CONFIGURATION
  updateSiteImages: async (images: any, token: string) => {
      console.log("Updating site images:", images);
      return { success: true };
  },

  saveSettings: async (settings: any, token: string) => {
      console.log("Saving System Settings:", settings);
      localStorage.setItem('buzzitech_settings', JSON.stringify(settings));
      return { success: true };
  },

  getSettings: async (token: string) => {
      return getStoredSettings();
  },

  // --- E-COMMERCE PAYMENT PROCESSING ---
  processPayment: async (order: Order): Promise<{ success: boolean; transactionId: string }> => {
    const settings = getStoredSettings();
    const paystackKey = settings.paystackPublicKey;
    
    if (order.paymentMethod === 'paystack' && paystackKey) {
        console.log("Initializing Paystack with key:", paystackKey);
        // Real Paystack integration would happen here or redirect
    }

    // 1. Send to Node.js Backend
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

    // 2. Send Order to Supabase
    try {
      let productSummary = order.items.map(item => `${item.quantity}x ${item.name}`).join(', ');
      await supabase.from('orders').insert({
          order_id: order.id,
          full_name: order.customer.name,
          email: order.customer.email,
          total_amount: order.total,
          status: order.status,
          created_at: new Date().toISOString()
        });
    } catch (err) {
      console.error("Supabase Connection Failed:", err);
    }

    // Update mock orders for demo
    MOCK_ORDERS.unshift({
        _id: 'new-' + Date.now(),
        orderId: order.id,
        customer: order.customer,
        total: order.total,
        status: 'Pending',
        paymentMethod: order.paymentMethod,
        items: order.items,
        deliveryMode: order.deliveryMode,
        date: new Date().toISOString()
    } as any);

    return { success: true, transactionId: order.id };
  },

  // --- QUOTES ---
  requestQuotation: async (data: QuoteFormData): Promise<{ success: boolean; message: string; data?: any }> => {
    // Send to Formspree as well
    await sendToFormspree(data, 'Quote Request');

    try {
      // Log to backend
      request('forms/quote', 'POST', data);
    } catch(e) {}

    // Send to N8N
    try {
      const settings = getStoredSettings();
      const webhook = settings.n8nWebhook || N8N_QUOTE_WEBHOOK;

      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
             ...data,
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
    await sendToFormspree(feedbackData, 'Customer Feedback');
    try {
      const settings = getStoredSettings();
      const webhook = settings.n8nWebhook || N8N_QUOTE_WEBHOOK;
      
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...feedbackData, customer_feedback: true })
      });
    } catch (error) {
      console.warn("Feedback submission failed", error);
    }
  },

  // --- CHATBOT ---
  sendChatMessage: async (message: string): Promise<{ text: string, action?: string }> => {
    const settings = getStoredSettings();
    const chatWebhook = settings.n8nChatWebhook || N8N_CHAT_WEBHOOK_URL;

    const lowerMsg = message.toLowerCase().trim();

    if (lowerMsg.includes('call me') || lowerMsg.includes('speak to human') || lowerMsg.includes('agent')) {
       return { 
           text: "I can have our AI Voice Assistant call you immediately. Please enter your phone number.",
           action: 'request_phone'
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

    if (chatWebhook && !chatWebhook.includes('your-n8n-instance')) {
        try {
            const response = await fetch(chatWebhook, {
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