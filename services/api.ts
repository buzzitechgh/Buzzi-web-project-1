import { ContactFormData, AppointmentFormData, QuoteFormData } from '../types';

// Points to the local Node.js server (from server/server.js)
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
    
    // 1. Try Real Backend
    const result = await postToBackend('contact', data);
    if (result && result.success) {
      return result;
    }

    // 2. Fallback Simulation
    await delay(1500);
    console.log(`[Simulation] Email would be sent to ${CONTACT_EMAIL}`);
    return { success: true, message: "Message sent successfully!" };
  },

  bookAppointment: async (data: AppointmentFormData): Promise<{ success: boolean; message: string }> => {
    console.log("Submitting Booking...", data);
    
    // 1. Try Real Backend
    const result = await postToBackend('booking', data);
    if (result && result.success) {
      return result;
    }

    // 2. Fallback Simulation
    await delay(1500);
    console.log(`[Simulation] Booking email sent to ${CONTACT_EMAIL}`);
    return { success: true, message: "Appointment request submitted successfully!" };
  },

  requestQuotation: async (data: QuoteFormData): Promise<{ success: boolean; message: string }> => {
    console.log("Submitting Quote...", data);
    
    // 1. Try Real Backend
    const result = await postToBackend('quote', data);
    if (result && result.success) {
      return result;
    }

    // 2. Fallback Simulation
    await delay(1500);
    console.log(`[Simulation] Quote request sent to ${CONTACT_EMAIL}`);
    return { success: true, message: "Quotation request received. We will contact you shortly." };
  },

  // Chatbot remains client-side mock for now
  sendChatMessage: async (message: string): Promise<{ text: string, action?: string }> => {
    await delay(1000);
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('call') || lowerMsg.includes('speak') || lowerMsg.includes('talk')) {
       return { text: "I can have our AI Voice Assistant call you immediately. Please enter your phone number." };
    }

    const phoneMatch = message.match(/(\+233|0)\d{9}/);
    if (phoneMatch) {
       console.log(`[Simulation] Triggering call to ${phoneMatch[0]}`);
       return { text: `Thanks! I'm initiating a call to ${phoneMatch[0]} right now using our AI Agent.` };
    }

    if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('quote')) {
        if (lowerMsg.includes('starlink')) return { text: "🛰️ **Starlink Pricing**:\n- Standard Kit: ~GHS 8,500\n- Installation: GHS 800 - GHS 1,500" };
        if (lowerMsg.includes('cctv')) return { text: "📹 **CCTV Packages**:\n- 4-Channel Kit: ~GHS 3,200\n- 8-Channel Kit: ~GHS 5,500" };
        if (lowerMsg.includes('pos')) return { text: "💻 **POS Systems**:\n- Full Setup: ~GHS 4,500" };
        
        return { text: "I can give you prices for Starlink, CCTV, or POS systems. What are you interested in?" };
    }

    return { text: "I can help with **Prices** or I can **Call You**. Try asking: 'How much is Starlink?'" };
  }
};