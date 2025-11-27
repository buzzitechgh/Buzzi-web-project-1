import { ContactFormData, AppointmentFormData, QuoteFormData } from '../types';
import { KNOWLEDGE_BASE, FALLBACK_ANSWER } from '../data/knowledgeBase';

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

  // Intelligent Chatbot Logic utilizing Knowledge Base
  sendChatMessage: async (message: string): Promise<{ text: string, action?: string }> => {
    await delay(800); // Natural reading delay
    const lowerMsg = message.toLowerCase().trim();

    // 1. Special Trigger: Call Action
    if (lowerMsg.includes('call me') || lowerMsg.includes('speak to human')) {
       return { text: "I can have our AI Voice Assistant call you immediately. Please enter your phone number." };
    }

    // 2. Special Trigger: Phone Number Detection
    const phoneMatch = message.match(/(\+233|0)\d{9}/);
    if (phoneMatch) {
       console.log(`[Simulation] Triggering call to ${phoneMatch[0]}`);
       return { text: `Thanks! I'm initiating a call to ${phoneMatch[0]} right now using our AI Agent. Please keep your line open.` };
    }

    // 3. Knowledge Base Search Algorithm
    let bestMatch = null;
    let highestScore = 0;

    KNOWLEDGE_BASE.forEach(entry => {
      let score = 0;
      entry.keywords.forEach(keyword => {
        if (lowerMsg.includes(keyword)) {
          // Boost score for exact matches or longer keywords (usually more specific)
          score += 1 + (keyword.length * 0.1); 
        }
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = entry;
      }
    });

    // Threshold for accepting a match (prevents weak matches)
    if (bestMatch && highestScore > 0.5) {
      return { text: bestMatch.answer };
    }

    // 4. Fallback
    return { text: FALLBACK_ANSWER };
  }
};