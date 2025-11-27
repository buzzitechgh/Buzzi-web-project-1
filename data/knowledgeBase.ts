import { COMPANY_INFO } from "../constants";

export interface KnowledgeEntry {
  id: string;
  category: 'pricing' | 'service' | 'general' | 'support';
  keywords: string[];
  answer: string;
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // --- COMPANY & GENERAL ---
  {
    id: 'overview',
    category: 'general',
    keywords: ['who are you', 'about buzzitech', 'what do you do', 'company overview'],
    answer: "Buzzitech IT Solutions & Services provides professional technology support, installations, and managed services for homes, businesses, and institutions in Ghana. We focus on connectivity, security, and operational efficiency."
  },
  {
    id: 'contact',
    category: 'general',
    keywords: ['contact', 'phone', 'email', 'whatsapp', 'reach you', 'number'],
    answer: `📞 **Contact Us**\n\n**Phone:** ${COMPANY_INFO.phone}\n**Email:** ${COMPANY_INFO.email}\n**Website:** www.buzzitechsolutions.com\n\nWe operate nationwide across Ghana.`
  },
  {
    id: 'location',
    category: 'general',
    keywords: ['location', 'where', 'address', 'region', 'area'],
    answer: "📍 **Service Areas**\n\nWe serve customers across:\n- Greater Accra\n- Eastern Region\n- Ashanti Region\n- Central Region\n- Northern Region\n- Volta Region\n\nWe provide nationwide services."
  },
  {
    id: 'payment',
    category: 'general',
    keywords: ['payment', 'pay', 'momo', 'cash', 'deposit', 'bank transfer', 'paystack'],
    answer: "💳 **Payment Options**\n\nWe accept:\n- Mobile Money (Momo)\n- Cash\n- Paystack\n- Bank Transfer\n\n**Note:** Booking for large projects requires at least a 50% deposit."
  },
  {
    id: 'warranty',
    category: 'support',
    keywords: ['warranty', 'guarantee', 'support period', 'after sales'],
    answer: "🛡️ **Warranty & Support**\n\n- **Installation Warranty:** 30 to 90 days depending on the service.\n- **Hardware Warranty:** Depends on the manufacturer.\n- **Remote Support:** Available for all clients."
  },

  // --- SERVICES & PRICING ---
  
  // CCTV
  {
    id: 'cctv-pricing',
    category: 'pricing',
    keywords: ['cctv price', 'camera cost', 'surveillance cost', 'install cctv', '4ch', '8ch'],
    answer: "📹 **CCTV Installation Services**\n\nWe offer full setups for homes and offices (HD Analog & IP).\n\n**Price Range:**\n- Basic 4CH Package: **GHS 1,800 – 2,500**\n- 8CH Package: **GHS 3,200 – 5,000**\n- Per Camera Labour: **GHS 150 – 250**\n\nIncludes remote viewing setup on your phone."
  },
  {
    id: 'cctv-technical',
    category: 'service',
    keywords: ['view cctv on phone', 'ip camera', 'hd camera', 'viewing setup'],
    answer: "Yes, we offer both HD analog and IP cameras. Remote viewing on your mobile phone is included in all our installations."
  },

  // Starlink
  {
    id: 'starlink-pricing',
    category: 'pricing',
    keywords: ['starlink price', 'starlink cost', 'install starlink', 'satellite internet', 'starlink mesh'],
    answer: "🛰️ **Starlink Installation**\n\nWe handle dish mounting, alignment, cabling, and router setup.\n\n**Service Costs:**\n- Installation Service: **GHS 650 – 1,200**\n- WiFi Mesh Setup: **GHS 350 – 600** per node\n\n*Note: We assist with setup and optimization; we do not sell the equipment directly.*"
  },
  {
    id: 'starlink-info',
    category: 'service',
    keywords: ['starlink time', 'how long starlink', 'dish alignment'],
    answer: "Starlink installation usually takes **1 to 2 hours**. We ensure proper alignment for maximum speed and stability."
  },

  // Networking
  {
    id: 'networking-pricing',
    category: 'pricing',
    keywords: ['networking price', 'cabling cost', 'lan cost', 'rack setup', 'network point'],
    answer: "🌐 **Networking (LAN/WAN/WLAN)**\n\nStructured cabling, network rack setup, and security.\n\n**Price Range:**\n- Per Network Point: **GHS 70 – 150**\n- Network Rack Setup: **GHS 500 – 1,500**\n- Router Configuration: **GHS 150 – 300**"
  },
  {
    id: 'wifi-coverage',
    category: 'service',
    keywords: ['poor wifi', 'extend wifi', 'mesh system', 'wifi coverage', 'network optimization'],
    answer: "Yes, we fix poor WiFi coverage using WiFi extension, mesh systems, and network optimization for homes, offices, hotels, and campuses."
  },

