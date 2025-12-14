import { ContactFormData, AppointmentFormData, QuoteFormData, Order, Product, Technician, ChatMessage, Meeting, User, KnowledgeEntry, LoginLog } from '../types';
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

// --- DYNAMIC KNOWLEDGE BASE (In-Memory Mock for Demo) ---
let MOCK_KNOWLEDGE_BASE: KnowledgeEntry[] = [...KNOWLEDGE_BASE];

// Helper to send to Formspree or Webhook
const sendToExternal = async (data: any, formType: string) => {
  const settings = getStoredSettings();
  // Prefer n8n webhook if configured for forms, else Formspree
  const url = settings.n8nWebhook || settings.formspreeUrl || DEFAULT_FORMSPREE_URL;
  
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
        console.warn(`Submission failed: ${response.statusText}`);
    }
  } catch (error) {
    console.warn("Connection error:", error);
  }
};

// Helper: Simulate SMS/Email Notification
const notifyUser = async (recipient: string, type: 'email' | 'sms', message: string) => {
    console.log(`[Notification System] Sending ${type.toUpperCase()} to ${recipient}: ${message}`);
    // In a real app, this would call an SMS gateway (Twilio/Hubtel) or SMTP service
};

// Mock Data Stores for Demo
let MOCK_TECHNICIANS: Technician[] = [
  { 
    id: 't1', name: "Kwame Osei", email: 'kwame@buzzitech.com', phone: '0501112233', role: "Network Engineer", department: "Infrastructure", rating: 4.8, feedback: "Very professional cabling work.", status: 'Active',
    reviews: [{ customer: 'John Doe', rating: 5, comment: 'Excellent work!', date: '2023-11-20' }],
    jobsCompleted: 145
  },
  { id: 't2', name: "John Mensah", email: 'john@buzzitech.com', phone: '0244556677', role: "CCTV Specialist", department: "Security", rating: 4.5, feedback: "Clean installation, polite.", status: 'Busy', reviews: [], jobsCompleted: 89 },
  { id: 't3', name: "Sarah Addo", email: 'sarah@buzzitech.com', phone: '0277889900', role: "Software Support", department: "IT Support", rating: 5.0, feedback: "Solved the POS issue quickly.", status: 'Active', reviews: [], jobsCompleted: 112 },
  { id: 't4', name: "Emmanuel K.", email: 'emmanuel@buzzitech.com', phone: '0555666777', role: "Field Technician", department: "Field Ops", rating: 4.2, feedback: "Good work but arrived slightly late.", status: 'Active', reviews: [], jobsCompleted: 67 }
];

