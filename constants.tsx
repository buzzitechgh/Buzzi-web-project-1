import { 
  Server, 
  Network, 
  Video, 
  CreditCard, 
  Cloud, 
  Download, 
  Wrench, 
  Lightbulb, 
  ShieldCheck, 
  MonitorCheck,
  Cpu,
  Wifi,
  Lock,
  Zap,
  Satellite,
  Globe,
  ShoppingCart
} from 'lucide-react';
import { ServiceItem, Testimonial } from './types';

export const COMPANY_INFO = {
  name: "Buzzitech IT Solutions & Services",
  phone: "0507480623",
  whatsapp: "233507480623", 
  email: "buzzitechgh@gmail.com",
  address: "Accra, Ghana"
};

export const N8N_WEBHOOK_URL = "https://your-n8n-instance.com/webhook/buzzitech-forms";
export const N8N_CHAT_WEBHOOK_URL = "https://your-n8n-instance.com/webhook/buzzitech-chat";

// Updated to match the specific list provided by the client
export const SERVICES: ServiceItem[] = [
  {
    id: 'networking',
    title: 'Network Engineering',
    description: 'Professional structured cabling, Server Rack management, LAN/WLAN/CAN deployment, and infrastructure design.',
    icon: Network
  },
  {
    id: 'security',
    title: 'CCTV & Surveillance',
    description: 'Expert installation of high-definition CCTV systems, remote monitoring setup, and access control.',
    icon: Video
  },
  {
    id: 'starlink',
    title: 'Starlink Setup',
    description: 'Professional mounting and configuration of Starlink Satellite Internet for homes, offices, and remote locations.',
    icon: Satellite
  },
  {
    id: 'wifi',
    title: 'Hotspot WiFi Deployment',
    description: 'Enterprise-grade WiFi solutions, long-range outdoor access points, and hotspot billing system configuration.',
    icon: Wifi
  },
  {
    id: 'pos',
    title: 'Point of Sale (POS)',
    description: 'Complete POS hardware and software setup for retail shops, restaurants, and supermarkets.',
    icon: ShoppingCart
  },
  {
    id: 'web-cloud',
    title: 'Web & Cloud Solutions',
    description: 'Modern web design, reliable web hosting, and cloud computing services to digitize your business.',
    icon: Globe
  },
  {
    id: 'hardware',
    title: 'Hardware Support',
    description: 'Expert repairs for Personal Computers, Servers, Smartphones & Tablets.',
    icon: Cpu
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Emmanuel Mensah',
    role: 'Operations Manager',
    company: 'Ghana Logistics Ltd',
    content: 'Buzzitech transformed our network infrastructure. The structured cabling in our server room is now world-class.',
    avatar: 'https://picsum.photos/id/1012/100/100'
  },
  {
    id: '2',
    name: 'Sarah Osei',
    role: 'CEO',
    company: 'Retail Prime',
    content: 'The POS system setup was flawless. My inventory management is now automated and easy to track.',
    avatar: 'https://picsum.photos/id/1027/100/100'
  },
  {
    id: '3',
    name: 'David Asante',
    role: 'Director',
    company: 'Rural Connect',
    content: 'Their Starlink installation was perfect. We now have high-speed internet in our remote office location.',
    avatar: 'https://picsum.photos/id/1005/100/100'
  }
];