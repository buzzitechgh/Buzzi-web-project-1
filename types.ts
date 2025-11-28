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
}