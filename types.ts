import { LucideIcon } from 'lucide-react';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  fullDescription?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  attachment?: File | null; // Added for image support
}

export interface AppointmentFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  serviceType: string;
}

export interface QuoteItem {
  id: string;
  category: string;
  name: string;
  description?: string; // New: Specific details for this line item
  price: number;
  quantity: number;
}

export interface QuoteFormData {
  name: string;
  email: string;
  phone: string;
  serviceType: string; // General Service Category
  items: QuoteItem[];
  description: string; // General Notes
  grandTotal: number;
  timeline: string;
  date?: string; // Added for sync
}

export interface Technician {
  id: string;
  name: string;
  email?: string; // Added for login
  role: string;
  department?: string; // Added for professional details
  rating: number;
  feedback: string;
  status: 'Active' | 'Busy' | 'Offline';
  // New: For tech dashboard
  assignedTasks?: any[];
  reviews?: { customer: string; rating: number; comment: string; date: string }[];
  jobsCompleted?: number; // Added for analytics
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
}

// --- E-COMMERCE TYPES ---

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // Added for discount display (strikethrough)
  brand?: string; // Added for detailed inventory
  category: string;
  image: string;
  description: string;
  features: string[];
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    region: string;
    gpsCoordinates?: string;
  };
  deliveryMode: 'delivery' | 'pickup';
  deliveryCost: number;
  paymentMethod: 'paystack' | 'momo' | 'cod';
  status: 'pending' | 'completed';
  date: Date;
  // Installation logic
  installationType: 'none' | 'standard' | 'estimate';
  installationCost: number;
}

// --- NEW COMMUNICATIONS TYPES ---

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'technician' | 'customer' | 'system'; // Explicit role
  receiverId?: string; // If private
  message: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  platform: 'Zoom' | 'Teams' | 'Google Meet';
  link: string;
  date: string;
  time: string;
  attendees: string[]; // Emails
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface RemoteSession {
  id: string;
  tool: 'AnyDesk' | 'TeamViewer';
  sessionId: string; // The ID to connect to
  clientName: string;
  status: 'Active' | 'Closed';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'customer';
  phone?: string;
  status: 'Active' | 'Suspended';
  password?: string; // Optional for creation type
  isOnline?: boolean;
  lastLogin?: string;
  ipAddress?: string;
  location?: string;
}

export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  email: string;
  ip: string;
  location: string;
  device: string;
  timestamp: string;
  status: 'Success' | 'Failed';
  riskScore: 'Low' | 'Medium' | 'High';
}

// --- CHATBOT KNOWLEDGE BASE ---
export interface KnowledgeEntry {
  id: string;
  category: string; // Flexible string for admin input
  keywords: string[];
  answer: string;
  action?: string; // Action trigger for UI components
}