import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, ShoppingBag, Package, RefreshCw, LayoutDashboard, 
  Calendar, MessageSquare, FileText, TrendingUp, Users, DollarSign,
  Phone, Mail, Clock, CheckCircle, AlertCircle, Edit2, Image, Save, X, Ticket,
  Settings, CreditCard, Webhook, Server, Plus, Star, Link as LinkIcon, Upload, UserPlus, Truck, Monitor, Video, ShieldCheck, Trash2,
  Bot, FileJson, UploadCloud, Smartphone, Radio, Activity, Eye, File, Megaphone, UserCog, MoreVertical, Briefcase, Download, Building, ArrowRight, Smile, Paperclip, Lock, Key, Send, Search, Filter, MapPin, EyeOff, ToggleLeft, ToggleRight, Unlock
} from 'lucide-react';
import Logo from '../components/Logo';
import { api } from '../services/api';
import Button from '../components/Button';
import { Product, Technician, User, Meeting, ChatMessage, KnowledgeEntry, LoginLog, QuoteFormData, QuoteItem } from '../types';
import DashboardChart from '../components/DashboardChart';
import { generateInvoice } from '../services/invoiceGenerator';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'bookings' | 'users' | 'meetings' | 'quotes' | 'messages' | 'chatbot' | 'inventory' | 'media' | 'communication' | 'settings'>('overview');
  
  // Data States
  const [stats, setStats] = useState<any>({});
  const [graphData, setGraphData] = useState<number[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [internalChats, setInternalChats] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeEntry[]>([]);
  
  // Ticket Interaction States
  const [revealedOtps, setRevealedOtps] = useState<Record<string, boolean>>({});
  
  // Inventory / Product Edit States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [inventorySearch, setInventorySearch] = useState("");
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ 
      name: '', price: 0, originalPrice: 0, stock: 0, brand: '', category: 'General', description: '', image: '', features: [], isActive: true
  });

  // Chatbot Edit States
  const [isAddingKB, setIsAddingKB] = useState(false);
  const [newKBEntry, setNewKBEntry] = useState<Partial<KnowledgeEntry>>({ category: 'general', keywords: [], answer: '' });
  const [kbKeywordsInput, setKbKeywordsInput] = useState("");

  // Communication States
  const [replyingMessage, setReplyingMessage] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [internalMessage, setInternalMessage] = useState("");
  const [chatTarget, setChatTarget] = useState<User | null>(null); // For admin 1-on-1 chat
  
  // Chat Interaction States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojis = ["👍", "👋", "😊", "😂", "❤️", "🔥", "🎉", "✅", "❌", "🤔", "💻", "🔧"];

  const [isAddingMeeting, setIsAddingMeeting] = useState(false);
  const [newMeetingData, setNewMeetingData] = useState({ title: '', platform: 'Zoom', date: '', time: '', attendees: '' });
  const [remoteId, setRemoteId] = useState("");
  const [showRemoteModal, setShowRemoteModal] = useState(false);
  
  // Bulk Comms State
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkType, setBulkType] = useState<'sms' | 'email'>('email');
  const [bulkRecipients, setBulkRecipients] = useState("all");

  // User Management States
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [newUserData, setNewUserData] = useState({ name: '', email: '', role: 'customer', password: '' });
  
  // Roles & Departments Management
  const [techRoles, setTechRoles] = useState(["Network Engineer", "CCTV Specialist", "Software Support", "Field Technician", "System Administrator"]);
  const [departments, setDepartments] = useState(["Infrastructure", "Security", "IT Support", "Field Ops", "Networking", "General"]);
  const [isManagingRoles, setIsManagingRoles] = useState(false);
  const [newRoleInput, setNewRoleInput] = useState("");
  const [newDeptInput, setNewDeptInput] = useState("");

  // Technician Edit State
  const [newTechData, setNewTechData] = useState<Partial<Technician> & { password?: string }>({ 
      name: '', email: '', phone: '', role: 'Network Engineer', department: 'Infrastructure', rating: 5, feedback: '', password: '' 
  });
  const [isAddingTech, setIsAddingTech] = useState(false);
  
  // Ticket Management
  const [bookingFilter, setBookingFilter] = useState('All');
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state to prevent double clicking
  const [newBookingData, setNewBookingData] = useState({ name: '', phone: '', email: '', serviceType: '', date: '', time: '', technician: '' });

  // Admin Quote Generator State
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [newQuoteData, setNewQuoteData] = useState<Partial<QuoteFormData>>({ name: '', email: '', phone: '', serviceType: 'General', grandTotal: 0, items: [] });
  const [newQuoteItem, setNewQuoteItem] = useState<Partial<QuoteItem>>({ name: '', price: 0, quantity: 1, category: 'Hardware' });

  // Site Media State
  const [siteImages, setSiteImages] = useState<any>({});
  const [selectedImageKey, setSelectedImageKey] = useState("hero_bg");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Chat scroll ref
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Settings State
  const [settings, setSettings] = useState({
      adminEmail: 'admin@buzzitech.com',
      logoUrl: '',
      n8nWebhook: '',
      n8nChatWebhook: '',
      n8nQuoteWebhook: '',
      n8nCallbackWebhook: '',
      formspreeUrl: '',
      smsProvider: 'AfricaTalking',
      smsApiKey: '',
      smsSenderId: '',
      paymentGateway: 'paystack',
      paystackPublicKey: '',
      paystackSecretKey: '',
      smtpHost: 'smtp.gmail.com',
      smtpUser: '',
      smtpPass: '',
      twoFactorEnforced: false, 
  });
  
  // Admin Profile & Security State
  const [currentUser2FA, setCurrentUser2FA] = useState(false);
  const [adminProfile, setAdminProfile] = useState({ email: '', password: '' });

  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  // Predefined Image Keys for Dropdown
  const MEDIA_LOCATIONS = [
      { key: "hero_bg", label: "Home Page - Background Pattern" },
      { key: "slide_1", label: "Home Slide 1 (Network Engineering)" },
      { key: "slide_2", label: "Home Slide 2 (CCTV Security)" },
      { key: "slide_3", label: "Home Slide 3 (Starlink)" },
      { key: "slide_4", label: "Home Slide 4 (WiFi)" },
      { key: "slide_5", label: "Home Slide 5 (POS)" },
      { key: "tracking_hero", label: "Order Tracking Page - Hero Image" },
      { key: "about_img", label: "About Page - Team/Story Image" },
      { key: "cctv_banner", label: "Service Banner - CCTV" }
  ];

  const PRODUCT_CATEGORIES = ["Starlink", "Networking", "CCTV IP", "CCTV Analog", "Recorders", "Access Control", "Power", "Cables", "Accessories", "Office", "Computers"];

  // --- STYLING CONSTANTS ---
  const inputStyle = "w-full border border-gray-300 rounded-lg p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none";
  const labelStyle = "block text-xs font-bold text-slate-500 mb-1 uppercase";

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (!storedToken) {
      navigate('/admin/login');
      return;
    }
    setToken(storedToken);
    fetchData(storedToken);
  }, [navigate]);

  useEffect(() => {
      // Sync current input URL when selection changes
      if (siteImages[selectedImageKey]) {
          setCurrentImageUrl(siteImages[selectedImageKey]);
      } else {
          setCurrentImageUrl("");
      }
  }, [selectedImageKey, siteImages]);

  // Scroll chat to bottom when messages update
  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [internalChats, chatTarget]);

  const fetchData = async (authToken: string) => {
    setLoading(true);
    // Minimum delay for visual feedback
    const delay = new Promise(resolve => setTimeout(resolve, 500));
    try {
      const [statsData, ordersData, bookingsData, messagesData, quotesData, productsData, settingsData, techsData, imagesData, usersData, chatsData, meetingsData, kbData, logsData] = await Promise.all([
        api.getAdminStats(authToken),
        api.getAdminOrders(authToken),
        api.getAdminBookings(authToken),
        api.getAdminMessages(authToken),
        api.getAdminQuotes(authToken),
        api.getAdminProducts(authToken),
        api.getSettings(authToken),
        api.getTechnicians(authToken),
        api.getSiteImages(),
        api.getUsers(),
        api.getChatMessages(),
        api.getMeetings(),
        api.getKnowledgeBase(authToken),
        api.getLoginLogs(authToken),
        delay
      ]);
      
      // Map API Stats to State
      setStats({
          totalRevenue: statsData.overview?.revenue || 0,
          activeOrders: statsData.overview?.pendingOrders || 0,
          openTickets: messagesData.filter((m: any) => m.status === 'Open').length,
          totalUsers: statsData.overview?.users || 0,
          activeTechnicians: statsData.overview?.technicians || 0,
          lowStock: statsData.overview?.lowStock || 0,
          generatedQuotes: statsData.overview?.generatedQuotes || 0,
          remoteSessions: statsData.overview?.remoteSessions || 0,
          loggedInUsers: statsData.overview?.loggedInUsers || 0
      });

      // Prepare Graph Data (Map 12 months)
      const graphRaw = statsData.charts?.revenue || [];
      const graphFormatted = Array(12).fill(0);
      graphRaw.forEach((item: any) => {
          if (item._id && item._id >= 1 && item._id <= 12) {
              graphFormatted[item._id - 1] = item.total;
          }
      });
      setGraphData(graphFormatted);

      setOrders(ordersData);
      setBookings(bookingsData);
      setMessages(messagesData);
      setQuotes(quotesData);
      setProducts(productsData);
      setTechnicians(techsData);
      setUsers(usersData);
      setInternalChats(chatsData);
      setMeetings(meetingsData);
      setKnowledgeBase(kbData);
      setLoginLogs(logsData);
      
      // Update Settings State (Flattening logic)
      if (settingsData) {
          setSettings(prev => ({
              ...prev,
              adminEmail: settingsData.supportEmail || prev.adminEmail,
              logoUrl: settingsData.logoUrl || prev.logoUrl,
              paymentGateway: settingsData.payments?.gateway || prev.paymentGateway,
              paystackPublicKey: settingsData.payments?.paystack?.publicKey || prev.paystackPublicKey,
              smsProvider: settingsData.sms?.provider || prev.smsProvider,
              smsSenderId: settingsData.sms?.senderId || prev.smsSenderId,
              smtpHost: settingsData.email?.smtp?.host || prev.smtpHost,
              smtpUser: settingsData.email?.smtp?.user || prev.smtpUser,
              n8nWebhook: settingsData.n8n?.webhooks?.orderCreated || prev.n8nWebhook,
              n8nChatWebhook: settingsData.n8n?.webhooks?.ticketCreated || prev.n8nChatWebhook, 
              n8nQuoteWebhook: settingsData.n8n?.webhooks?.quoteRequested || prev.n8nQuoteWebhook,
              twoFactorEnforced: settingsData.security?.twoFactorEnforced || false,
          }));
          
          if(settingsData.technicianRoles?.length) setTechRoles(settingsData.technicianRoles);
          if(settingsData.departments?.length) setDepartments(settingsData.departments);
      }

      if(imagesData && Object.keys(imagesData).length > 0) {
          setSiteImages(imagesData);
          if (imagesData["hero_bg"]) setCurrentImageUrl(imagesData["hero_bg"]);
      }

      // Check current user 2FA status and Populate Admin Profile
      try {
          const storedUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
          const me = usersData.find((u: any) => u.email === storedUser.email);
          if (me) {
              setCurrentUser2FA(me.isTwoFactorEnabled);
              setAdminProfile(prev => ({ ...prev, email: me.email }));
          }
      } catch (e) {}

    } catch (error) {
      console.error("Failed to load admin data", error);
      if ((error as any).message?.includes('401')) {
          handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  // --- ACTIONS ---

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
      // In a real app, you'd call an API. Mocking local update:
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
  };

  const handleDeleteBooking = async (bookingId: string) => {
      if(!confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) return;
      try {
          await api.deleteBooking(bookingId, token);
          setBookings(prev => prev.filter(b => b.id !== bookingId));
      } catch(e) {
          alert("Failed to delete booking.");
      }
  };

  const handleAssignTechnician = async (bookingId: string, technician: string) => {
     try {
       await api.assignTechnician(bookingId, technician, token);
       // Update local state to reflect assignment immediately
       setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, technician: technician === 'Unassigned' ? null : technician, taskStatus: 'Assigned', status: b.status === 'Pending' ? 'In Progress' : b.status } : b));
       alert(`Technician assigned & notified successfully.`);
     } catch (e) {
       alert("Failed to assign technician");
     }
  };

  const handleUserSelectForTicket = (userId: string) => {
      if (userId === 'new') {
          setNewBookingData(prev => ({ ...prev, name: '', email: '', phone: '' }));
          return;
      }
      const user = users.find(u => u.id === userId);
      if (user) {
          setNewBookingData(prev => ({ 
              ...prev, 
              name: user.name, 
              email: user.email, 
              phone: user.phone || '' 
          }));
      }
  };

  const handleCreateBooking = async () => {
      if(!newBookingData.name || !newBookingData.serviceType) {
          alert("Please fill in Client Name and Job Description");
          return;
      }
      
      setIsSubmitting(true);
      try {
          const result = await api.createAdminBooking(newBookingData, token);
          if (result.booking) setBookings(prev => [result.booking, ...prev]);
          setNewBookingData({ name: '', phone: '', email: '', serviceType: '', date: '', time: '', technician: '' });
          setIsAddingBooking(false);
          alert("Ticket created! Notifications sent to Customer & Technician.");
      } catch (e) {
          alert("Failed to create booking");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleAddTechnician = async () => {
      if(!newTechData.name?.trim() || !newTechData.email?.trim() || !newTechData.password?.trim()) {
          alert("Name, Email and Password are required");
          return;
      }
      try {
          // Add to backend via API (Mocked logic handles user creation usually, but we force sync here)
          const result = await api.addTechnician(newTechData, token);
          if (result.technicians) setTechnicians(result.technicians);
          
          // Sync to Users list for visibility
          const newTechUser = { 
              id: `t-${Date.now()}`, 
              name: newTechData.name!, 
              email: newTechData.email!, 
              role: 'technician', 
              status: 'Active', 
              isApproved: true,
              technicianId: `TECH-${Math.floor(Math.random()*1000)}`,
              password: newTechData.password
          } as any; // Using any to bypass partial type mismatch
          
          // Update local Users list
          setUsers(prev => [...prev, newTechUser]);
          
          setNewTechData({ name: '', email: '', phone: '', role: 'Network Engineer', department: 'Infrastructure', rating: 5, feedback: '', password: '' });
          setIsAddingTech(false);
          alert("Technician Added Successfully (Account Active)");
      } catch (error) {
          alert("Failed to add technician");
      }
  };

  const handleCreateUser = async () => {
      if (!newUserData.email || !newUserData.name || !newUserData.password) {
          alert("Name, Email and Password are required");
          return;
      }
      try {
          const result = await api.createUser(newUserData as Partial<User>);
          setUsers(prev => [...prev, result.user]);
          setNewUserData({ name: '', email: '', role: 'customer', password: '' });
          setIsAddingUser(false);
      } catch (e) {
          alert("Failed to create user");
      }
  };

  const handleAssignRole = async (userId: string, newRole: string) => {
      try {
          await api.updateUserRole(userId, newRole);
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
          alert(`User role updated to ${newRole}`);
      } catch (e) {
          alert("Failed to update role");
      }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
      const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
      const action = currentStatus === 'Active' ? 'Disable' : 'Enable';
      
      if (!confirm(`Are you sure you want to ${action} this user?`)) return;

      try {
          await api.updateUserStatus(userId, newStatus);
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus as any } : u));
          alert(`User ${action}d successfully`);
      } catch (e) {
          alert(`Failed to ${action.toLowerCase()} user`);
      }
  };

  const handleAddRole = () => {
      if (newRoleInput.trim()) {
          setTechRoles([...techRoles, newRoleInput.trim()]);
          setNewRoleInput("");
      }
  };

  const handleAddDept = () => {
      if (newDeptInput.trim()) {
          setDepartments([...departments, newDeptInput.trim()]);
          setNewDeptInput("");
      }
  };

  // --- QUOTE ACTIONS ---
  const handleAddQuoteItem = () => {
      if (!newQuoteItem.name || !newQuoteItem.price) return;
      const item: QuoteItem = {
          id: `item-${Date.now()}`,
          name: newQuoteItem.name || '',
          price: Number(newQuoteItem.price),
          quantity: Number(newQuoteItem.quantity),
          category: newQuoteItem.category || 'General',
          description: newQuoteItem.description
      };
      // Explicitly cast to QuoteItem[] to avoid type errors
      const currentItems = (newQuoteData.items || []) as QuoteItem[];
      const updatedItems = [...currentItems, item];
      const total = updatedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
      
      setNewQuoteData({ ...newQuoteData, items: updatedItems, grandTotal: total });
      setNewQuoteItem({ name: '', price: 0, quantity: 1, category: 'Hardware' });
  };

  const handleGenerateAdminQuote = async () => {
      if (!newQuoteData.name || (newQuoteData.items || []).length === 0) {
          alert("Please enter client details and at least one item.");
          return;
      }
      
      const fullQuote: QuoteFormData = {
          name: newQuoteData.name!,
          email: newQuoteData.email || '',
          phone: newQuoteData.phone || '',
          serviceType: newQuoteData.serviceType || 'General Quote',
          description: newQuoteData.description || 'Generated by Admin',
          grandTotal: newQuoteData.grandTotal || 0,
          timeline: 'Immediate',
          items: newQuoteData.items as QuoteItem[],
          date: new Date().toISOString()
      };

      try {
          await api.requestQuotation(fullQuote);
          generateInvoice(fullQuote); 
          setQuotes(prev => [fullQuote, ...prev]);
          setIsCreatingQuote(false);
          setNewQuoteData({ name: '', email: '', phone: '', serviceType: 'General', grandTotal: 0, items: [] });
          alert("Quote Generated & Invoice Downloaded");
      } catch (e) {
          alert("Failed to generate quote");
      }
  };

  const handleAddKBEntry = async () => {
      if (!newKBEntry.answer || !kbKeywordsInput) return;
      const keywords = kbKeywordsInput.split(',').map(k => k.trim()).filter(k => k.length > 0);
      try {
          const result = await api.addKnowledgeEntry({ ...newKBEntry, keywords }, token);
          if (result.entry) setKnowledgeBase(prev => [...prev, result.entry!]);
          setNewKBEntry({ category: 'general', keywords: [], answer: '' });
          setKbKeywordsInput("");
          setIsAddingKB(false);
      } catch (e) {
          alert("Failed to add entry");
      }
  };

  const handleDeleteKBEntry = async (id: string) => {
      if(!confirm("Are you sure you want to delete this response?")) return;
      try {
          await api.deleteKnowledgeEntry(id, token);
          setKnowledgeBase(prev => prev.filter(e => e.id !== id));
      } catch (e) {
          alert("Failed to delete entry");
      }
  };

  const handleKBUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
          const result = await api.uploadKnowledgeBase(file, token);
          alert(`Successfully uploaded/extracted ${result.count} entries!`);
          const kbData = await api.getKnowledgeBase(token);
          setKnowledgeBase(kbData);
      } catch (error: any) {
          alert("Upload failed: " + error.message);
      } finally {
          setUploading(false);
      }
  };

  const handleLaunchRemote = (tool: 'anydesk' | 'teamviewer' | 'rustdesk') => {
      if (!remoteId) { alert("Please enter a Session ID"); return; }
      const cleanId = remoteId.replace(/\s/g, '');
      let protocolUrl = tool === 'anydesk' ? `anydesk:${cleanId}` : tool === 'rustdesk' ? `rustdesk://${cleanId}` : `teamviewer8://${cleanId}`; 
      let fallbackUrl = tool === 'anydesk' ? 'https://anydesk.com/en/downloads' : tool === 'rustdesk' ? 'https://rustdesk.com/download' : 'https://www.teamviewer.com/en/download/';
      window.location.href = protocolUrl;
      setTimeout(() => { if(confirm(`It seems ${tool} didn't open. Do you want to download it?`)) window.open(fallbackUrl, '_blank'); }, 1500);
      setShowRemoteModal(false);
      setRemoteId("");
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
      try {
          await api.updateOrderStatus(orderId, status, token);
          setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o));
      } catch (error) { alert("Failed to update status"); }
  };

  const handleCreateProduct = async () => {
      try {
          const productToSave = { ...newProduct, id: `prod-${Date.now()}` } as Product;
          await api.addProduct(productToSave, token);
          setProducts(prev => [...prev, productToSave]);
          setIsAddingProduct(false);
          setNewProduct({ name: '', price: 0, originalPrice: 0, stock: 0, brand: '', category: 'General', description: '', image: '', features: [], isActive: true });
          alert("Product created successfully");
      } catch (e) { alert("Failed to create product"); }
  };

  const handleSaveProduct = async () => {
     if (!editingProduct) return;
     try {
       await api.updateProductDetails(editingProduct, token);
       setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
       setEditingProduct(null);
       alert("Product updated successfully");
     } catch (e) {
       alert("Failed to save product");
     }
  };

  const handleDeleteProduct = async (id: string) => {
      if(!confirm("Are you sure?")) return;
      await api.deleteProduct(id, token);
      setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleProductStatus = async (product: Product) => {
      const updated = { ...product, isActive: !product.isActive };
      await api.updateProductDetails(updated, token);
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
  };

  const handleSaveImages = async () => {
      const updatedImages = { ...siteImages, [selectedImageKey]: currentImageUrl };
      try {
        await api.updateSiteImages(updatedImages, token);
        setSiteImages(updatedImages);
        alert("Site images updated successfully!");
      } catch (e) { alert("Failed to update images"); }
  };

  const handleSaveSettings = async () => {
      try {
          const payload = {
              supportEmail: settings.adminEmail,
              logoUrl: settings.logoUrl,
              payments: { gateway: settings.paymentGateway, paystack: { publicKey: settings.paystackPublicKey, secretKey: settings.paystackSecretKey } },
              sms: { provider: settings.smsProvider, senderId: settings.smsSenderId, apiKey: settings.smsApiKey },
              email: { smtp: { host: settings.smtpHost, user: settings.smtpUser, pass: settings.smtpPass } },
              n8n: { webhooks: { orderCreated: settings.n8nWebhook, ticketCreated: settings.n8nChatWebhook, quoteRequested: settings.n8nQuoteWebhook } },
              formspreeUrl: settings.formspreeUrl,
              security: { twoFactorEnforced: settings.twoFactorEnforced },
              // Save dynamic roles/departments
              technicianRoles: techRoles,
              departments: departments,
              // Admin Profile Update
              adminAccount: {
                  email: adminProfile.email,
                  password: adminProfile.password
              }
          };
          await api.saveSettings(payload, token);
          
          setAdminProfile(prev => ({ ...prev, password: '' })); // Clear password field
          alert("System settings & Admin Profile updated successfully.");
      } catch (e) { alert("Failed to save settings."); }
  };

  const handleToggleAdmin2FA = async () => {
      if (!confirm(`Are you sure you want to ${currentUser2FA ? 'disable' : 'enable'} 2FA?`)) return;
      try {
          const res = await api.toggleTwoFactor();
          setCurrentUser2FA(res.isTwoFactorEnabled);
          alert(res.message);
      } catch (e) { alert("Failed to toggle 2FA."); }
  };

  const handleSendBulkMessage = async () => {
      if (!bulkMessage) return;
      let targetEmails = users.map(u => u.email);
      if (bulkRecipients === 'technician') targetEmails = users.filter(u => u.role === 'technician').map(u => u.email);
      if (bulkRecipients === 'customer') targetEmails = users.filter(u => u.role === 'customer').map(u => u.email);
      try {
          await api.sendBulkMessage(bulkType, targetEmails, bulkMessage, bulkSubject);
          alert(`${bulkType === 'email' ? 'Emails' : 'SMS'} queued for ${targetEmails.length} users.`);
          setBulkMessage("");
          setBulkSubject("");
      } catch (e) { alert("Failed to send bulk message"); }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
          const url = await api.uploadImage(file);
          setCurrentImageUrl(url);
          setSiteImages((prev: any) => ({ ...prev, [selectedImageKey]: url }));
      } catch (error) { alert("Failed to upload image"); } finally { setUploading(false); }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
      const file = e.target.files?.[0];
      if(!file) return;
      
      setUploading(true);
      try {
          const url = await api.uploadImage(file);
          if (isEdit && editingProduct) {
              setEditingProduct({...editingProduct, image: url});
          } else {
              setNewProduct(prev => ({...prev, image: url}));
          }
      } catch(e) {
          alert("Upload failed");
      } finally {
          setUploading(false);
      }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
          const url = await api.uploadImage(file);
          setSettings(prev => ({ ...prev, logoUrl: url }));
      } catch(e) { alert("Logo upload failed"); } finally { setUploading(false); }
  };

  const handleApproveUser = async (userId: string) => {
      try {
          await api.approveUser(userId, token);
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, isApproved: true, status: 'Active' } : u));
          alert("User approved successfully");
      } catch (e) { alert("Failed to approve user"); }
  };

  const handleDeleteMeeting = (id: string) => {
      if(!confirm("Are you sure you want to cancel this meeting?")) return;
      setMeetings(prev => prev.filter(m => m.id !== id));
  };

  const handleSendReply = async (messageId: string) => {
      if(!replyText) return;
      try {
        await api.replyToMessage(messageId, replyText, token);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'Responded', replies: [...(m.replies || []), { sender: 'Admin', text: replyText, date: new Date().toISOString() }] } : m));
        setReplyingMessage(null);
        setReplyText("");
        alert("Reply sent");
      } catch (e) {
        alert("Failed to send reply");
      }
  };

  const handleScheduleMeeting = async () => {
      try {
          const result = await api.scheduleMeeting({
              title: newMeetingData.title,
              platform: newMeetingData.platform as any,
              date: newMeetingData.date,
              time: newMeetingData.time,
              attendees: newMeetingData.attendees.split(',').map(e => e.trim())
          });
          setMeetings(prev => [...prev, result.meeting]);
          setIsAddingMeeting(false);
          setNewMeetingData({ title: '', platform: 'Zoom', date: '', time: '', attendees: '' });
          alert("Meeting Scheduled & Link Generated");
      } catch (e) {
          alert("Failed to schedule meeting");
      }
  };

  // --- CHAT ACTIONS ---
  const handleInternalChat = async () => {
      if (!internalMessage.trim() || !chatTarget) return;
      try {
          const result = await api.sendInternalMessage('admin', 'Admin', internalMessage, chatTarget.id, 'admin');
          setInternalChats(prev => [...prev, result.message]);
          setInternalMessage("");
          setShowEmojiPicker(false);
      } catch (e) {
          alert("Failed to send message");
      }
  };

  const handleEmojiClick = (emoji: string) => {
      setInternalMessage(prev => prev + emoji);
      setShowEmojiPicker(false);
  };

  const handleAttachClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setInternalMessage(prev => prev + ` [Attachment: ${file.name}] `);
          e.target.value = ''; // Reset
      }
  };

  // --- NEW HANDLER FOR MESSAGE BUTTON ---
  const handleStartChatFromTicket = (senderIdentifier: string) => {
      // Find matching user by name or email
      const targetUser = users.find(u => 
          u.name.toLowerCase().includes(senderIdentifier.toLowerCase()) || 
          u.email.toLowerCase().includes(senderIdentifier.toLowerCase())
      );
      
      if (targetUser) {
          setChatTarget(targetUser);
          // Scroll to the chat section
          setTimeout(() => {
              document.getElementById('internal-chat-ui')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
      } else {
          alert(`User "${senderIdentifier}" not found in active users list.`);
      }
  };

  // --- Components for Sections ---
  const OverviewCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-4 rounded-full ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    let colorClass = 'bg-gray-100 text-gray-700';
    if (['Completed', 'Confirmed', 'Read', 'Resolved', 'Responded', 'Delivered', 'Active', 'Approved'].includes(status)) colorClass = 'bg-green-100 text-green-700';
    else if (['Pending', 'Processing', 'Open', 'In Progress', 'Out for Delivery'].includes(status)) colorClass = 'bg-yellow-100 text-yellow-700';
    else if (['Cancelled', 'Rejected', 'Suspended'].includes(status)) colorClass = 'bg-red-100 text-red-700';
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colorClass}`}>
        {status}
      </span>
    );
  };

  // Use Dynamic Graph Data if available, else fallback to mock for visuals
  const revenueData = graphData.length > 0 ? graphData : [1200, 1900, 1500, 2200, 1800, 2800, 3500, 3100, 4200, 4500, 5000, 5500]; 
  const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const totalUsers = stats.totalUsers || users.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans relative">
      <aside className="bg-slate-900 text-slate-400 w-full md:w-64 flex-shrink-0 md:h-screen sticky top-0 flex flex-col z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
           <Logo lightMode={true} className="h-8 scale-90 origin-left" customSrc={settings.logoUrl} />
        </div>
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <LayoutDashboard size={18} /> <span className="font-medium">Dashboard</span>
          </button>
          <div className="pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-slate-600 px-4">Operations</div>
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'bookings' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Ticket size={18} /> <span>Service Desk & Tickets</span>
          </button>
          <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'messages' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <div className="flex items-center gap-3"><MessageSquare size={18} /> <span>Support Inbox</span></div>
            {messages.filter(m => m.status === 'Open').length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{messages.filter(m => m.status === 'Open').length}</span>}
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'orders' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <div className="flex items-center gap-3"><ShoppingBag size={18} /> <span>Orders</span></div>
          </button>
          <button onClick={() => setActiveTab('quotes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'quotes' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <FileText size={18} /> <span>Quotes</span>
          </button>
          <div className="pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-slate-600 px-4">People & AI</div>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'users' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Users size={18} /> <span>User Manager & Logs</span>
          </button>
          <button onClick={() => setActiveTab('meetings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'meetings' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Video size={18} /> <span>Meetings & Remote</span>
          </button>
          <button onClick={() => setActiveTab('chatbot')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'chatbot' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Bot size={18} /> <span>Chatbot & AI</span>
          </button>
          <button onClick={() => setActiveTab('communication')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'communication' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Megaphone size={18} /> <span>Bulk Comms</span>
          </button>
          <div className="pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-slate-600 px-4">Content & System</div>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Package size={18} /> <span>Inventory</span>
          </button>
          <button onClick={() => setActiveTab('media')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'media' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Image size={18} /> <span>Site Media</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Settings size={18} /> <span>Settings</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-all">
             <LogOut size={18} /> <span>Sign Out</span>
           </button>
        </div>
      </aside>

      <main className="flex-grow p-4 md:p-8 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 capitalize">{activeTab.replace('media', 'Site Media Manager').replace('bookings', 'Service Desk & Tickets')}</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowRemoteModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-primary-600 transition shadow-sm">
                <Monitor size={16} /> Remote Access
            </button>
            <button onClick={() => fetchData(token)} disabled={loading} className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-slate-600 shadow-sm transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 
                <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 animate-pulse">Loading data...</div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Row 1: Core Metrics */}
                  <OverviewCard title="Total Customers" value={totalUsers} icon={Users} color="bg-blue-500" />
                  <OverviewCard title="Total Revenue" value={`GHS ${stats.totalRevenue?.toLocaleString() || 0}`} icon={DollarSign} color="bg-green-500" />
                  <OverviewCard title="Pending Orders" value={stats.activeOrders || 0} icon={ShoppingBag} color="bg-purple-500" />
                  <OverviewCard title="Open Tickets" value={stats.openTickets || 0} icon={Ticket} color="bg-orange-500" />
                  
                  {/* Row 2: Operational Metrics */}
                  <OverviewCard title="Available Technicians" value={stats.activeTechnicians || 0} icon={UserCog} color="bg-teal-500" />
                  <OverviewCard title="Generated Quotes" value={stats.generatedQuotes || 0} icon={FileText} color="bg-indigo-500" />
                  <OverviewCard title="Low Stock Alerts" value={stats.lowStock || 0} icon={AlertCircle} color="bg-red-500" />
                  <OverviewCard title="Live Remote Sessions" value={stats.remoteSessions || 0} icon={Monitor} color="bg-cyan-500" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="lg:col-span-2">
                      <DashboardChart data={revenueData} labels={chartLabels} title="Real-time Revenue Trend" type="line" height={300} />
                   </div>
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="font-bold text-slate-700 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                         <button onClick={() => setActiveTab('bookings')} className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition"><span className="text-sm font-medium">Manage Tickets</span><ArrowRight size={16} className="text-slate-400" /></button>
                         <button onClick={() => setActiveTab('users')} className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition"><span className="text-sm font-medium">View Users</span><ArrowRight size={16} className="text-slate-400" /></button>
                         <button onClick={() => setActiveTab('inventory')} className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition"><span className="text-sm font-medium">Update Inventory</span><ArrowRight size={16} className="text-slate-400" /></button>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-gray-100">
                          <h4 className="font-bold text-slate-700 text-xs uppercase mb-3">System Status</h4>
                          <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span>Database</span><span className="text-green-600 font-bold">Connected</span></div>
                              <div className="flex justify-between"><span>Email Service</span><span className="text-green-600 font-bold">Operational</span></div>
                              <div className="flex justify-between"><span>Active Users</span><span className="text-blue-600 font-bold">{stats.loggedInUsers || 0}</span></div>
                          </div>
                      </div>
                   </div>
                </div>
              </>
            )}

            {/* ... Other Tabs (Orders, Bookings, Users, Meetings, Quotes) ... */}
            
            {/* MESSAGES TAB - UPDATED WITH CHAT BUTTON */}
            {activeTab === 'messages' && (
               <div className="space-y-6">
                   {/* Support Inbox Section */}
                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Mail size={18} /> Support Messages
                      </h3>
                      <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                         {messages.map(msg => (
                            <div key={msg.id} className="border p-4 rounded-lg hover:shadow-sm transition bg-white">
                               <div className="flex justify-between items-start mb-2">
                                  <div><h4 className="font-bold">{msg.subject}</h4><p className="text-xs text-slate-500">From: {msg.sender}</p></div>
                                  <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => handleStartChatFromTicket(msg.sender)}
                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" 
                                        title="Chat with User"
                                      >
                                          <MessageSquare size={16} />
                                      </button>
                                      <StatusBadge status={msg.status} />
                                  </div>
                               </div>
                               <p className="text-sm text-slate-700 mb-3">{msg.message}</p>
                               {msg.status === 'Open' && (
                                  <div className="flex gap-2">
                                     <input className="flex-1 border rounded px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary-200" placeholder="Type reply..." value={replyingMessage === msg.id ? replyText : ''} onChange={e => {setReplyingMessage(msg.id); setReplyText(e.target.value)}} />
                                     <Button size="sm" onClick={() => handleSendReply(msg.id)}>Reply</Button>
                                  </div>
                               )}
                            </div>
                         ))}
                         {messages.length === 0 && <p className="text-slate-400 text-sm">No support messages found.</p>}
                      </div>
                   </div>

                   {/* Live Internal Chat Section */}
                   <div id="internal-chat-ui" className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
                       {/* Chat User List */}
                       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
                           <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                               <Users size={18} /> Active Users
                           </h3>
                           <div className="relative mb-3">
                               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                               <input className="w-full border rounded-lg pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white transition-colors outline-none" placeholder="Filter users..." />
                           </div>
                           <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar">
                               {users.filter(u => u.role !== 'admin').map(u => (
                                   <div 
                                       key={u.id} 
                                       onClick={() => setChatTarget(u)}
                                       className={`p-3 rounded-lg cursor-pointer transition border flex items-center gap-3 ${chatTarget?.id === u.id ? 'bg-primary-50 border-primary-200' : 'hover:bg-slate-50 border-transparent'}`}
                                   >
                                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${u.role === 'technician' ? 'bg-green-500' : 'bg-blue-500'}`}>
                                           {u.name.charAt(0)}
                                       </div>
                                       <div className="flex-grow min-w-0">
                                           <div className="flex justify-between items-center">
                                               <span className="font-medium text-sm text-slate-800 truncate">{u.name}</span>
                                           </div>
                                           <p className="text-xs text-slate-500 truncate">{u.role}</p>
                                       </div>
                                       {u.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full" title="Online"></div>}
                                   </div>
                               ))}
                           </div>
                       </div>

                       {/* Chat Window */}
                       <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
                           {chatTarget ? (
                               <>
                                   <div className="border-b pb-3 mb-3 flex justify-between items-center">
                                       <div className="flex items-center gap-3">
                                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${chatTarget.role === 'technician' ? 'bg-green-600' : 'bg-blue-600'}`}>
                                               {chatTarget.name.charAt(0)}
                                           </div>
                                           <div>
                                               <h3 className="font-bold text-slate-800">{chatTarget.name}</h3>
                                               <p className="text-xs text-slate-500">{chatTarget.email} • {chatTarget.role}</p>
                                           </div>
                                       </div>
                                       <span className="text-xs text-green-600 font-bold flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Live Connection
                                       </span>
                                   </div>
                                   
                                   <div className="flex-grow overflow-y-auto bg-slate-50 border rounded-lg p-4 mb-3 space-y-3 custom-scrollbar">
                                       {internalChats
                                           .filter(c => (c.senderId === 'admin' && c.receiverId === chatTarget.id) || (c.senderId === chatTarget.id && c.receiverId === 'admin'))
                                           .map(chat => (
                                               <div key={chat.id} className={`flex ${chat.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                   <div className={`max-w-[70%] p-3 rounded-xl text-sm shadow-sm ${chat.senderId === 'admin' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white border text-slate-800 rounded-bl-none'}`}>
                                                       <p>{chat.message}</p>
                                                       <p className={`text-[10px] mt-1 text-right ${chat.senderId === 'admin' ? 'text-primary-100' : 'text-slate-400'}`}>
                                                           {new Date(chat.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                       </p>
                                                   </div>
                                               </div>
                                           ))
                                       }
                                       {internalChats.filter(c => (c.senderId === 'admin' && c.receiverId === chatTarget.id) || (c.senderId === chatTarget.id && c.receiverId === 'admin')).length === 0 && (
                                           <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                               <MessageSquare size={32} className="mb-2 opacity-20" />
                                               <p className="text-sm">Start a conversation with {chatTarget.name}</p>
                                           </div>
                                       )}
                                       <div ref={chatEndRef} />
                                   </div>

                                   <div className="flex gap-2 relative">
                                       {showEmojiPicker && (
                                            <div className="absolute bottom-12 left-0 bg-white shadow-xl border border-gray-200 rounded-xl p-3 grid grid-cols-6 gap-2 z-10 w-64">
                                                {emojis.map(e => <button key={e} onClick={() => handleEmojiClick(e)} className="text-xl hover:bg-slate-100 p-1 rounded transition">{e}</button>)}
                                            </div>
                                       )}
                                       <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"><Smile size={20} /></button>
                                       <div className="flex-grow relative">
                                           <input 
                                               className="w-full border rounded-full pl-4 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white transition-all" 
                                               placeholder="Type message..." 
                                               value={internalMessage}
                                               onChange={e => setInternalMessage(e.target.value)}
                                               onKeyDown={e => e.key === 'Enter' && handleInternalChat()}
                                           />
                                           <button onClick={handleAttachClick} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><Paperclip size={16} /></button>
                                           <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                                       </div>
                                       <button onClick={handleInternalChat} className="bg-primary-600 text-white p-2.5 rounded-full hover:bg-primary-700 transition shadow-md flex-shrink-0"><Send size={18} /></button>
                                   </div>
                               </>
                           ) : (
                               <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200">
                                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                      <MessageSquare size={32} className="text-primary-300" />
                                   </div>
                                   <h3 className="text-lg font-bold text-slate-600">Internal Chat</h3>
                                   <p className="text-sm">Select a user from the sidebar to start chatting.</p>
                               </div>
                           )}
                       </div>
                   </div>
               </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-3">Order ID</th>
                        <th className="px-6 py-3">Customer</th>
                        <th className="px-6 py-3">Total</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.orderId} className="bg-white border-b hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900">{order.orderId}</td>
                          <td className="px-6 py-4">
                            <div>{order.customer.name}</div>
                            <div className="text-xs text-slate-400">{order.customer.email}</div>
                          </td>
                          <td className="px-6 py-4">GHS {order.total.toLocaleString()}</td>
                          <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                          <td className="px-6 py-4">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <select 
                              value={order.status} 
                              onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
               <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-4">
                          <h3 className="font-bold text-slate-800">Support Tickets</h3>
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{bookings.length} Total</span>
                      </div>
                      <Button onClick={() => setIsAddingBooking(true)} size="sm"><Plus size={16} className="mr-2"/> New Ticket</Button>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <table className="w-full text-sm text-left text-slate-500">
                          <thead className="bg-slate-50 text-xs text-slate-700 uppercase">
                              <tr>
                                  <th className="px-6 py-3">Ticket ID</th>
                                  <th className="px-6 py-3">Client</th>
                                  <th className="px-6 py-3">Service</th>
                                  <th className="px-6 py-3">Technician</th>
                                  <th className="px-6 py-3">Status</th>
                                  <th className="px-6 py-3 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody>
                              {bookings.map(booking => (
                                  <tr key={booking.id} className="border-b hover:bg-slate-50">
                                      <td className="px-6 py-4 font-mono text-xs">{booking.id}</td>
                                      <td className="px-6 py-4"><p className="font-bold text-slate-800">{booking.name}</p><p className="text-xs text-slate-400">{booking.phone}</p></td>
                                      <td className="px-6 py-4">{booking.serviceType}</td>
                                      <td className="px-6 py-4">
                                          <select className="bg-gray-50 border border-gray-200 text-xs rounded p-1 w-32" value={booking.technician || 'Unassigned'} onChange={(e) => handleAssignTechnician(booking.id, e.target.value)}>
                                              <option value="Unassigned">Unassigned</option>
                                              {technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                          </select>
                                      </td>
                                      <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                                      <td className="px-6 py-4 text-right">
                                          <button onClick={() => handleDeleteBooking(booking.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16}/></button>
                                      </td>
                                  </tr>
                              ))}
                              {bookings.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-400">No active tickets found.</td></tr>}
                          </tbody>
                      </table>
                  </div>
               </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                      <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-64" placeholder="Search products..." value={inventorySearch} onChange={e => setInventorySearch(e.target.value)} />
                      </div>
                      <Button onClick={() => setIsAddingProduct(true)} size="sm"><Plus size={16} className="mr-2"/> Add Product</Button>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <table className="w-full text-sm text-left text-slate-500">
                          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                              <tr>
                                  <th className="px-6 py-3">Product</th>
                                  <th className="px-6 py-3">Category</th>
                                  <th className="px-6 py-3">Price</th>
                                  <th className="px-6 py-3">Stock</th>
                                  <th className="px-6 py-3">Status</th>
                                  <th className="px-6 py-3 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody>
                              {products.filter(p => p.name.toLowerCase().includes(inventorySearch.toLowerCase())).map(product => (
                                  <tr key={product.id} className="bg-white border-b hover:bg-slate-50">
                                      <td className="px-6 py-4 flex items-center gap-3"><img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover bg-gray-100" /><div><div className="font-bold text-slate-900">{product.name}</div><div className="text-xs text-slate-400">{product.brand || 'Generic'}</div></div></td>
                                      <td className="px-6 py-4">{product.category}</td>
                                      <td className="px-6 py-4">GHS {product.price.toLocaleString()}</td>
                                      <td className="px-6 py-4"><span className={product.stock < 5 ? 'text-red-500 font-bold' : ''}>{product.stock}</span></td>
                                      <td className="px-6 py-4">
                                          <button onClick={() => handleToggleProductStatus(product)} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${product.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                              {product.isActive !== false ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                              {product.isActive !== false ? 'Active' : 'Hidden'}
                                          </button>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <div className="flex justify-end gap-2">
                                              <button onClick={() => setEditingProduct(product)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={16} /></button>
                                              <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <h3 className="font-bold text-lg mb-4">Manage Site Images</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                              <div><label className={labelStyle}>Select Section</label><select className={inputStyle} value={selectedImageKey} onChange={e => setSelectedImageKey(e.target.value)}>{MEDIA_LOCATIONS.map(loc => <option key={loc.key} value={loc.key}>{loc.label}</option>)}</select></div>
                              <div><label className={labelStyle}>Image URL</label><input className={inputStyle} value={currentImageUrl} onChange={e => setCurrentImageUrl(e.target.value)} placeholder="https://..." /></div>
                              <div><label className={labelStyle}>Or Upload New Image</label><input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" onChange={(e) => handleUploadImage(e)} /></div>
                              <Button onClick={handleSaveImages} disabled={uploading} className="w-full">{uploading ? 'Uploading...' : 'Save Image Update'}</Button>
                          </div>
                          <div className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 min-h-[300px] overflow-hidden relative">
                              {currentImageUrl ? <img src={currentImageUrl} alt="Preview" className="max-w-full max-h-full object-contain" /> : <div className="text-center text-slate-400"><Image size={48} className="mx-auto mb-2 opacity-50" /><p>No image selected</p></div>}
                              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Preview</div>
                          </div>
                      </div>
                  </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-6">
                  
                  {/* NEW: ADMIN CREDENTIALS SECTION */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800"><Key size={20} className="text-primary-600" /> Admin Credentials</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className={labelStyle}>Login Email</label>
                              <input 
                                  className={inputStyle} 
                                  value={adminProfile.email} 
                                  onChange={e => setAdminProfile({...adminProfile, email: e.target.value})} 
                                  placeholder="admin@buzzitech.com"
                              />
                              <p className="text-xs text-slate-400 mt-1">This email is used for logging into the admin panel.</p>
                          </div>
                          <div>
                              <label className={labelStyle}>New Password</label>
                              <input 
                                  type="password" 
                                  className={inputStyle} 
                                  value={adminProfile.password} 
                                  onChange={e => setAdminProfile({...adminProfile, password: e.target.value})} 
                                  placeholder="Leave empty to keep current"
                              />
                              <p className="text-xs text-slate-400 mt-1">Only enter a value if you want to change your password.</p>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Settings size={20} /> General Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className={labelStyle}>Support Email</label>
                              <input className={inputStyle} value={settings.adminEmail} onChange={e => setSettings({...settings, adminEmail: e.target.value})} />
                              <p className="text-xs text-slate-400 mt-1">Publicly displayed email for customers.</p>
                          </div>
                          <div><label className={labelStyle}>Logo URL</label><div className="flex gap-2"><input className={inputStyle} value={settings.logoUrl} onChange={e => setSettings({...settings, logoUrl: e.target.value})} /><label className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-2.5 rounded-lg border border-gray-300"><Upload size={20} className="text-slate-600" /><input type="file" className="hidden" onChange={handleUploadLogo} /></label></div></div>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CreditCard size={20} /> Payment Gateway</h3>
                      <div className="space-y-4">
                          <div><label className={labelStyle}>Provider</label><select className={inputStyle} value={settings.paymentGateway} onChange={e => setSettings({...settings, paymentGateway: e.target.value})}><option value="paystack">Paystack</option><option value="stripe">Stripe</option><option value="momo">Mobile Money (Manual)</option></select></div>
                          {settings.paymentGateway === 'paystack' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className={labelStyle}>Public Key</label><input className={inputStyle} value={settings.paystackPublicKey} onChange={e => setSettings({...settings, paystackPublicKey: e.target.value})} placeholder="pk_test_..." /></div><div><label className={labelStyle}>Secret Key</label><input type="password" className={inputStyle} value={settings.paystackSecretKey} onChange={e => setSettings({...settings, paystackSecretKey: e.target.value})} placeholder="sk_test_..." /></div></div>)}
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ShieldCheck size={20} /> Security Settings</h3>
                      <div className="space-y-6">
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                               <div className="flex items-center gap-3">
                                   <div className={`p-2 rounded-full ${currentUser2FA ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>{currentUser2FA ? <Lock size={18} /> : <Unlock size={18} />}</div>
                                   <div><p className="text-sm font-bold text-slate-800">My Account Two-Factor Authentication</p><p className="text-xs text-slate-500">Secure your admin login with email OTP.</p></div>
                               </div>
                               <button onClick={handleToggleAdmin2FA} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${currentUser2FA ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-600 text-white hover:bg-green-700'}`}>{currentUser2FA ? 'Disable 2FA' : 'Enable 2FA'}</button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                               <div className="flex items-center gap-3">
                                   <div className={`p-2 rounded-full ${settings.twoFactorEnforced ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}><ShieldCheck size={18} /></div>
                                   <div><p className="text-sm font-bold text-slate-800">System-Wide 2FA Enforcement</p><p className="text-xs text-slate-500">Force all users (including technicians) to use 2FA.</p></div>
                               </div>
                               <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                   <input type="checkbox" name="toggleEnforce" id="toggleEnforce" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300" style={{ right: settings.twoFactorEnforced ? '0' : '50%', borderColor: settings.twoFactorEnforced ? '#3b82f6' : '#cbd5e1' }} checked={settings.twoFactorEnforced} onChange={() => setSettings({...settings, twoFactorEnforced: !settings.twoFactorEnforced})} />
                                   <label htmlFor="toggleEnforce" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.twoFactorEnforced ? 'bg-blue-500' : 'bg-slate-300'}`}></label>
                               </div>
                          </div>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Smartphone size={20} /> SMS Notifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className={labelStyle}>Provider</label><select className={inputStyle} value={settings.smsProvider} onChange={e => setSettings({...settings, smsProvider: e.target.value})}><option value="AfricaTalking">Africa's Talking</option><option value="Twilio">Twilio</option><option value="Arkesel">Arkesel</option><option value="console_log">Console Log (Dev)</option></select></div>
                          <div><label className={labelStyle}>Sender ID</label><input className={inputStyle} value={settings.smsSenderId} onChange={e => setSettings({...settings, smsSenderId: e.target.value})} placeholder="BUZZITECH" /></div>
                          <div className="col-span-2"><label className={labelStyle}>API Key</label><input type="password" className={inputStyle} value={settings.smsApiKey} onChange={e => setSettings({...settings, smsApiKey: e.target.value})} /></div>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Webhook size={20} /> Automation & Integrations</h3>
                      <div className="space-y-4">
                          <div><label className={labelStyle}>Main Webhook URL (n8n)</label><input className={inputStyle} value={settings.n8nWebhook} onChange={e => setSettings({...settings, n8nWebhook: e.target.value})} placeholder="https://your-n8n-instance.com/webhook/..." /></div>
                          <div><label className={labelStyle}>Formspree Endpoint</label><input className={inputStyle} value={settings.formspreeUrl} onChange={e => setSettings({...settings, formspreeUrl: e.target.value})} placeholder="https://formspree.io/f/..." /></div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className={labelStyle}>Chatbot Webhook</label><input className={inputStyle} value={settings.n8nChatWebhook} onChange={e => setSettings({...settings, n8nChatWebhook: e.target.value})} /></div><div><label className={labelStyle}>Quote Generator Webhook</label><input className={inputStyle} value={settings.n8nQuoteWebhook} onChange={e => setSettings({...settings, n8nQuoteWebhook: e.target.value})} /></div></div>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Mail size={20} /> Email (SMTP)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className={labelStyle}>SMTP Host</label><input className={inputStyle} value={settings.smtpHost} onChange={e => setSettings({...settings, smtpHost: e.target.value})} /></div>
                          <div><label className={labelStyle}>SMTP User</label><input className={inputStyle} value={settings.smtpUser} onChange={e => setSettings({...settings, smtpUser: e.target.value})} /></div>
                          <div className="col-span-2"><label className={labelStyle}>SMTP Password</label><input type="password" className={inputStyle} value={settings.smtpPass} onChange={e => setSettings({...settings, smtpPass: e.target.value})} /></div>
                      </div>
                  </div>
                  <div className="flex justify-end"><Button onClick={handleSaveSettings} className="px-8">Save Configuration</Button></div>
              </div>
            )}

            {/* ... Other Tabs (Communication, Chatbot, Users, Meetings, Quotes) ... */}
            
            {/* Same as previous file content for other tabs */}
            {/* communication */}
            {activeTab === 'communication' && (
              <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Megaphone className="text-primary-600" /> Bulk Messaging Center</h3>
                  <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className={labelStyle}>Channel</label>
                              <div className="flex gap-4 mt-2">
                                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="channel" checked={bulkType === 'email'} onChange={() => setBulkType('email')} className="text-primary-600 focus:ring-primary-500" /><span>Email Broadcast</span></label>
                                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="channel" checked={bulkType === 'sms'} onChange={() => setBulkType('sms')} className="text-primary-600 focus:ring-primary-500" /><span>SMS Blast</span></label>
                              </div>
                          </div>
                          <div><label className={labelStyle}>Target Audience</label><select className={inputStyle} value={bulkRecipients} onChange={e => setBulkRecipients(e.target.value)}><option value="all">All Users</option><option value="customer">Customers Only</option><option value="technician">Technicians Only</option></select></div>
                      </div>
                      <div><label className={labelStyle}>Subject Line</label><input className={inputStyle} value={bulkSubject} onChange={e => setBulkSubject(e.target.value)} placeholder="Important Announcement..." /></div>
                      <div><label className={labelStyle}>Message Content</label><textarea className={inputStyle} rows={6} value={bulkMessage} onChange={e => setBulkMessage(e.target.value)} placeholder="Type your message here..."></textarea><p className="text-xs text-slate-400 mt-1 text-right">0 / 160 characters (for SMS)</p></div>
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-sm text-slate-500">Estimated Recipients: <span className="font-bold text-slate-800">{bulkRecipients === 'all' ? users.length : bulkRecipients === 'technician' ? technicians.length : users.length - technicians.length}</span></span>
                          <Button onClick={handleSendBulkMessage}>Send Broadcast</Button>
                      </div>
                  </div>
              </div>
            )}

            {/* chatbot */}
            {activeTab === 'chatbot' && (
              <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex gap-4">
                          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold border border-blue-100">Total Entries: {knowledgeBase.length}</div>
                          <div className="relative"><input type="file" id="kb-upload" className="hidden" accept=".json,.pdf,.docx" onChange={handleKBUpload} /><label htmlFor="kb-upload" className="cursor-pointer bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 flex items-center gap-2">{uploading ? <RefreshCw size={14} className="animate-spin" /> : <UploadCloud size={16} />} Upload JSON/PDF</label></div>
                      </div>
                      <Button onClick={() => setIsAddingKB(true)} size="sm"><Plus size={16} className="mr-2"/> Add Entry</Button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <div className="p-4 border-b border-gray-100 font-bold text-slate-700">Knowledge Base</div>
                          <div className="max-h-[600px] overflow-y-auto">
                              <table className="w-full text-sm text-left text-slate-500">
                                  <thead className="bg-slate-50 text-xs text-slate-700 uppercase"><tr><th className="px-4 py-3">Category</th><th className="px-4 py-3">Keywords</th><th className="px-4 py-3">Answer Preview</th><th className="px-4 py-3">Action</th></tr></thead>
                                  <tbody>
                                      {knowledgeBase.map(entry => (
                                          <tr key={entry.id} className="border-b hover:bg-slate-50"><td className="px-4 py-3 font-bold text-slate-800">{entry.category}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-1">{entry.keywords.slice(0, 3).map((k, i) => <span key={i} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">{k}</span>)}{entry.keywords.length > 3 && <span className="text-[10px] text-gray-400">+{entry.keywords.length - 3}</span>}</div></td><td className="px-4 py-3 truncate max-w-[200px]" title={entry.answer}>{entry.answer}</td><td className="px-4 py-3 text-right"><button onClick={() => handleDeleteKBEntry(entry.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={14}/></button></td></tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                      {isAddingKB && (
                          <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-6 h-fit">
                              <h3 className="font-bold text-lg mb-4 text-blue-900">New Response</h3>
                              <div className="space-y-4">
                                  <div><label className={labelStyle}>Category</label><select className={inputStyle} value={newKBEntry.category} onChange={e => setNewKBEntry({...newKBEntry, category: e.target.value})}><option value="general">General</option><option value="pricing">Pricing</option><option value="troubleshooting">Troubleshooting</option><option value="service">Service Info</option></select></div>
                                  <div><label className={labelStyle}>Keywords (Comma Separated)</label><input className={inputStyle} value={kbKeywordsInput} onChange={e => setKbKeywordsInput(e.target.value)} placeholder="price, cost, how much" /></div>
                                  <div><label className={labelStyle}>Answer / Response</label><textarea className={inputStyle} rows={5} value={newKBEntry.answer} onChange={e => setNewKBEntry({...newKBEntry, answer: e.target.value})} placeholder="The price is GHS..."></textarea></div>
                                  <div className="flex gap-2"><Button onClick={handleAddKBEntry} className="flex-1">Save Entry</Button><button onClick={() => setIsAddingKB(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button></div>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
            )}

            {/* users */}
            {activeTab === 'users' && (
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 flex justify-between items-center border-b">
                     <h3 className="font-bold text-slate-800">User Management</h3>
                     <div className="flex gap-2">
                         <Button size="sm" variant="outline" onClick={() => setIsManagingRoles(true)}>Manage Roles</Button>
                         <Button size="sm" onClick={() => { setNewUserData({ name: '', email: '', role: 'customer', password: '' }); setIsAddingUser(true); }}>Add Customer</Button>
                         <Button size="sm" onClick={() => setIsAddingTech(true)}>Add Technician</Button>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-slate-500">
                        <thead className="bg-slate-50 text-xs text-slate-700 uppercase"><tr><th className="px-6 py-3">User ID</th><th className="px-6 py-3">Name</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">Role</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Action</th></tr></thead>
                        <tbody>
                           {users.map(user => (
                              <tr key={user.id} className="border-b">
                                 <td className="px-6 py-4 font-mono text-xs text-slate-400">{user.id || user.technicianId || 'N/A'}</td>
                                 <td className="px-6 py-4 font-bold">{user.name}</td>
                                 <td className="px-6 py-4">{user.email}</td>
                                 <td className="px-6 py-4 capitalize">{user.role}</td>
                                 <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${user.isApproved && user.status !== 'Suspended' ? 'bg-green-100 text-green-700' : (user.status === 'Suspended' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}`}>{user.status === 'Suspended' ? 'Suspended' : (user.isApproved ? 'Active' : 'Pending')}</span></td>
                                 <td className="px-6 py-4 flex items-center gap-2">
                                    {!user.isApproved && <button onClick={() => handleApproveUser(user.id)} className="text-blue-600 text-xs font-bold hover:underline">Approve</button>}
                                    {user.isApproved && (
                                        <button onClick={() => handleToggleUserStatus(user.id, user.status || 'Active')} className={`text-xs font-bold hover:underline ${user.status === 'Suspended' ? 'text-green-600' : 'text-red-500'}`}>
                                            {user.status === 'Suspended' ? 'Enable' : 'Disable'}
                                        </button>
                                    )}
                                    <select className="bg-gray-50 border border-gray-200 text-xs rounded p-1" value={user.role} onChange={(e) => handleAssignRole(user.id, e.target.value)}>
                                        <option value="customer">Customer</option>
                                        <option value="technician">Technician</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {/* meetings */}
            {activeTab === 'meetings' && (
               <div className="space-y-6">
                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex justify-between mb-4">
                         <h3 className="font-bold text-slate-800">Scheduled Meetings</h3>
                         <Button size="sm" onClick={() => setIsAddingMeeting(true)}>Schedule Meeting</Button>
                      </div>
                      <div className="space-y-3">
                         {meetings.map(meeting => (
                            <div key={meeting.id} className="flex justify-between items-center border p-3 rounded-lg">
                               <div><p className="font-bold">{meeting.title}</p><p className="text-xs text-slate-500">{meeting.date} at {meeting.time} ({meeting.platform})</p></div>
                               <div className="flex gap-2"><a href={meeting.link} target="_blank" rel="noreferrer" className="text-blue-600 text-xs hover:underline">Join Link</a><button onClick={() => handleDeleteMeeting(meeting.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></div>
                            </div>
                         ))}
                         {meetings.length === 0 && <p className="text-slate-400 text-sm">No meetings scheduled.</p>}
                      </div>
                   </div>
                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex justify-between mb-4"><h3 className="font-bold text-slate-800 flex items-center gap-2"><Monitor size={18} className="text-primary-600" /> Remote Support Tools</h3><Button size="sm" variant="outline" onClick={() => setShowRemoteModal(true)}>Launch Session</Button></div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between"><span className="font-medium text-sm">AnyDesk</span><button onClick={() => handleLaunchRemote('anydesk')} className="text-xs text-blue-600 hover:underline">Open</button></div>
                          <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between"><span className="font-medium text-sm">TeamViewer</span><button onClick={() => handleLaunchRemote('teamviewer')} className="text-xs text-blue-600 hover:underline">Open</button></div>
                          <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between"><span className="font-medium text-sm">RustDesk</span><button onClick={() => handleLaunchRemote('rustdesk')} className="text-xs text-blue-600 hover:underline">Open</button></div>
                      </div>
                   </div>
               </div>
            )}

            {/* quotes */}
            {activeTab === 'quotes' && (
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between mb-4"><h3 className="font-bold text-slate-800">Generated Quotes</h3><Button size="sm" onClick={() => setIsCreatingQuote(true)}>Create Quote</Button></div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-slate-500">
                        <thead className="bg-slate-50 text-xs text-slate-700 uppercase"><tr><th className="px-6 py-3">Client</th><th className="px-6 py-3">Service</th><th className="px-6 py-3">Total</th><th className="px-6 py-3">Date</th></tr></thead>
                        <tbody>{quotes.map((quote, idx) => (<tr key={idx} className="border-b"><td className="px-6 py-4 font-bold">{quote.name}</td><td className="px-6 py-4">{quote.serviceType}</td><td className="px-6 py-4">GHS {quote.grandTotal.toLocaleString()}</td><td className="px-6 py-4">{new Date(quote.date).toLocaleDateString()}</td></tr>))}</tbody>
                     </table>
                  </div>
               </div>
            )}

          </div>
        )}
      </main>

      {/* MODALS (Including new Manage Roles Modal) */}
      {showRemoteModal && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                  <h3 className="text-xl font-bold mb-4 text-slate-900">Remote Session</h3>
                  <input className="w-full border rounded px-3 py-2 mb-4" placeholder="Session ID" value={remoteId} onChange={e => setRemoteId(e.target.value)} />
                  <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => handleLaunchRemote('anydesk')} className="bg-red-500 text-white py-2 rounded text-xs font-bold">AnyDesk</button>
                      <button onClick={() => handleLaunchRemote('teamviewer')} className="bg-blue-600 text-white py-2 rounded text-xs font-bold">TeamViewer</button>
                      <button onClick={() => handleLaunchRemote('rustdesk')} className="bg-slate-800 text-white py-2 rounded text-xs font-bold">RustDesk</button>
                  </div>
                  <button onClick={() => setShowRemoteModal(false)} className="w-full mt-4 text-slate-500 text-sm hover:text-slate-700">Cancel</button>
              </div>
          </div>
      )}

      {isManagingRoles && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <h3 className="font-bold text-lg mb-4 text-slate-900">Manage Definitions</h3>
                  <div className="space-y-4 mb-6">
                      <div>
                          <label className={labelStyle}>Technician Roles</label>
                          <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-50 rounded border border-gray-100 max-h-24 overflow-y-auto">
                              {techRoles.map((r, i) => <span key={i} className="bg-white border text-xs px-2 py-1 rounded shadow-sm">{r}</span>)}
                          </div>
                          <div className="flex gap-2">
                              <input className={inputStyle} placeholder="Add Role..." value={newRoleInput} onChange={e => setNewRoleInput(e.target.value)} />
                              <button onClick={handleAddRole} className="bg-primary-600 text-white px-3 rounded-lg"><Plus size={18} /></button>
                          </div>
                      </div>
                      <div>
                          <label className={labelStyle}>Departments</label>
                          <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-50 rounded border border-gray-100 max-h-24 overflow-y-auto">
                              {departments.map((d, i) => <span key={i} className="bg-white border text-xs px-2 py-1 rounded shadow-sm">{d}</span>)}
                          </div>
                          <div className="flex gap-2">
                              <input className={inputStyle} placeholder="Add Department..." value={newDeptInput} onChange={e => setNewDeptInput(e.target.value)} />
                              <button onClick={handleAddDept} className="bg-primary-600 text-white px-3 rounded-lg"><Plus size={18} /></button>
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end">
                      <Button onClick={() => setIsManagingRoles(false)}>Close Manager</Button>
                  </div>
              </div>
          </div>
      )}

      {/* TECHNICIAN MODAL */}
      {isAddingTech && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <h3 className="font-bold text-lg mb-4">Add New Technician</h3>
                  <div className="space-y-3">
                      <input className={inputStyle} placeholder="Full Name" value={newTechData.name} onChange={e => setNewTechData({...newTechData, name: e.target.value})} />
                      <input className={inputStyle} placeholder="Email" type="email" value={newTechData.email} onChange={e => setNewTechData({...newTechData, email: e.target.value})} />
                      <input className={inputStyle} placeholder="Phone" value={newTechData.phone} onChange={e => setNewTechData({...newTechData, phone: e.target.value})} />
                      <input className={inputStyle} placeholder="Login Password" type="password" value={newTechData.password} onChange={e => setNewTechData({...newTechData, password: e.target.value})} />
                      
                      <div className="grid grid-cols-2 gap-3">
                          <select className={inputStyle} value={newTechData.department} onChange={e => setNewTechData({...newTechData, department: e.target.value})}>
                              {departments.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <select className={inputStyle} value={newTechData.role} onChange={e => setNewTechData({...newTechData, role: e.target.value})}>
                              {techRoles.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                      </div>

                      <div className="flex gap-2 mt-4">
                          <Button onClick={handleAddTechnician} className="flex-1">Save Technician</Button>
                          <button onClick={() => setIsAddingTech(false)} className="px-4 border rounded hover:bg-slate-50">Cancel</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* USER MODAL */}
      {isAddingUser && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <h3 className="font-bold text-lg mb-4">Add New Customer</h3>
                  <div className="space-y-3">
                      <input className={inputStyle} placeholder="Full Name" value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} />
                      <input className={inputStyle} placeholder="Email" type="email" value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} />
                      <input className={inputStyle} placeholder="Password" type="password" value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})} />
                      <input className={`${inputStyle} bg-gray-100 text-gray-500 cursor-not-allowed`} value="Customer" readOnly />
                      
                      <div className="flex gap-2 mt-4">
                          <Button onClick={handleCreateUser} className="flex-1">Create Customer</Button>
                          <button onClick={() => setIsAddingUser(false)} className="px-4 border rounded hover:bg-slate-50">Cancel</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* ADD MEETING MODAL */}
      {isAddingMeeting && (
         <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
               <h3 className="font-bold text-lg mb-4 text-slate-900">Schedule New Meeting</h3>
               <div className="space-y-3">
                  <div><label className={labelStyle}>Meeting Title</label><input className={inputStyle} placeholder="e.g. Project Kickoff" value={newMeetingData.title} onChange={e => setNewMeetingData({...newMeetingData, title: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className={labelStyle}>Date</label><input className={inputStyle} type="date" value={newMeetingData.date} onChange={e => setNewMeetingData({...newMeetingData, date: e.target.value})} /></div><div><label className={labelStyle}>Time</label><input className={inputStyle} type="time" value={newMeetingData.time} onChange={e => setNewMeetingData({...newMeetingData, time: e.target.value})} /></div></div>
                  <div><label className={labelStyle}>Platform</label><select className={inputStyle} value={newMeetingData.platform} onChange={e => setNewMeetingData({...newMeetingData, platform: e.target.value})}><option>Zoom</option><option>Google Meet</option><option>Teams</option></select></div>
                  <div><label className={labelStyle}>Attendees (Emails)</label><input className={inputStyle} placeholder="comma separated..." value={newMeetingData.attendees} onChange={e => setNewMeetingData({...newMeetingData, attendees: e.target.value})} /></div>
                  <div className="flex gap-2 mt-4 pt-2"><Button onClick={handleScheduleMeeting} className="flex-1">Schedule & Send Invites</Button><button onClick={() => setIsAddingMeeting(false)} className="px-4 border rounded hover:bg-slate-50 text-slate-600">Cancel</button></div>
               </div>
            </div>
         </div>
      )}

      {/* TICKET / BOOKING MODAL */}
      {isAddingBooking && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <h3 className="font-bold text-lg mb-4">Create New Ticket</h3>
                  <div className="space-y-3">
                      <div><label className={labelStyle}>Select User</label><select className={inputStyle} onChange={(e) => handleUserSelectForTicket(e.target.value)}><option value="new">-- New User --</option>{users.filter(u => u.role === 'customer').map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}</select></div>
                      <input className={inputStyle} placeholder="Client Name" value={newBookingData.name} onChange={e => setNewBookingData({...newBookingData, name: e.target.value})} />
                      <input className={inputStyle} placeholder="Client Phone" value={newBookingData.phone} onChange={e => setNewBookingData({...newBookingData, phone: e.target.value})} />
                      <input className={inputStyle} placeholder="Client Email" value={newBookingData.email} onChange={e => setNewBookingData({...newBookingData, email: e.target.value})} />
                      <select className={inputStyle} value={newBookingData.serviceType} onChange={e => setNewBookingData({...newBookingData, serviceType: e.target.value})}><option value="">Select Service...</option><option value="CCTV Installation">CCTV Installation</option><option value="Starlink Setup">Starlink Setup</option><option value="Networking">Networking</option><option value="Computer Repair">Computer Repair</option><option value="Other">Other</option></select>
                      <div className="grid grid-cols-2 gap-3"><input className={inputStyle} type="date" value={newBookingData.date} onChange={e => setNewBookingData({...newBookingData, date: e.target.value})} /><input className={inputStyle} type="time" value={newBookingData.time} onChange={e => setNewBookingData({...newBookingData, time: e.target.value})} /></div>
                      <select className={inputStyle} value={newBookingData.technician} onChange={e => setNewBookingData({...newBookingData, technician: e.target.value})}><option value="">Assign Technician (Optional)</option>{technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</select>
                      <div className="flex gap-2 mt-4"><Button onClick={handleCreateBooking} className="flex-1" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Ticket'}</Button><button onClick={() => setIsAddingBooking(false)} className="px-4 border rounded hover:bg-slate-50">Cancel</button></div>
                  </div>
              </div>
          </div>
      )}

      {/* QUOTE GENERATOR MODAL */}
      {isCreatingQuote && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <h3 className="font-bold text-lg mb-4">Generate New Quote</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4"><input className={inputStyle} placeholder="Client Name" value={newQuoteData.name} onChange={e => setNewQuoteData({...newQuoteData, name: e.target.value})} /><input className={inputStyle} placeholder="Client Email" value={newQuoteData.email} onChange={e => setNewQuoteData({...newQuoteData, email: e.target.value})} /><input className={inputStyle} placeholder="Client Phone" value={newQuoteData.phone} onChange={e => setNewQuoteData({...newQuoteData, phone: e.target.value})} /><select className={inputStyle} value={newQuoteData.serviceType} onChange={e => setNewQuoteData({...newQuoteData, serviceType: e.target.value})}><option value="General">General Quote</option>{PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200"><h4 className="font-bold text-sm text-slate-700 mb-2">Add Line Item</h4><div className="grid grid-cols-4 gap-2 mb-2"><input className={`${inputStyle} col-span-2`} placeholder="Item Description" value={newQuoteItem.name} onChange={e => setNewQuoteItem({...newQuoteItem, name: e.target.value})} /><input className={inputStyle} type="number" placeholder="Price" value={newQuoteItem.price} onChange={e => setNewQuoteItem({...newQuoteItem, price: Number(e.target.value)})} /><input className={inputStyle} type="number" placeholder="Qty" value={newQuoteItem.quantity} onChange={e => setNewQuoteItem({...newQuoteItem, quantity: Number(e.target.value)})} /></div><button onClick={handleAddQuoteItem} className="w-full bg-slate-200 text-slate-700 py-2 rounded text-sm font-bold hover:bg-slate-300">+ Add Item</button></div>
                  <div className="mb-4"><table className="w-full text-sm"><thead><tr className="text-left text-slate-500"><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>{(newQuoteData.items || []).map((item, idx) => (<tr key={idx} className="border-b"><td className="py-2">{item.name}</td><td>{item.quantity}</td><td>{item.price}</td><td>{(item.price * item.quantity).toLocaleString()}</td></tr>))}</tbody></table><div className="text-right font-bold text-lg mt-2">Total: GHS {(newQuoteData.grandTotal || 0).toLocaleString()}</div></div>
                  <div className="flex gap-2"><Button onClick={handleGenerateAdminQuote} className="flex-1">Generate PDF & Save</Button><button onClick={() => setIsCreatingQuote(false)} className="px-4 border rounded hover:bg-slate-50">Cancel</button></div>
              </div>
          </div>
      )}

      {/* PRODUCT MODAL */}
      {(isAddingProduct || editingProduct) && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <h3 className="font-bold text-lg mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3"><input className={inputStyle} placeholder="Product Name" value={editingProduct ? editingProduct.name : newProduct.name} onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} /><input className={inputStyle} placeholder="Brand" value={editingProduct ? editingProduct.brand : newProduct.brand} onChange={e => editingProduct ? setEditingProduct({...editingProduct, brand: e.target.value}) : setNewProduct({...newProduct, brand: e.target.value})} /></div>
                      <div className="grid grid-cols-3 gap-3"><input className={inputStyle} placeholder="Price" type="number" value={editingProduct ? editingProduct.price : newProduct.price} onChange={e => editingProduct ? setEditingProduct({...editingProduct, price: Number(e.target.value)}) : setNewProduct({...newProduct, price: Number(e.target.value)})} /><input className={inputStyle} placeholder="Orig Price" type="number" value={editingProduct ? editingProduct.originalPrice : newProduct.originalPrice} onChange={e => editingProduct ? setEditingProduct({...editingProduct, originalPrice: Number(e.target.value)}) : setNewProduct({...newProduct, originalPrice: Number(e.target.value)})} /><input className={inputStyle} placeholder="Stock" type="number" value={editingProduct ? editingProduct.stock : newProduct.stock} onChange={e => editingProduct ? setEditingProduct({...editingProduct, stock: Number(e.target.value)}) : setNewProduct({...newProduct, stock: Number(e.target.value)})} /></div>
                      <select className={inputStyle} value={editingProduct ? editingProduct.category : newProduct.category} onChange={e => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})}>{PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                      <textarea className={inputStyle} rows={3} placeholder="Description" value={editingProduct ? editingProduct.description : newProduct.description} onChange={e => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})}></textarea>
                      <div><label className={labelStyle}>Product Image</label><div className="flex gap-2"><input className={inputStyle} placeholder="Image URL" value={editingProduct ? editingProduct.image : newProduct.image} onChange={e => editingProduct ? setEditingProduct({...editingProduct, image: e.target.value}) : setNewProduct({...newProduct, image: e.target.value})} /><label className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-2.5 rounded-lg border border-gray-300"><Upload size={20} className="text-slate-600" /><input type="file" className="hidden" onChange={(e) => handleProductImageUpload(e, !!editingProduct)} /></label></div></div>
                      <div className="flex gap-2 mt-4"><Button onClick={editingProduct ? handleSaveProduct : handleCreateProduct} className="flex-1">{editingProduct ? 'Save Changes' : 'Create Product'}</Button><button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="px-4 border rounded hover:bg-slate-50">Cancel</button></div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default AdminDashboard;