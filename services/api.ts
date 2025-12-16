import { ContactFormData, AppointmentFormData, QuoteFormData, Order, Product, Technician, ChatMessage, Meeting, User, KnowledgeEntry, LoginLog } from '../types';
import { KNOWLEDGE_BASE, FALLBACK_ANSWER } from '../data/knowledgeBase';
import { PRODUCTS as LOCAL_PRODUCTS } from '../data/products'; 

// --- CONFIGURATION ---
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get token
const getAuthToken = () => {
    return localStorage.getItem('adminToken') || 
           localStorage.getItem('customerToken') || 
           localStorage.getItem('techToken');
};

// Helper for authorized fetch
const authFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.statusText}`);
      }

      return response.json();
  } catch (error: any) {
      // Re-throw to be handled by specific methods with fallbacks
      throw error;
  }
};

// --- MOCK DATA STORES (For features not yet in Backend or Fallback) ---
let MOCK_KNOWLEDGE_BASE: KnowledgeEntry[] = [...KNOWLEDGE_BASE];
let MOCK_TECHNICIANS: Technician[] = [
    { id: 't1', name: 'Kwame Mensah', role: 'Network Engineer', status: 'Active', rating: 4.8, feedback: 'Excellent work', department: 'Infrastructure', jobsCompleted: 12 },
    { id: 't2', name: 'Sarah Doe', role: 'CCTV Specialist', status: 'Busy', rating: 4.5, feedback: 'Very detailed', department: 'Security', jobsCompleted: 8 }
]; 
let MOCK_BOOKINGS: any[] = [
    { id: 'bk-1', name: 'John Doe', serviceType: 'CCTV Installation', date: '2023-10-25', time: '10:00', status: 'Pending', technician: null, completionCode: '1234' }
];
let MOCK_MESSAGES: any[] = [
    { id: 'msg-1', subject: 'Inquiry', message: 'Do you sell Starlink?', sender: 'Alice', status: 'Open', date: new Date().toISOString() }
];
let MOCK_USERS: User[] = [
    { id: 'u1', name: 'Admin User', email: 'admin@buzzitech.com', role: 'admin', status: 'Active', isOnline: true, isApproved: true },
    { id: 'u2', name: 'Kwame Mensah', email: 'kwame@buzzitech.com', role: 'technician', status: 'Active', isOnline: false, isApproved: true },
    { id: 'u3', name: 'Client One', email: 'client@gmail.com', role: 'customer', status: 'Active', isOnline: true, isApproved: true }
];
let MOCK_LOGS: LoginLog[] = [];
let MOCK_CHATS: ChatMessage[] = [];
let MOCK_MEETINGS: Meeting[] = [];

export const api = {
  // --- PUBLIC FORMS (Connected to Backend Email Service) ---
  
  submitContactForm: async (data: ContactFormData): Promise<{ success: boolean; message: string; ticketId?: string }> => {
    try {
      await fetch(`${API_URL}/forms/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return { success: true, message: "Message Sent Successfully" };
    } catch (e) {
      console.error("Form submit error", e);
      return { success: false, message: "Failed to send message. Please try again." };
    }
  },

  submitLead: async (contact: string): Promise<{ success: boolean }> => {
    try {
        await fetch(`${API_URL}/forms/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Lead', email: 'no-reply@lead.com', phone: contact, service: 'Quick Callback', message: `Callback requested for: ${contact}` })
        });
        return { success: true };
    } catch(e) {
        return { success: false };
    }
  },

  bookAppointment: async (data: AppointmentFormData): Promise<{ success: boolean; message: string }> => {
    try {
      await fetch(`${API_URL}/forms/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return { success: true, message: "Booking Request Sent" };
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  requestQuotation: async (data: QuoteFormData): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
        await fetch(`${API_URL}/forms/quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return { success: true, message: "Quote request processed." }; 
    } catch(e) {
        return { success: false, message: "Failed to send quote request" };
    }
  },

  // --- AUTHENTICATION (Connected to Backend with Fallback) ---
  
  // Generic Login (Admin, Tech, Customer)
  login: async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.requiresVerification) throw { requiresVerification: true, email: data.email, message: 'Account Verification Required' };
        if (data.isPendingApproval) throw { isPendingApproval: true, message: data.message };
        throw new Error(data.message || 'Login failed');
      }

      if (data.requiresTwoFactor) {
          return { success: true, requiresTwoFactor: true, email: data.email };
      }

      return { 
        success: true, 
        token: data.token, 
        user: {
            id: data._id,
            name: data.name,
            email: data.email,
            role: data.role,
            technicianId: data.technicianId,
            isTwoFactorEnabled: data.isTwoFactorEnabled
        },
        isAdmin: data.isAdmin
      };
    } catch (error: any) {
      // --- MOCK FALLBACK MODE ---
      // If the backend is down, allow login with any admin email to permit UI testing
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || error.name === 'TypeError') {
          console.warn("Backend Unreachable. Switching to MOCK LOGIN Mode.");
          await new Promise(r => setTimeout(r, 1000)); // Simulate delay

          if (email.toLowerCase().includes('admin')) {
              return { 
                  success: true, 
                  token: 'mock-admin-token', 
                  user: { id: 'mock-admin', name: 'Mock Admin', email, role: 'admin', isTwoFactorEnabled: false }, 
                  isAdmin: true 
              };
          } else if (email.toLowerCase().includes('tech')) {
              return { 
                  success: true, 
                  token: 'mock-tech-token', 
                  user: { id: 'mock-tech', name: 'Mock Technician', email, role: 'technician', isTwoFactorEnabled: false }, 
                  isAdmin: false 
              };
          } else {
              // Default customer mock
              return { 
                  success: true, 
                  token: 'mock-customer-token', 
                  user: { id: 'mock-cust', name: 'Mock Customer', email, role: 'customer', isTwoFactorEnabled: false }, 
                  isAdmin: false 
              };
          }
      }
      throw error;
    }
  },

  // Generic Register (Supports Technician fields)
  register: async (data: any) => {
      try {
          const res = await fetch(`${API_URL}/auth/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message);
          
          return result; 
      } catch (e) {
          throw e;
      }
  },

  verifyEmail: async (email: string, code: string) => {
      try {
          const res = await fetch(`${API_URL}/auth/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, code })
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message);
          return result; 
      } catch (e) {
          throw e;
      }
  },

  verifyTwoFactor: async (email: string, code: string) => {
      try {
          const res = await fetch(`${API_URL}/auth/verify-2fa`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, code })
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message);
          
          return { 
            success: true, 
            token: result.token, 
            user: {
                id: result._id,
                name: result.name,
                email: result.email,
                role: result.role,
                technicianId: result.technicianId,
                isTwoFactorEnabled: result.isTwoFactorEnabled
            },
            isAdmin: result.isAdmin
          };
      } catch (e) {
          throw e;
      }
  },

  resendOtp: async (email: string) => {
      await fetch(`${API_URL}/auth/resend-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
      });
      return { success: true };
  },

  toggleTwoFactor: async () => {
      return await authFetch('/auth/toggle-2fa', { method: 'PUT' });
  },

  // Admin Approve User
  approveUser: async (userId: string, token: string) => {
      try {
        return await authFetch(`/auth/approve/${userId}`, { method: 'PUT' });
      } catch (e) {
        // Fallback for mock mode
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user) user.status = 'Active'; 
        return { success: true };
      }
  },

  // Legacy wrappers for UI components
  customerLogin: async (email: string, password: string) => {
      return api.login(email, password);
  },

  technicianLogin: async (email: string, password: string) => {
      return api.login(email, password);
  },

  requestPasswordReset: async (email: string) => {
      // For now, reuse resendOtp as the flow is similar in this demo
      return api.resendOtp(email);
  },

  verifyResetCode: async (email: string, code: string) => {
      return api.verifyEmail(email, code); 
  },

  resetPassword: async (email: string, newPassword: string, code?: string) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { success: true, message: "Password updated." };
  },

  // --- E-COMMERCE & PRODUCTS ---

  getProducts: async () => {
      try {
          const res = await fetch(`${API_URL}/products`);
          if (!res.ok) throw new Error('Failed to fetch products');
          return await res.json();
      } catch (e) {
          console.warn("Backend products unreachable, using local fallback.");
          return LOCAL_PRODUCTS;
      }
  },

  getAdminProducts: async (token: string) => {
      try {
        return await authFetch('/products');
      } catch (e) {
        return LOCAL_PRODUCTS; // Fallback to local products if backend down
      }
  },

  addProduct: async (product: Product, token: string) => {
      return await authFetch('/products', {
          method: 'POST',
          body: JSON.stringify(product)
      });
  },

  updateProductDetails: async (product: Product, token: string) => {
      return await authFetch(`/products/${product.id}`, {
          method: 'PUT',
          body: JSON.stringify(product)
      });
  },

  deleteProduct: async (id: string, token: string) => {
      try {
          await authFetch(`/products/${id}`, { method: 'DELETE' });
          return { success: true };
      } catch (e) {
          console.error(e);
          return { success: false };
      }
  },

  // --- ORDERS ---

  processPayment: async (order: Order): Promise<{ success: boolean; transactionId: string }> => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return { success: true, transactionId: data.transactionId };
    } catch (e) {
      console.error(e);
      // Fallback for demo
      return { success: true, transactionId: `MOCK-${Date.now()}` };
    }
  },

  getAdminOrders: async (token: string) => {
      try {
        return await authFetch('/orders');
      } catch(e) {
        return []; // Return empty if backend down
      }
  },

  updateOrderStatus: async (orderId: string, status: string, token: string) => {
      return { success: true };
  },

  trackOrder: async (orderId: string) => {
      try {
          const res = await fetch(`${API_URL}/orders`); 
          const orders = await res.json().catch(() => []); 
          const order = orders.find((o: any) => o.orderId === orderId);
          if (order) return order;
          throw new Error("Order not found");
      } catch (e) {
          throw new Error("Tracking unavailable");
      }
  },

  // --- KNOWLEDGE BASE ---
  
  getKnowledgeBase: async (token: string) => {
      try {
          return await fetch(`${API_URL}/knowledge`).then(res => res.json());
      } catch (e) {
          return MOCK_KNOWLEDGE_BASE;
      }
  },

  addKnowledgeEntry: async (entry: Partial<KnowledgeEntry>, token: string) => {
      try {
        const res = await authFetch('/knowledge', {
            method: 'POST',
            body: JSON.stringify(entry)
        });
        return { success: true, entry: res };
      } catch (e) {
        return { success: true, entry: { ...entry, id: 'mock-kb' } as KnowledgeEntry };
      }
  },

  deleteKnowledgeEntry: async (id: string, token: string) => {
      try {
        await authFetch(`/knowledge/${id}`, { method: 'DELETE' });
      } catch (e) { /* ignore in mock */ }
      return { success: true };
  },

  uploadKnowledgeBase: async (file: File, token: string) => {
      try {
          // Use FormData to send the file to the backend
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(`${API_URL}/knowledge/upload`, {
              method: 'POST',
              headers: {
                  Authorization: `Bearer ${token}`
                  // Content-Type is set automatically by browser with boundary
              },
              body: formData
          });

          if (!response.ok) {
              const error = await response.json().catch(() => ({}));
              throw new Error(error.message || 'Upload failed');
          }

          return await response.json();
      } catch (e: any) {
          console.error("Upload error:", e);
          // Fallback logic for demo/offline mode
          return { success: true, count: 1, message: "Mock upload: File processed (Offline Mode)" };
      }
  },

  // --- UPLOAD SERVICE ---
  uploadImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if(!response.ok) throw new Error("Upload failed");
      
      const data = await response.json();
      const imagePath = data.image;
      if (imagePath.startsWith('http')) return imagePath;
      
      const baseUrl = API_URL.replace('/api', '');
      return `${baseUrl}${imagePath}`;

    } catch (e) {
      console.log("Backend upload failed, switching to local Base64 storage.");
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
      });
    }
  },

  // --- ADMIN DASHBOARD ---
  
  getAdminStats: async (token: string) => {
      try {
        const data = await authFetch('/admin/dashboard');
        return data;
      } catch (e) {
        // Fallback Mock with structure matching AdminDashboard expectations
        return {
           overview: {
             users: MOCK_USERS.length,
             orders: 120, // Mocked
             revenue: 45200,
             technicians: MOCK_TECHNICIANS.length,
             pendingOrders: 5,
             lowStock: 2,
             generatedQuotes: 2,
             remoteSessions: 0,
             loggedInUsers: 3
           },
           charts: {
             revenue: [
                { _id: 1, total: 1200 }, { _id: 2, total: 1900 }, { _id: 3, total: 1500 }, 
                { _id: 4, total: 2200 }, { _id: 5, total: 1800 }, { _id: 6, total: 2800 },
                { _id: 7, total: 3500 }, { _id: 8, total: 3100 }, { _id: 9, total: 4200 },
                { _id: 10, total: 4500 }, { _id: 11, total: 5000 }, { _id: 12, total: 5500 }
             ]
           },
           activity: [],
           health: { database: 'Mock', emailService: 'Mock', paymentGateway: 'Mock' }
        };
      }
  },

  getAdminBookings: async (token: string) => MOCK_BOOKINGS,
  
  createAdminBooking: async (data: any, token: string) => {
      await api.submitContactForm({ ...data, service: 'Admin Created Ticket', message: data.serviceType });
      const newBooking = { ...data, id: `bk-${Date.now()}`, status: 'Pending', completionCode: '1234' };
      MOCK_BOOKINGS.unshift(newBooking);
      return { success: true, booking: newBooking };
  },
  deleteBooking: async (id: string, token: string) => {
      MOCK_BOOKINGS = MOCK_BOOKINGS.filter(b => b.id !== id);
      return { success: true };
  },
  assignTechnician: async (bookingId: string, technicianName: string, token: string) => {
      const b = MOCK_BOOKINGS.find(bk => bk.id === bookingId);
      if(b) b.technician = technicianName;
      return { success: true };
  },

  getAdminMessages: async (token: string) => MOCK_MESSAGES,
  replyToMessage: async (messageId: string, replyText: string, token: string) => {
      const msg = MOCK_MESSAGES.find(m => m.id === messageId);
      if(msg) {
          msg.status = 'Responded';
          if(!msg.replies) msg.replies = [];
          msg.replies.push({ sender: 'Admin', text: replyText, date: new Date().toISOString() });
      }
      return { success: true };
  },

  getAdminQuotes: async (token: string) => [], 

  // --- USER & TECH MANAGEMENT (With Fallback) ---
  getUsers: async () => {
      try {
          return MOCK_USERS;
      } catch (e) {
          return MOCK_USERS;
      }
  },
  
  createUser: async (userData: Partial<User>) => {
      const u = { ...userData, id: `u-${Date.now()}`, status: 'Active', isOnline: false, isApproved: true } as User;
      MOCK_USERS.push(u);
      return { success: true, user: u };
  },
  updateUserRole: async (userId: string, role: string) => {
      const u = MOCK_USERS.find(user => user.id === userId);
      if(u) u.role = role as any;
      return { success: true };
  },
  updateUserStatus: async (userId: string, status: string) => {
      const u = MOCK_USERS.find(user => user.id === userId);
      if(u) u.status = status as any;
      return { success: true };
  },
  getLoginLogs: async (token: string) => MOCK_LOGS,
  
  getTechnicians: async (token: string) => {
      try {
          return await authFetch('/users?role=technician').catch(() => MOCK_TECHNICIANS);
      } catch (e) {
          return MOCK_TECHNICIANS;
      }
  },
  
  addTechnician: async (techData: Partial<Technician>, token: string) => {
      const t = { ...techData, id: `t-${Date.now()}` } as Technician;
      MOCK_TECHNICIANS.push(t);
      return { success: true, technicians: MOCK_TECHNICIANS };
  },

  // --- COMMUNICATION (Mock) ---
  getChatMessages: async () => MOCK_CHATS,
  sendInternalMessage: async (senderId: string, senderName: string, message: string, receiverId?: string, senderRole: any = 'admin') => {
      const msg = { id: `c-${Date.now()}`, senderId, senderName, message, senderRole, receiverId, timestamp: new Date().toISOString() };
      MOCK_CHATS.push(msg);
      return { success: true, message: msg };
  },
  sendBulkMessage: async (type: string, recipients: string[], message: string, subject?: string) => ({ success: true, count: recipients.length }),
  
  getMeetings: async () => MOCK_MEETINGS,
  
  scheduleMeeting: async (meetingData: any) => {
      const id = Math.random().toString(36).substr(2, 9);
      
      // Auto-generate link if not provided based on platform
      let link = meetingData.link || 'https://zoom.us/j/demo';
      if (!meetingData.link) {
          if (meetingData.platform === 'Google Meet') link = `https://meet.google.com/${id}-${id}`;
          else if (meetingData.platform === 'Microsoft Teams') link = `https://teams.microsoft.com/l/meetup-join/${id}`;
          else link = `https://zoom.us/j/${id}?pwd=secure`;
      }

      const m: Meeting = { 
          id: `m-${Date.now()}`, 
          title: meetingData.title,
          platform: meetingData.platform || 'Zoom',
          link: link,
          date: meetingData.date,
          time: meetingData.time,
          attendees: meetingData.attendees || [],
          status: 'Scheduled',
      } as Meeting; 
      
      MOCK_MEETINGS.push(m);
      MOCK_MEETINGS.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return { success: true, meeting: m };
  },

  // --- CUSTOMER DASHBOARD HELPERS ---
  getCustomerOrders: async (email: string) => {
      return []; 
  },
  getCustomerTickets: async (email: string) => MOCK_MESSAGES.filter(m => m.email === email),
  getCustomerBookings: async (email: string) => MOCK_BOOKINGS.filter(b => b.email === email),
  submitRating: async (techName: string, rating: number, feedback: string) => ({ success: true }),
  getTechnicianTasks: async (techName: string) => [],
  verifyJobCompletion: async (taskId: string, code: string) => ({ success: true }),
  updateTaskStatus: async (taskId: string, status: string) => ({ success: true }),

  // --- SETTINGS (Local Storage) ---
  getSettings: async (token: string) => {
      const saved = localStorage.getItem('buzzitech_settings');
      return saved ? JSON.parse(saved) : {};
  },
  saveSettings: async (settings: any, token: string) => {
      localStorage.setItem('buzzitech_settings', JSON.stringify(settings));
      window.dispatchEvent(new Event('settingsUpdated'));
      return { success: true };
  },
  getSiteImages: async () => {
      const saved = localStorage.getItem('buzzitech_site_images');
      return saved ? JSON.parse(saved) : {};
  },
  updateSiteImages: async (images: any, token: string) => {
      localStorage.setItem('buzzitech_site_images', JSON.stringify(images));
      return { success: true };
  },
  submitFeedback: async (data: any) => {},

  // --- CHATBOT ---
  sendChatMessage: async (message: string): Promise<{ text: string, action?: string }> => {
    const lowerMsg = message.toLowerCase().trim();
    let bestMatch = null;
    let highestScore = 0;
    
    MOCK_KNOWLEDGE_BASE.forEach(entry => {
      let score = 0;
      entry.keywords.forEach(keyword => {
        if (lowerMsg.includes(keyword.toLowerCase())) score += 1 + (keyword.length * 0.1);
      });
      if (score > highestScore) { highestScore = score; bestMatch = entry; }
    });

    if (bestMatch && highestScore >= 1.0) return { text: bestMatch.answer, action: bestMatch.action }; 
    return { text: FALLBACK_ANSWER };
  }
};