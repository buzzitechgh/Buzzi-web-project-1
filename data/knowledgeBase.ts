import { COMPANY_INFO } from "../constants";

export interface KnowledgeEntry {
  id: string;
  category: 'pricing' | 'service' | 'general' | 'support';
  keywords: string[];
  answer: string;
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // --- STARLINK ---
  {
    id: 'starlink-price',
    category: 'pricing',
    keywords: ['starlink', 'satellite', 'internet', 'dish', 'kit price', 'cost of starlink'],
    answer: "🛰️ **Starlink Services**\n\n**Standard Kit:** Approximately **GHS 6,000 - GHS 8,500** (Prices fluctuate with exchange rates/promos).\n**Installation Fee:** Starts at **GHS 800** (depends on roof type & location).\n\nWe handle professional mounting, cabling, and router configuration to ensure 100% signal uptime."
  },
  {
    id: 'starlink-install',
    category: 'service',
    keywords: ['mount', 'install starlink', 'setup starlink', 'roof'],
    answer: "We provide professional Starlink installation including:\n- Heavy-duty pole mounting\n- Cable routing & drilling\n- Router setup & speed optimization\n\nWould you like to book an installation appointment?"
  },

  // --- CCTV ---
  {
    id: 'cctv-price',
    category: 'pricing',
    keywords: ['cctv', 'camera', 'security', 'surveillance', 'monitoring', 'cameras cost'],
    answer: "📹 **CCTV Security Packages**\n\n**4-Channel Kit (HD):** ~GHS 3,200 (Supply + Install)\n**8-Channel Kit (HD):** ~GHS 5,500 (Supply + Install)\n**IP/Wireless Cameras:** Start at GHS 450 per unit.\n\nAll packages include remote mobile viewing setup so you can watch from your phone."
  },
  
  // --- NETWORKING ---
  {
    id: 'networking',
    category: 'service',
    keywords: ['network', 'cabling', 'server', 'rack', 'lan', 'wifi', 'internet office', 'slow internet'],
    answer: "🌐 **Network Engineering**\n\nWe specialize in:\n- Structured Office Cabling (Cat6/Cat7)\n- Server Rack Management\n- Long-range WiFi Access Points\n\nIf your office internet is slow or messy, we can restructure it for maximum speed."
  },

  // --- POS ---
  {
    id: 'pos',
    category: 'service',
    keywords: ['pos', 'point of sale', 'shop', 'retail', 'software', 'inventory', 'receipt'],
    answer: "💻 **POS Systems**\n\nWe offer complete setups for shops, pharmacies, and restaurants.\n**Full Set:** ~GHS 4,500 (Includes Touchscreen PC, Thermal Printer, Barcode Scanner, and Cash Drawer).\n\nIncludes training for your staff on how to use the sales software."
  },

  // --- CONTACT / LOCATION ---
  {
    id: 'location',
    category: 'general',
    keywords: ['location', 'where', 'address', 'office', 'located', 'find you'],
    answer: `📍 **Office Location**\n\nWe are located in **${COMPANY_INFO.address}**.\n\nWe are primarily a mobile service team—we come to your home or office to perform installations and repairs.`
  },
  {
    id: 'contact',
    category: 'general',
    keywords: ['phone', 'call', 'number', 'email', 'contact', 'reach', 'whatsapp'],
    answer: `📞 **Contact Us**\n\n**Phone:** ${COMPANY_INFO.phone}\n**WhatsApp:** ${COMPANY_INFO.whatsapp}\n**Email:** ${COMPANY_INFO.email}\n\nOur support team is available Mon-Sat, 8am - 6pm.`
  },

  // --- GENERAL ---
  {
    id: 'services',
    category: 'general',
    keywords: ['what do you do', 'services', 'help', 'capabilities', 'menu', 'offer'],
    answer: "🔧 **Our Expertise**\n\n1. **Starlink & Satellite** Internet\n2. **CCTV** Security Systems\n3. **Network Engineering** & WiFi\n4. **POS** Systems for Retail\n5. **Web Design** & Cloud Solutions\n\nAsk me about the price of any of these!"
  },
  {
    id: 'booking',
    category: 'support',
    keywords: ['book', 'appointment', 'schedule', 'come check', 'visit', 'survey'],
    answer: "📅 **Book a Service**\n\nYou can schedule a visit directly through our [Booking Page](/booking).\n\nOr, reply with your phone number, and I will have an engineer call you immediately."
  }
];

export const FALLBACK_ANSWER = "I'm not sure about that specific detail, but I can help with **Starlink**, **CCTV**, **Networking**, or **POS Systems**. \n\nYou can also call us directly at " + COMPANY_INFO.phone;
