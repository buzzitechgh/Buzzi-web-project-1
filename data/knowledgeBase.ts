import { COMPANY_INFO } from "../constants";

export interface KnowledgeEntry {
  id: string;
  category: 'pricing' | 'service' | 'general' | 'support' | 'company' | 'troubleshooting' | 'smalltalk';
  keywords: string[];
  answer: string;
  action?: string; // Action trigger for UI components
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // --- INTERACTIVE ACTIONS ---
  {
    id: 'interactive-quote',
    category: 'service',
    keywords: ['generate quote', 'create quote', 'get a quote', 'make an estimate', 'request quotation', 'start quote', 'send estimate'],
    answer: "I can help you generate a formal quote right here! 📝\n\nTo get started, please tell me your **Full Name**.",
    action: 'start_quote_flow'
  },

  // --- SMALL TALK & HUMAN PERSONA ---
  {
    id: 'greeting',
    category: 'smalltalk',
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'sup', 'howdy'],
    answer: "Hello there! 👋 I'm the Buzzitech AI assistant.\n\nI can help you with **IT prices**, **booking appointments**, or even **troubleshoot computer problems** for you. How can I help today?"
  },
  {
    id: 'how-are-you',
    category: 'smalltalk',
    keywords: ['how are you', 'how are things', 'hows it going'],
    answer: "I'm functioning perfectly, thank you for asking! 🤖✨\n\nI'm ready to help you fix a slow computer, set up CCTV, or get your internet running fast. What's on your mind?"
  },
  {
    id: 'gratitude',
    category: 'smalltalk',
    keywords: ['thank you', 'thanks', 'thx', 'appreciate it'],
    answer: "You're very welcome! 😊 Happy to help.\n\nIf you need professional hands-on support, don't hesitate to click 'Book Appointment' in the menu!"
  },
  {
    id: 'identity',
    category: 'smalltalk',
    keywords: ['are you human', 'who are you', 'what are you', 'your name'],
    answer: "I'm Buzzitech's virtual assistant! While I'm an AI, I'm trained by expert engineers to help you solve basic IT issues and get you the services you need. 🛠️"
  },

  // --- GENERAL IT TROUBLESHOOTING (Human-like & Helpful) ---
  {
    id: 'slow-computer',
    category: 'troubleshooting',
    keywords: ['computer is slow', 'laptop slow', 'pc lagging', 'running slow', 'speed up pc', 'freezing'],
    answer: "I know a slow computer is frustrating! 🐢 Here are a few quick things to try:\n\n1. **Restart:** It sounds simple, but it clears temporary memory.\n2. **Check Updates:** Run Windows Update to patch bugs.\n3. **Startup Apps:** Press `Ctrl + Shift + Esc`, go to 'Startup', and disable apps you don't need right away.\n\nIf it's still slow, you might need an SSD upgrade. We can do that for you! Want a quote?"
  },
  {
    id: 'printer-issues',
    category: 'troubleshooting',
    keywords: ['printer not working', 'printer wont print', 'printer offline', 'paper jam', 'fix printer'],
    answer: "Printers can be tricky! 🖨️ Let's try this:\n\n1. **Power Cycle:** Unplug the printer for 60 seconds and plug it back in.\n2. **Check Connection:** Is the USB cable tight? Or is it connected to the right WiFi?\n3. **Clear Queue:** On your PC, search 'Printers', select yours, and hit 'Open Queue' to cancel stuck documents.\n\nStill stuck? We handle office printer setups professionally."
  },
  {
    id: 'blue-screen',
    category: 'troubleshooting',
    keywords: ['blue screen', 'bsod', 'blue error', 'computer crashed', 'sad face error'],
    answer: "Oh no, the Blue Screen of Death (BSOD)! 😱 Don't panic.\n\n1. **Restart:** Often, it's a one-time driver glitch.\n2. **Unplug Devices:** Remove USB drives or new hardware and restart.\n3. **Note the Code:** Did you see text like `CRITICAL_PROCESS_DIED`? That helps us diagnose it.\n\nIf this keeps happening, your hardware might be failing. I recommend booking a diagnostic session with us."
  },
  {
    id: 'no-audio',
    category: 'troubleshooting',
    keywords: ['no sound', 'audio not working', 'cant hear', 'speakers not working', 'volume issue'],
    answer: "Let's get your sound back! 🔊\n\n1. **Check Mute:** Is the speaker icon on your taskbar crossed out?\n2. **Wrong Output:** Click the speaker icon and ensure the correct device (Headphones vs Speakers) is selected.\n3. **Drivers:** Right-click Start > Device Manager > Audio inputs > Update driver.\n\nNeed help? We fix hardware audio issues too!"
  },
  {
    id: 'forgot-password',
    category: 'troubleshooting',
    keywords: ['forgot password', 'cant login', 'reset password', 'locked out'],
    answer: "Locked out? 🔒\n\n1. **Check Caps Lock:** It's the most common culprit!\n2. **Microsoft Account:** If you use Windows 10/11, you can reset your password at [account.microsoft.com](https://account.microsoft.com).\n3. **Local Account:** We have specialized tools to reset local admin passwords if you bring the device to us."
  },
  {
    id: 'wifi-wont-connect',
    category: 'troubleshooting',
    keywords: ['wifi not connecting', 'cant connect to wifi', 'no internet access', 'yellow triangle wifi'],
    answer: "No internet is a nightmare! 🌐 Try this sequence:\n\n1. **Forget Network:** Go to WiFi settings, right-click your network, select 'Forget', and rejoin.\n2. **Restart Router:** Unplug your router power, wait 10 seconds, and plug it back in.\n3. **Airplane Mode:** Toggle Airplane mode On and then Off to reset the radio.\n\nIf your signal is weak in certain rooms, we install **Long-Range Mesh Systems** to fix exactly that!"
  },
  {
    id: 'deleted-file',
    category: 'troubleshooting',
    keywords: ['deleted file', 'recover file', 'lost data', 'file missing', 'restore data'],
    answer: "🛑 **Stop!** If you accidentally deleted an important file:\n\n1. **Check Recycle Bin:** It might still be there!\n2. **Don't Save New Files:** Saving new data might overwrite the deleted file.\n3. **Backups:** Check OneDrive or Google Drive history.\n\nIf it's critical, we offer professional Data Recovery services. Contact us immediately."
  },
  {
    id: 'overheating',
    category: 'troubleshooting',
    keywords: ['laptop hot', 'overheating', 'fan loud', 'computer hot', 'fan noise'],
    answer: "Computers hate heat! 🔥 If it's hot or loud:\n\n1. **Airflow:** Ensure vents aren't blocked by blankets or laps. Use a hard surface.\n2. **Dust:** Compressed air can clean out clogged vents.\n3. **Thermal Paste:** Old laptops need new thermal paste on the CPU.\n\nWe provide a **full internal cleaning service** that makes laptops run like new. Interested?"
  },

  // --- COMPANY INFORMATION (History, Vision, Values) ---
  {
    id: 'company-history',
    category: 'company',
    keywords: ['history', 'founded', 'start', 'background', 'origin', 'story', 'since'],
    answer: "📜 **Our History**\n\nBuzzitech was founded to address the growing need for professional, enterprise-grade IT services in Ghana. We started as a small consultancy and have grown into a full-service IT solutions provider, building digital foundations for businesses across West Africa."
  },
  {
    id: 'company-vision',
    category: 'company',
    keywords: ['vision', 'future', 'goal', 'aim', 'objective'],
    answer: "🚀 **Our Vision**\n\nTo be the leading IT infrastructure and support provider in West Africa, recognized for excellence, innovation, and unwavering reliability."
  },
  {
    id: 'company-mission',
    category: 'company',
    keywords: ['mission', 'purpose', 'why'],
    answer: "🎯 **Our Mission**\n\nTo empower businesses in Ghana with reliable, cutting-edge IT solutions that enhance productivity, security, and operational efficiency."
  },
  {
    id: 'company-values',
    category: 'company',
    keywords: ['values', 'culture', 'principles', 'integrity', 'trust', 'stand for'],
    answer: "💎 **Our Core Values**\n\n• **Integrity**: We build trust through transparency.\n• **Customer-Centricity**: Your success is our priority.\n• **Innovation**: We stay ahead of technology trends.\n• **Reliability**: We are there when you need us."
  },

  // --- GENERAL & CONTACT ---
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
    keywords: ['cctv', 'cctv price', 'camera cost', 'surveillance cost', 'install cctv', '4ch', '8ch', 'cctv security', 'cctv & surveillance', 'security camera'],
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
    keywords: ['starlink', 'starlink price', 'starlink cost', 'install starlink', 'satellite internet', 'starlink mesh', 'starlink internet', 'starlink setup'],
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
    keywords: ['networking', 'networking price', 'cabling cost', 'lan cost', 'rack setup', 'network point', 'network engineering'],
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
    keywords: ['hotspot', 'billing system', 'wifi voucher', 'hotel wifi', 'hotspot maintenance', 'hotspot wifi deployment'],
    answer: "📶 **WiFi Hotspot Billing System**\n\nFor hotels, campuses, and public spaces. Integrates with Paystack and Momo.\n\n**Prices:**\n- Hotspot Setup: **GHS 1,200 – 2,500**\n- Monthly Maintenance: **GHS 150 – 300**"
  },
  
  // Business Automation & POS
  {
    id: 'business-automation',
    category: 'service',
    keywords: ['business automation', 'pos system', 'point of sale', 'inventory', 'retail software', 'automation tool', 'business automation & pos'],
    answer: "🛍️ **Business Automation & POS**\n\nWe provide complete retail and business management solutions:\n\n- **POS Systems:** Hardware & Software for shops/malls.\n- **Inventory Management:** Track stock in real-time.\n- **Automation:** Streamline sales and reporting."
  },

  // Computer Services
  {
    id: 'computer-pricing',
    category: 'pricing',
    keywords: ['repair laptop', 'fix computer', 'format pc', 'virus', 'ssd', 'diagnostics', 'os installation', 'hardware support', 'computer repair'],
    answer: "💻 **Computer Hardware & Software**\n\nRepairs, upgrades, and OS installation.\n\n**Prices:**\n- Laptop/PC Diagnostics: **GHS 50 – 80**\n- OS Installation: **GHS 80 – 150**\n- SSD Upgrade (Labour): **GHS 100 – 200**"
  },

  // Consultancy
  {
    id: 'consultancy-pricing',
    category: 'pricing',
    keywords: ['consultation', 'consulting', 'it advice', 'planning', 'infrastructure design', 'it consultation'],
    answer: "💡 **IT Consultancy**\n\nTechnical guidance for businesses, network planning, and infrastructure design.\n\n**Price:**\n- Consultation Session: **GHS 150 – 300**"
  },

  // Web & Cloud
  {
    id: 'web-pricing',
    category: 'pricing',
    keywords: ['website cost', 'web design price', 'hosting cost', 'domain', 'business email', 'web design', 'web & cloud', 'web & cloud solutions'],
    answer: "🌍 **Web Design & Cloud**\n\n**Web Design:**\n- Basic Website: **GHS 1,500 – 2,500**\n- Advanced Website: **GHS 3,000 – 7,000**\n\n**Hosting & Cloud:**\n- Hosting: **GHS 300 – 600/yearly**\n- Business Email: **GHS 80 – 150/mailbox**"
  },

  // Managed Services
  {
    id: 'managed-services',
    category: 'pricing',
    keywords: ['managed service', 'monthly support', 'maintenance plan', 'it support', 'remote support'],
    answer: "🛠️ **Managed IT Services**\n\nMonthly IT support for SMEs, schools, hotels, and offices.\n\n**Price:**\n- Monthly Support Plan: **GHS 400 – 1,500**"
  },

  // --- SPECIFIC SERVICE TROUBLESHOOTING ---
  {
    id: 'troubleshoot-internet',
    category: 'support',
    keywords: ['slow internet', 'internet issue', 'starlink issue', 'dish alignment', 'no connection'],
    answer: "🔧 **Internet Troubleshooting**\n\n- **Slow Internet:** Check router placement, number of users, and cable condition.\n- **Starlink Issues:** Confirm dish alignment and ensure a clear view of the sky."
  },
  {
    id: 'troubleshoot-cctv',
    category: 'support',
    keywords: ['cctv issue', 'no video', 'no playback', 'camera not working', 'dvr beep'],
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

export const FALLBACK_ANSWER = "I can help with **Pricing**, **Starlink**, **CCTV**, or **General Computer Problems** (like slow laptops or printer issues). 🛠️\n\nTry asking: *\"My computer is slow\"* or *\"How much for CCTV?\"*\n\nYou can also call us directly at **" + COMPANY_INFO.phone + "**.";