  // Hotspot
  {
    id: 'hotspot-pricing',
    category: 'pricing',
    keywords: ['hotspot', 'billing system', 'wifi voucher', 'hotel wifi', 'hotspot maintenance'],
    answer: "📶 **WiFi Hotspot Billing System**\n\nFor hotels, campuses, and public spaces. Integrates with Paystack and Momo.\n\n**Prices:**\n- Hotspot Setup: **GHS 1,200 – 2,500**\n- Monthly Maintenance: **GHS 150 – 300**"
  },

  // Computer Services
  {
    id: 'computer-pricing',
    category: 'pricing',
    keywords: ['repair laptop', 'fix computer', 'format pc', 'virus', 'ssd', 'diagnostics', 'os installation'],
    answer: "💻 **Computer Hardware & Software**\n\nRepairs, upgrades, and OS installation.\n\n**Prices:**\n- Laptop/PC Diagnostics: **GHS 50 – 80**\n- OS Installation: **GHS 80 – 150**\n- SSD Upgrade (Labour): **GHS 100 – 200**"
  },

  // Consultancy
  {
    id: 'consultancy-pricing',
    category: 'pricing',
    keywords: ['consultation', 'consulting', 'it advice', 'planning', 'infrastructure design'],
    answer: "💡 **IT Consultancy**\n\nTechnical guidance for businesses, network planning, and infrastructure design.\n\n**Price:**\n- Consultation Session: **GHS 150 – 300**"
  },

  // Web & Cloud
  {
    id: 'web-pricing',
    category: 'pricing',
    keywords: ['website cost', 'web design price', 'hosting cost', 'domain', 'business email'],
    answer: "🌍 **Web Design & Cloud**\n\n**Web Design:**\n- Basic Website: **GHS 1,500 – 2,500**\n- Advanced Website: **GHS 3,000 – 7,000**\n\n**Hosting & Cloud:**\n- Hosting: **GHS 300 – 600/yearly**\n- Business Email: **GHS 80 – 150/mailbox**"
  },

  // Managed Services
  {
    id: 'managed-services',
    category: 'pricing',
    keywords: ['managed service', 'monthly support', 'maintenance plan', 'it support'],
    answer: "🛠️ **Managed IT Services**\n\nMonthly IT support for SMEs, schools, hotels, and offices.\n\n**Price:**\n- Monthly Support Plan: **GHS 400 – 1,500**"
  },

  // --- TROUBLESHOOTING ---
  {
    id: 'troubleshoot-internet',
    category: 'support',
    keywords: ['slow internet', 'internet issue', 'starlink issue', 'dish alignment'],
    answer: "🔧 **Internet Troubleshooting**\n\n- **Slow Internet:** Check router placement, number of users, and cable condition.\n- **Starlink Issues:** Confirm dish alignment and ensure a clear view of the sky."
  },
  {
    id: 'troubleshoot-cctv',
    category: 'support',
    keywords: ['cctv issue', 'no video', 'no playback', 'camera not working', 'dvr'],
    answer: "🔧 **CCTV Troubleshooting**\n\n- **No Video:** Check power supply, loose cables, or DVR input.\n- **No Playback:** Ensure the storage disk (HDD) is working properly."
  },
  {
    id: 'troubleshoot-hotspot',
    category: 'support',
    keywords: ['hotspot issue', 'cant connect', 'login portal', 'access point'],
    answer: "🔧 **Hotspot Troubleshooting**\n\n- **Users not connecting:** Restart the access point or check if the login portal is active."
  },

  // --- BOOKING ---
  {
    id: 'booking',
    category: 'support',
    keywords: ['book', 'appointment', 'schedule', 'hire', 'job', 'weekend'],
    answer: "📅 **How to Book**\n\nYou can contact us via phone, WhatsApp, email, or through our website booking form.\n\n**Note:** Most jobs take 1 to 3 hours depending on the service. Weekend support is available by appointment."
  }
];

export const FALLBACK_ANSWER = "I can help with pricing and details for **CCTV**, **Starlink**, **Networking**, **Web Design**, **Computer Repairs**, and **Hotspots**. \n\nYou can also call us directly at **" + COMPANY_INFO.phone + "**.";