let MOCK_ORDERS = [
  {
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

let MOCK_QUOTES: QuoteFormData[] = [
    {
      name: 'TechHub Ghana',
      email: 'procurement@techhub.com',
      phone: '0302999999',
      serviceType: 'CCTV Security',
      grandTotal: 15400,
      description: '16 Channel Installation with 4K Cameras',
      timeline: 'Urgent',
      items: [],
      date: new Date().toISOString()
    }
];

// Mock Bookings Data with Completion Codes
let MOCK_BOOKINGS = [
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
     completionCode: '8842',
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
     technician: 'Kwame Osei',
     taskStatus: 'Pending',
     completionCode: '9021',
     rating: null
  },
  {
     id: 'bk-3',
     name: 'Robert Ansah',
     email: 'robert@yahoo.com',
     phone: '0204938271',
     serviceType: 'Network Cabling',
     date: '2023-11-25',
     time: '09:00',
     status: 'In Progress',
     technician: 'Kwame Osei',
     taskStatus: 'In Progress',
     completionCode: '3356',
     rating: null
  }
];

// Mock Messages
let MOCK_MESSAGES = [
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

// Mock Communications Data
let MOCK_USERS: User[] = [
    { id: 'u1', name: 'Buzzitech Admin', email: 'admin@buzzitech.com', role: 'admin', status: 'Active', isOnline: true, lastLogin: new Date().toISOString(), ipAddress: '192.168.1.1', location: 'Accra, GH' },
    { id: 'u2', name: 'Kwame Osei', email: 'kwame@buzzitech.com', role: 'technician', status: 'Active', isOnline: false, lastLogin: new Date(Date.now() - 3600000).toISOString(), ipAddress: '197.234.12.3', location: 'Kumasi, GH' },
    { id: 'u3', name: 'John Doe', email: 'john@gmail.com', role: 'customer', status: 'Active', isOnline: true, lastLogin: new Date(Date.now() - 60000).toISOString(), ipAddress: '154.123.45.6', location: 'Tema, GH' }
];

// Mock Login Logs
let MOCK_LOGS: LoginLog[] = [
    { id: 'log-1', userId: 'u1', userName: 'Buzzitech Admin', email: 'admin@buzzitech.com', ip: '192.168.1.1', location: 'Accra, GH', device: 'Chrome / Windows', timestamp: new Date().toISOString(), status: 'Success', riskScore: 'Low' },
    { id: 'log-2', userId: 'u3', userName: 'John Doe', email: 'john@gmail.com', ip: '154.123.45.6', location: 'Tema, GH', device: 'Safari / iPhone', timestamp: new Date(Date.now() - 60000).toISOString(), status: 'Success', riskScore: 'Low' },
    { id: 'log-3', userId: 'u2', userName: 'Kwame Osei', email: 'kwame@buzzitech.com', ip: '41.203.11.2', location: 'Lagos, NG', device: 'Firefox / Linux', timestamp: new Date(Date.now() - 12000000).toISOString(), status: 'Failed', riskScore: 'High' },
];

let MOCK_CHATS: ChatMessage[] = [
    { id: 'c1', senderId: 'u3', senderName: 'John Doe', senderRole: 'customer', receiverId: 'admin', message: 'Hello, when is my tech arriving?', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'c2', senderId: 'u1', senderName: 'Admin', senderRole: 'admin', receiverId: 'u3', message: 'Hi John, Kwame is on his way. He should be there in 20 mins.', timestamp: new Date(Date.now() - 3500000).toISOString() }
];

let MOCK_MEETINGS: Meeting[] = [
    { id: 'm1', title: 'Starlink Consultation', platform: 'Zoom', link: 'https://zoom.us/j/123456789', date: '2023-12-01', time: '10:00', attendees: ['john@gmail.com'], status: 'Scheduled' },
    { id: 'm2', title: 'Project Review', platform: 'Teams', link: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_MjA...', date: '2023-12-02', time: '14:30', attendees: ['kwame@buzzitech.com'], status: 'Scheduled' }
];

export const api = {
  // --- PUBLIC FORMS ---
  submitContactForm: async (data: ContactFormData): Promise<{ success: boolean; message: string; ticketId?: string }> => {
    // If there's an attachment, simulated upload would happen here
    const hasAttachment = data.attachment ? true : false;
    const attachmentName = data.attachment ? data.attachment.name : '';

    await sendToExternal({ ...data, attachment: attachmentName }, 'Contact Inquiry');
    const ticketId = data.service === 'Technical Support' ? `TKT-${Math.floor(100000 + Math.random() * 900000)}` : undefined;
    
    // Add to mock messages
    MOCK_MESSAGES.unshift({
        id: `msg-${Date.now()}`,
        ticketId: ticketId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: data.service,
        message: data.message + (hasAttachment ? `\n[Attachment: ${attachmentName}]` : ''),
        date: new Date().toISOString(),
        status: 'Open',
        replies: []
    });

    return { success: true, message: "Message Sent Successfully", ticketId };
  },

  submitLead: async (contact: string): Promise<{ success: boolean }> => {
    const settings = getStoredSettings();
    // Use specific callback webhook if configured, else fallback
    const url = settings.n8nCallbackWebhook || settings.n8nWebhook || DEFAULT_FORMSPREE_URL;
    
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contact, type: 'Quick Lead', timestamp: new Date().toISOString() })
        });
    } catch (e) {
        console.warn("Callback webhook error", e);
    }
    return { success: true };
  },

  bookAppointment: async (data: AppointmentFormData): Promise<{ success: boolean; message: string }> => {
    await sendToExternal(data, 'Appointment Booking');
    // Add to mock bookings for demo purposes
    MOCK_BOOKINGS.unshift({
        id: `bk-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        serviceType: data.serviceType,
        date: data.date,
        time: data.time,
        status: 'Pending',
        technician: null,
        taskStatus: 'Unassigned',
        completionCode: Math.floor(1000 + Math.random() * 9000).toString(),
        rating: null,
        workDone: undefined,
        customerFeedback: undefined
    });
    return { success: true, message: "Booking Request Sent" };
  },

  // --- AUTHENTICATION ---
  
  login: async (email: string, password: string) => {
    if (email === 'admin@buzzitech.com' && password === 'password123') {
      // Log the login
      MOCK_LOGS.unshift({
          id: `log-${Date.now()}`, userId: 'u1', userName: 'Admin', email, ip: '127.0.0.1', location: 'Localhost', device: 'Web', timestamp: new Date().toISOString(), status: 'Success', riskScore: 'Low'
      });
      return { success: true, token: 'mock-admin-token', name: 'Buzzitech Admin', email };
    }
    throw new Error('Invalid credentials');
  },

  register: async (data: any) => {
      const newUser: User = { 
          id: `u-${Date.now()}`,
          name: data.name,
          email: data.email,
          role: 'customer',
          status: 'Active',
          phone: data.phone,
          password: data.password, // In real app, hash this
          isOnline: true,
          lastLogin: new Date().toISOString()
      };
      MOCK_USERS.push(newUser);
      
      return { 
          success: true, 
          user: newUser,
          token: 'mock-cust-token'
      };
  },

  customerLogin: async (email: string, phone: string) => {
    const existingUser = MOCK_USERS.find(u => u.email === email && u.role === 'customer');
    if (existingUser) {
        existingUser.isOnline = true;
        existingUser.lastLogin = new Date().toISOString();
        return { success: true, user: existingUser, token: 'mock-cust-token' };
    }
    // Fallback logic for legacy/demo
    const orderUser = MOCK_ORDERS.find(o => o.customer.email === email);
    if (orderUser || (email && phone)) {
       const newUser: User = { 
           id: 'cust-' + Date.now(),
           name: orderUser ? orderUser.customer.name : 'Valued Customer',
           email: email,
           role: 'customer',
           status: 'Active',
           isOnline: true,
           lastLogin: new Date().toISOString()
       };
       MOCK_USERS.push(newUser);
       return { success: true, user: newUser, token: 'mock-cust-token' };
    }
    return { success: true, user: { id: 'cust-new', name: 'New User', email, role: 'customer', status: 'Active' }, token: 'mock-cust-token' };
  },

  technicianLogin: async (email: string, password: string) => {
    const tech = MOCK_TECHNICIANS.find(t => t.email === email);
    if (tech && password === 'tech123') {
       return { success: true, user: { ...tech, role: 'technician' }, token: 'mock-tech-token' };
    }
    throw new Error('Invalid Technician Credentials');
  },

  // Password Reset Mocks
  requestPasswordReset: async (email: string) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In production, check if email exists and send token
      return { success: true, message: "Verification code sent to email." };
  },

  resetPassword: async (email: string, newPassword: string) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Update local mock user if exists
      const user = MOCK_USERS.find(u => u.email === email);
      if (user) {
          // In real app, perform hash and update DB
          console.log(`Password updated for ${email}`);
      }
      return { success: true, message: "Password updated successfully." };
  },

  // --- USER MANAGEMENT & LOGS ---
  getUsers: async () => MOCK_USERS,
  
  createUser: async (userData: Partial<User>) => {
      const newUser = { 
          ...userData, 
          id: `u-${Date.now()}`, 
          status: 'Active',
          isOnline: false,
          lastLogin: 'Never'
      } as User;
      MOCK_USERS.push(newUser);
      return { success: true, user: newUser };
  },

  updateUserRole: async (userId: string, role: string) => {
      MOCK_USERS = MOCK_USERS.map(u => u.id === userId ? { ...u, role: role as any } : u);
      return { success: true };
  },

  getLoginLogs: async (token: string) => MOCK_LOGS,

  // --- COMMUNICATION & CHAT ---
  
  getChatMessages: async () => MOCK_CHATS,
  
  sendInternalMessage: async (senderId: string, senderName: string, message: string, receiverId?: string, senderRole: any = 'admin') => {
      const newMsg: ChatMessage = {
          id: `c-${Date.now()}`,
          senderId,
          senderName,
          senderRole,
          receiverId,
          message,
          timestamp: new Date().toISOString()
      };
      MOCK_CHATS.push(newMsg);
      return { success: true, message: newMsg };
  },

  sendBulkMessage: async (type: 'email' | 'sms', recipients: string[], message: string, subject?: string) => {
      // Mock sending
      console.log(`Sending ${type} to ${recipients.length} recipients. Content: ${message}`);
      return { success: true, count: recipients.length };
  },

  getMeetings: async () => MOCK_MEETINGS,

  scheduleMeeting: async (meetingData: Partial<Meeting>) => {
      const link = meetingData.platform === 'Zoom' 
        ? `https://zoom.us/j/${Math.floor(100000000 + Math.random() * 900000000)}?pwd=samplepassword` 
        : `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${Math.random().toString(36).substring(7)}%40thread.v2/0?context=%7b%22Tid%22%3a%22example%22%7d`;
      
      const newMeeting: Meeting = {
          id: `m-${Date.now()}`,
          title: meetingData.title || 'Support Meeting',
          platform: meetingData.platform || 'Zoom',
          link: link,
          date: meetingData.date || new Date().toISOString().split('T')[0],
          time: meetingData.time || '10:00',
          attendees: meetingData.attendees || [],
          status: 'Scheduled'
      };
      MOCK_MEETINGS.push(newMeeting);
      return { success: true, meeting: newMeeting };
  },

  // --- KNOWLEDGE BASE MANAGEMENT ---
  
  getKnowledgeBase: async (token: string) => MOCK_KNOWLEDGE_BASE,

  addKnowledgeEntry: async (entry: Partial<KnowledgeEntry>, token: string) => {
      const newEntry: KnowledgeEntry = {
          id: `kb-${Date.now()}`,
          category: entry.category || 'general',
          keywords: entry.keywords || [],
          answer: entry.answer || '',
          action: entry.action
      };
      MOCK_KNOWLEDGE_BASE.push(newEntry);
      return { success: true, entry: newEntry };
  },

  updateKnowledgeEntry: async (id: string, entry: Partial<KnowledgeEntry>, token: string) => {
      MOCK_KNOWLEDGE_BASE = MOCK_KNOWLEDGE_BASE.map(e => e.id === id ? { ...e, ...entry } : e);
      return { success: true };
  },

  deleteKnowledgeEntry: async (id: string, token: string) => {
      MOCK_KNOWLEDGE_BASE = MOCK_KNOWLEDGE_BASE.filter(e => e.id !== id);
      return { success: true };
  },

  uploadKnowledgeBase: async (file: File, token: string) => {
      return new Promise<{ success: boolean; count: number }>((resolve, reject) => {
          const extension = file.name.split('.').pop()?.toLowerCase();
          
          if (extension === 'json') {
              const reader = new FileReader();
              reader.onload = (e) => {
                  try {
                      const content = e.target?.result as string;
                      const data = JSON.parse(content);
                      if (Array.isArray(data)) {
                          const newEntries: KnowledgeEntry[] = data.map((item: any, idx: number) => ({
                              id: item.id || `kb-imp-${Date.now()}-${idx}`,
                              category: item.category || 'general',
                              keywords: Array.isArray(item.keywords) ? item.keywords : [],
                              answer: item.answer || '',
                              action: item.action
                          }));
                          MOCK_KNOWLEDGE_BASE = [...MOCK_KNOWLEDGE_BASE, ...newEntries];
                          resolve({ success: true, count: newEntries.length });
                      } else {
                          reject(new Error("Invalid JSON format. Expected an array."));
                      }
                  } catch (err) {
                      reject(new Error("Failed to parse JSON file."));
                  }
              };
              reader.readAsText(file);
          } else if (extension === 'pdf' || extension === 'docx') {
              // Simulate parsing for non-JSON files (Mocking OCR/Text Extraction)
              setTimeout(() => {
                  const simulatedEntry: KnowledgeEntry = {
                      id: `kb-doc-${Date.now()}`,
                      category: 'document-upload',
                      keywords: [file.name.replace(/\.[^/.]+$/, "")], // Use filename as keyword
                      answer: `Content extracted from ${file.name}: [Simulated Extraction]`,
                  };
                  MOCK_KNOWLEDGE_BASE.push(simulatedEntry);
                  resolve({ success: true, count: 1 });
              }, 1000);
          } else {
              reject(new Error("Unsupported file type."));
          }
      });
  },

  // --- DASHBOARD DATA ---

  getCustomerOrders: async (email: string) => {
     return MOCK_ORDERS.filter(o => o.customer.email === email);
  },

  getCustomerTickets: async (email: string) => {
     return MOCK_MESSAGES.filter(m => m.email === email);
  },

  getCustomerBookings: async (email: string) => {
     return MOCK_BOOKINGS.filter(b => b.email === email);
  },

  submitRating: async (technicianName: string, rating: number, feedback: string) => {
     const tech = MOCK_TECHNICIANS.find(t => t.name === technicianName);
     if (tech) {
        tech.rating = ((tech.rating * 5) + rating) / 6; 
        tech.feedback = feedback;
        tech.reviews?.push({ customer: 'Current User', rating, comment: feedback, date: new Date().toISOString().split('T')[0] });
     }
     return { success: true };
  },

  getTechnicianTasks: async (techName: string) => {
     const techBookings = MOCK_BOOKINGS.filter(b => b.technician === techName).map(b => ({
         id: b.id,
         type: b.serviceType,
         client: b.name,
         address: 'See Details', 
         date: b.date,
         time: b.time,
         status: b.taskStatus || b.status
     }));
     
     if (techBookings.length === 0) {
         // Return empty if no real bookings to avoid confusion
         return [];
     }
     return techBookings;
  },

  // NEW: Verify Code and Update Status
  verifyJobCompletion: async (taskId: string, code: string) => {
      const task = MOCK_BOOKINGS.find(b => b.id === taskId);
      
      if (!task) throw new Error("Task not found");
      
      if (task.completionCode !== code) {
          throw new Error("Invalid Code");
      }

      // Update status
      task.taskStatus = 'Completed';
      task.status = 'Completed';

      // Send completion email mock
      await sendToExternal({
          recipient: task.email,
          subject: `Job Completed: ${task.serviceType}`,
          message: `Your service for ${task.serviceType} has been marked as complete by ${task.technician}. Thank you for choosing Buzzitech.`
      }, 'Job Completion Notification');

      // Also notify technician (simulated)
      console.log(`Completion email sent to technician for task ${taskId}`);

      return { success: true };
  },

  updateTaskStatus: async (taskId: string, status: string) => {
      MOCK_BOOKINGS = MOCK_BOOKINGS.map(b => b.id === taskId ? { ...b, taskStatus: status, status: status === 'Completed' ? 'Completed' : b.status } : b);
      return { success: true };
  },

  // --- ADMIN DATA ---
  
  getAdminStats: async (token: string) => {
       return {
         totalVisits: 12450,
         monthlyVisits: 3200,
         totalRevenue: 45200,
         activeOrders: MOCK_ORDERS.length,
         pendingQuotes: MOCK_QUOTES.length,
         openTickets: MOCK_MESSAGES.filter(m => m.status === 'Open').length,
         activeCustomers: MOCK_USERS.filter(u => u.isOnline).length,
         remoteSessions: 2
       };
  },

  getAdminOrders: async (token: string) => MOCK_ORDERS,

  updateOrderStatus: async (orderId: string, status: string, token: string) => {
      MOCK_ORDERS = MOCK_ORDERS.map(o => o.orderId === orderId ? { ...o, status } : o);
      return { success: true, message: "Status updated locally" };
  },

  trackOrder: async (orderId: string) => {
      const order = MOCK_ORDERS.find(o => o.orderId.toLowerCase() === orderId.toLowerCase());
      if (order) return order;
      throw new Error("Order not found");
  },

  getTechnicians: async (token: string) => MOCK_TECHNICIANS,

  addTechnician: async (techData: Partial<Technician>, token: string) => {
    const newTech: Technician = {
        id: `t-${Date.now()}`,
        name: techData.name || 'New Tech',
        role: techData.role || 'General Staff',
        department: techData.department || 'General',
        email: techData.email || '',
        phone: techData.phone || '',
        rating: techData.rating || 5,
        feedback: techData.feedback || 'No records yet.',
        status: 'Active',
        reviews: [],
        jobsCompleted: 0
    };
    MOCK_TECHNICIANS.push(newTech);
    return { success: true, technicians: MOCK_TECHNICIANS };
  },

  getAdminBookings: async (token: string) => {
      return MOCK_BOOKINGS;
  },

  deleteBooking: async (id: string, token: string) => {
      MOCK_BOOKINGS = MOCK_BOOKINGS.filter(b => b.id !== id);
      return { success: true };
  },

  createAdminBooking: async (data: any, token: string) => {
      // Generate OTP Code
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      
      const newBooking = {
          id: `bk-man-${Date.now()}`,
          name: data.name,
          email: data.email || 'N/A',
          phone: data.phone,
          serviceType: data.serviceType, // Job Description
          date: data.date,
          time: data.time,
          status: 'Pending',
          technician: data.technician || null,
          taskStatus: 'Assigned',
          completionCode: code,
          rating: null,
          workDone: undefined,
          customerFeedback: undefined
      };
      
      MOCK_BOOKINGS.unshift(newBooking);

      // --- SIMULATED NOTIFICATIONS ---
      
      // 1. Notify Customer (SMS & Email)
      const customerMsg = `New Service Ticket: ${data.serviceType}. Tech: ${data.technician || 'Pending'}. Completion Code: ${code} (Give this to tech after job).`;
      await notifyUser(data.email, 'email', customerMsg);
      await notifyUser(data.phone, 'sms', customerMsg);

      // 2. Notify Technician (if assigned)
      if (data.technician) {
          const tech = MOCK_TECHNICIANS.find(t => t.name === data.technician);
          if (tech && tech.email) {
              const techMsg = `New Job Assigned: ${data.serviceType} for ${data.name}. Location: See details.`;
              await notifyUser(tech.email, 'email', techMsg);
              // Assume tech has phone
              await notifyUser(tech.phone || '050XXXXXXX', 'sms', techMsg);
          }
      }

      return { success: true, booking: newBooking };
  },

  assignTechnician: async (bookingId: string, technicianName: string, token: string) => {
      const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
      if (booking) {
          booking.technician = technicianName;
          booking.taskStatus = 'Assigned';
          booking.status = 'In Progress';

          // Notify Technician
          const tech = MOCK_TECHNICIANS.find(t => t.name === technicianName);
          if (tech && tech.email) {
              const msg = `Job Assignment: ${booking.serviceType} for ${booking.name}.`;
              await notifyUser(tech.email, 'email', msg);
          }
      }
      return { success: true };
  },

  getAdminMessages: async (token: string) => {
      return MOCK_MESSAGES;
  },

  replyToMessage: async (messageId: string, replyText: string, token: string) => {
      MOCK_MESSAGES = MOCK_MESSAGES.map(m => 
          m.id === messageId 
          ? { ...m, status: 'Responded', replies: [...m.replies, { sender: 'Admin', text: replyText, date: new Date().toISOString() }] }
          : m
      );
      return { success: true };
  },

  getAdminQuotes: async (token: string) => {
      return MOCK_QUOTES;
  },

  getAdminProducts: async (token: string) => PRODUCTS,

  getProducts: async () => PRODUCTS,

  updateProductDetails: async (product: Product, token: string) => {
      // In real app, update DB. Here, we update local memory if using MOCK, but PRODUCTS is imported constant.
      // We will pretend for UI interaction.
      console.log("Updating product:", product);
      return { success: true };
  },

  addProduct: async (product: Product, token: string) => {
      console.log("Creating new product:", product);
      return { success: true, product };
  },

  // --- UPLOAD SERVICE ---
  uploadImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Try backend first
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if(!response.ok) throw new Error("Upload failed");
      
      const data = await response.json();
      return data.image.startsWith('http') ? data.image : `${(import.meta as any).env?.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${data.image}`;
    } catch (e) {
      console.log("Backend not available, switching to local Base64 storage (Demo Mode).");
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
      });
    }
  },

  // 9. SITE SETTINGS & CONFIGURATION
  getSiteImages: async () => {
      const saved = localStorage.getItem('buzzitech_site_images');
      return saved ? JSON.parse(saved) : {
         hero_bg: "https://images.unsplash.com/photo-1551703606-2ad43d5b24c0",
         about_img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837",
         cctv_banner: "https://images.unsplash.com/photo-1599256872237-5dcc0fbe9668",
         tracking_hero: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80",
         slide_1: "https://images.unsplash.com/photo-1551703606-2ad43d5b24c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
         slide_2: "https://images.unsplash.com/photo-1599256872237-5dcc0fbe9668?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
         slide_3: "https://images.unsplash.com/photo-1544652478-6653e09f1826?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
         slide_4: "https://images.unsplash.com/photo-1621905251189-08b95d6c2a81?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
         slide_5: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2060&q=80"
      };
  },

  updateSiteImages: async (images: any, token: string) => {
      console.log("Updating site images:", images);
      localStorage.setItem('buzzitech_site_images', JSON.stringify(images));
      return { success: true };
  },

  saveSettings: async (settings: any, token: string) => {
      localStorage.setItem('buzzitech_settings', JSON.stringify(settings));
      // Dispatch event to notify all listeners (like the Logo component) that settings have changed
      window.dispatchEvent(new Event('settingsUpdated'));
      return { success: true };
  },

  getSettings: async (token: string) => {
      return getStoredSettings();
  },

  // --- E-COMMERCE PAYMENT PROCESSING ---
  processPayment: async (order: Order): Promise<{ success: boolean; transactionId: string }> => {
    // Update mock orders for demo
    MOCK_ORDERS.unshift({
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

  requestQuotation: async (data: QuoteFormData): Promise<{ success: boolean; message: string; data?: any }> => {
    const settings = getStoredSettings();
    // Use specific quote webhook if configured, else generic form webhook, else default constant
    const url = settings.n8nQuoteWebhook || settings.n8nWebhook || N8N_QUOTE_WEBHOOK;
    
    // Attempt real fetch to the configured webhook
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) console.warn("Webhook submission failed:", res.statusText);
    } catch(e) {
        console.warn("Webhook network error", e);
    }

    // SYNC TO ADMIN PORTAL (MOCK)
    MOCK_QUOTES.unshift({
        ...data,
        date: new Date().toISOString()
    });

    return { success: true, message: "Quote request processed." }; 
  },

  submitFeedback: async (feedbackData: { name: string, email: string, message: string }): Promise<void> => {
    await sendToExternal(feedbackData, 'Customer Feedback');
  },

  sendChatMessage: async (message: string): Promise<{ text: string, action?: string }> => {
    // Chatbot logic (mock)
    const lowerMsg = message.toLowerCase().trim();
    if (lowerMsg.includes('call me')) return { text: "I can have our AI Voice Assistant call you immediately. Please enter your phone number.", action: 'request_phone' };
    
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