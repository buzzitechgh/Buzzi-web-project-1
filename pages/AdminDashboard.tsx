import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, ShoppingBag, Package, RefreshCw, LayoutDashboard, 
  Calendar, MessageSquare, FileText, TrendingUp, Users, DollarSign,
  Phone, Mail, Clock, CheckCircle, AlertCircle, Edit2, Image, Save, X, Ticket,
  Settings, CreditCard, Webhook, Server, Plus, Star, Link as LinkIcon, Upload, UserPlus, Truck, Monitor, Video, ShieldCheck, Trash2,
  Bot, FileJson, UploadCloud, Smartphone, Radio, Activity, Eye, File, Megaphone, UserCog, MoreVertical, Briefcase, Download, Building, ArrowRight
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
  
  // Edit States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', price: 0, stock: 0, category: 'General', description: '', image: 'https://via.placeholder.com/300', features: [] });

  // Chatbot Edit States
  const [isAddingKB, setIsAddingKB] = useState(false);
  const [newKBEntry, setNewKBEntry] = useState<Partial<KnowledgeEntry>>({ category: 'general', keywords: [], answer: '' });
  const [kbKeywordsInput, setKbKeywordsInput] = useState("");

  // Communication States
  const [replyingMessage, setReplyingMessage] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [internalMessage, setInternalMessage] = useState("");
  const [chatTarget, setChatTarget] = useState<User | null>(null); // For admin 1-on-1 chat
  
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
  const [newUserData, setNewUserData] = useState({ name: '', email: '', role: 'customer', password: '' });

  // Technician Edit State
  const [newTechData, setNewTechData] = useState<Partial<Technician>>({ name: '', email: '', role: 'Network Engineer', department: 'Infrastructure', rating: 5, feedback: '' });
  const [isAddingTech, setIsAddingTech] = useState(false);
  const [assigningBookingId, setAssigningBookingId] = useState<string | null>(null);

  // New Booking State
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [newBookingData, setNewBookingData] = useState({ name: '', phone: '', email: '', serviceType: '', date: '', time: '', technician: '' });
  const [bookingFilter, setBookingFilter] = useState('All');

  // Admin Quote Generator State
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [newQuoteData, setNewQuoteData] = useState<Partial<QuoteFormData>>({ name: '', email: '', phone: '', serviceType: 'General', grandTotal: 0, items: [] });
  const [newQuoteItem, setNewQuoteItem] = useState<Partial<QuoteItem>>({ name: '', price: 0, quantity: 1, category: 'Hardware' });

  // Site Media State
  const [siteImages, setSiteImages] = useState<any>({});
  const [selectedImageKey, setSelectedImageKey] = useState("hero_bg");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
      adminEmail: 'admin@buzzitech.com',
      logoUrl: '',
      n8nWebhook: '',
      n8nChatWebhook: '',
      n8nQuoteWebhook: '',
      n8nCallbackWebhook: '', // Added callback webhook
      smsProvider: 'AfricaTalking',
      smsApiKey: '',
      smsSenderId: '',
      smtpHost: 'smtp.gmail.com',
      smtpUser: '',
      smtpPass: '',
  });
  
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

  const TECH_ROLES = ["Network Engineer", "CCTV Specialist", "Software Support", "Field Technician", "System Administrator"];

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

  const fetchData = async (authToken: string) => {
    setLoading(true);
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
        api.getLoginLogs(authToken)
      ]);
      
      setStats(statsData);
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
      
      if(settingsData && Object.keys(settingsData).length > 0) {
          setSettings(prev => ({...prev, ...settingsData}));
      }
      if(imagesData && Object.keys(imagesData).length > 0) {
          setSiteImages(imagesData);
          if (imagesData["hero_bg"]) setCurrentImageUrl(imagesData["hero_bg"]);
      }
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

  const handleAssignTechnician = async (bookingId: string, technician: string) => {
     try {
       await api.assignTechnician(bookingId, technician, token);
       setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, technician: technician === 'Unassigned' ? null : technician, taskStatus: 'Assigned', status: 'In Progress' } : b));
       setAssigningBookingId(null);
     } catch (e) {
       alert("Failed to assign technician");
     }
  };

  const handleCreateBooking = async () => {
      if(!newBookingData.name || !newBookingData.serviceType) return;
      try {
          const result = await api.createAdminBooking(newBookingData, token);
          if (result.booking) setBookings(prev => [result.booking, ...prev]);
          setNewBookingData({ name: '', phone: '', email: '', serviceType: '', date: '', time: '', technician: '' });
          setIsAddingBooking(false);
      } catch (e) {
          alert("Failed to create booking");
      }
  };

  const handleAddTechnician = async () => {
      if(!newTechData.name?.trim() || !newTechData.email?.trim()) return;
      try {
          const result = await api.addTechnician(newTechData, token);
          if (result.technicians) setTechnicians(result.technicians);
          setNewTechData({ name: '', email: '', role: 'Network Engineer', department: 'Infrastructure', rating: 5, feedback: '' });
          setIsAddingTech(false);
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

  // --- ADMIN QUOTE ACTIONS ---
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
      const updatedItems = [...(newQuoteData.items || []), item];
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
          generateInvoice(fullQuote); // Download PDF locally for admin
          setQuotes(prev => [fullQuote, ...prev]);
          setIsCreatingQuote(false);
          setNewQuoteData({ name: '', email: '', phone: '', serviceType: 'General', grandTotal: 0, items: [] });
          alert("Quote Generated & Invoice Downloaded");
      } catch (e) {
          alert("Failed to generate quote");
      }
  };

  // --- KNOWLEDGE BASE ACTIONS ---
  const handleAddKBEntry = async () => {
      if (!newKBEntry.answer || !kbKeywordsInput) return;
      
      const keywords = kbKeywordsInput.split(',').map(k => k.trim()).filter(k => k.length > 0);
      try {
          const result = await api.addKnowledgeEntry({
              ...newKBEntry,
              keywords
          }, token);
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
      
      // Check extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['json', 'pdf', 'docx'].includes(ext || '')) {
          alert("Only JSON, PDF, and DOCX files are allowed.");
          return;
      }

      setUploading(true);
      try {
          const result = await api.uploadKnowledgeBase(file, token);
          alert(`Successfully uploaded/extracted ${result.count} entries!`);
          // Refresh list
          const kbData = await api.getKnowledgeBase(token);
          setKnowledgeBase(kbData);
      } catch (error: any) {
          alert("Upload failed: " + error.message);
      } finally {
          setUploading(false);
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

  const handleInternalChat = async () => {
      if (!internalMessage.trim() || !chatTarget) return;
      try {
          const result = await api.sendInternalMessage('admin', 'Admin', internalMessage, chatTarget.id, 'admin');
          setInternalChats(prev => [...prev, result.message]);
          setInternalMessage("");
      } catch (e) {
          alert("Failed to send message");
      }
  };

  const handleLaunchRemote = (tool: 'anydesk' | 'teamviewer') => {
      if (!remoteId) {
          alert("Please enter a Session ID");
          return;
      }
      const protocol = tool === 'anydesk' ? `anydesk:${remoteId}` : `teamviewer8://${remoteId}`;
      window.location.href = protocol;
      setShowRemoteModal(false);
      setRemoteId("");
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
      try {
          await api.updateOrderStatus(orderId, status, token);
          setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o));
      } catch (error) {
          alert("Failed to update status");
      }
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

  const handleCreateProduct = async () => {
      try {
          const productToSave = { ...newProduct, id: `prod-${Date.now()}` } as Product;
          await api.addProduct(productToSave, token);
          setProducts(prev => [...prev, productToSave]);
          setIsAddingProduct(false);
          setNewProduct({ name: '', price: 0, stock: 0, category: 'General', description: '', image: 'https://via.placeholder.com/300', features: [] });
          alert("Product created successfully");
      } catch (e) {
          alert("Failed to create product");
      }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, onSuccess?: (url: string) => void) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setUploading(true);
      try {
          const url = await api.uploadImage(file);
          
          if (onSuccess) {
              onSuccess(url);
          } else {
              // Default for Media Manager tab
              setCurrentImageUrl(url);
              setSiteImages((prev: any) => ({ ...prev, [selectedImageKey]: url }));
          }
      } catch (error) {
          alert("Failed to upload image");
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
      } catch(e) {
          alert("Logo upload failed");
      } finally {
          setUploading(false);
      }
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

  const handleSaveImages = async () => {
      // Ensure the currently edited field is saved to state object before submitting
      const updatedImages = { ...siteImages, [selectedImageKey]: currentImageUrl };
      try {
        await api.updateSiteImages(updatedImages, token);
        setSiteImages(updatedImages);
        alert("Site images updated successfully!");
      } catch (e) {
        alert("Failed to update images");
      }
  };

  const handleSaveSettings = async () => {
      try {
          await api.saveSettings(settings, token);
          alert("System settings saved successfully.");
      } catch (e) {
          alert("Failed to save settings.");
      }
  };

  const handleSendBulkMessage = async () => {
      if (!bulkMessage) return;
      
      // Filter recipients
      let targetEmails = users.map(u => u.email);
      if (bulkRecipients === 'technician') targetEmails = users.filter(u => u.role === 'technician').map(u => u.email);
      if (bulkRecipients === 'customer') targetEmails = users.filter(u => u.role === 'customer').map(u => u.email);

      try {
          await api.sendBulkMessage(bulkType, targetEmails, bulkMessage, bulkSubject);
          alert(`${bulkType === 'email' ? 'Emails' : 'SMS'} queued for ${targetEmails.length} users.`);
          setBulkMessage("");
          setBulkSubject("");
      } catch (e) {
          alert("Failed to send bulk message");
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
    if (['Completed', 'Confirmed', 'Read', 'Resolved', 'Responded', 'Delivered'].includes(status)) colorClass = 'bg-green-100 text-green-700';
    else if (['Pending', 'Processing', 'Open', 'In Progress', 'Out for Delivery'].includes(status)) colorClass = 'bg-yellow-100 text-yellow-700';
    else if (['Cancelled', 'Rejected'].includes(status)) colorClass = 'bg-red-100 text-red-700';
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colorClass}`}>
        {status}
      </span>
    );
  };

  // Chart Data Preparation
  const revenueData = [1200, 1900, 1500, 2200, 1800, 2800, 3500, 3100, 4200, 4500]; // Mock monthly revenue
  const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  
  // New Analytics Data
  const techPerformance = technicians.map(t => t.jobsCompleted || 0);
  const techNames = technicians.map(t => t.name.split(' ')[0]);
  const customerRatings = [5, 4, 3, 2, 1].map(r => technicians.reduce((acc, t) => acc + (t.reviews?.filter(rv => Math.round(rv.rating) === r).length || 0), 0));
  const activeUserCount = users.filter(u => u.isOnline).length;
  const remoteSessionCount = stats.remoteSessions || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans relative">
      
      {/* SIDEBAR NAVIGATION */}
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

      {/* MAIN CONTENT */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto h-screen">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 capitalize">{activeTab.replace('media', 'Site Media Manager').replace('bookings', 'Service Desk & Tickets')}</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowRemoteModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-primary-600 transition shadow-sm">
                <Monitor size={16} /> Remote Access
            </button>
            <button 
                onClick={() => fetchData(token)} 
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-50 shadow-sm transition-all"
            >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 
                <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 animate-pulse">
            Loading data...
          </div>
        ) : (
          <div className="space-y-6">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <OverviewCard title="Total Visits" value={stats.totalVisits.toLocaleString()} icon={Users} color="bg-blue-500" />
                  <OverviewCard title="Open Tickets" value={stats.openTickets || 0} icon={MessageSquare} color="bg-red-500" />
                  <OverviewCard title="Total Revenue" value={`GHS ${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-green-500" />
                  <OverviewCard title="Pending Quotes" value={stats.pendingQuotes} icon={FileText} color="bg-orange-500" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DashboardChart title="Revenue Growth (GHS)" data={revenueData} labels={chartLabels} type="line" color="#10b981" />
                    <DashboardChart title="Monthly Traffic" data={[80, 120, 105, 140, 110, 170, 160, 200, 230, 250]} labels={chartLabels} type="bar" color="#3b82f6" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <DashboardChart title="Technician Work Done" data={techPerformance} labels={techNames} type="bar" color="#8b5cf6" height={200} />
                    </div>
                    <div className="lg:col-span-1">
                        <DashboardChart title="Customer Ratings" data={customerRatings} labels={['5★', '4★', '3★', '2★', '1★']} type="bar" color="#eab308" height={200} />
                    </div>
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col justify-center">
                            <h3 className="text-gray-500 text-sm font-bold mb-2 uppercase flex items-center gap-2"><Users size={16} /> Active Users</h3>
                            <p className="text-4xl font-bold text-slate-800">{activeUserCount}</p>
                            <p className="text-xs text-green-500 mt-1 font-bold">+12% from last week</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col justify-center">
                            <h3 className="text-gray-500 text-sm font-bold mb-2 uppercase flex items-center gap-2"><Monitor size={16} /> Remote Sessions</h3>
                            <p className="text-4xl font-bold text-slate-800">{remoteSessionCount}</p>
                            <p className="text-xs text-blue-500 mt-1 font-bold">This Month</p>
                        </div>
                    </div>
                </div>
              </>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-700 text-xs uppercase border-b">
                                <tr>
                                    <th className="p-4">Order ID</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-100">
                                {orders.map(order => (
                                    <tr key={order.orderId} className="hover:bg-slate-50">
                                        <td className="p-4 font-mono font-medium text-slate-700">{order.orderId}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900">{order.customer.name}</div>
                                            <div className="text-xs text-slate-500">{order.customer.email}</div>
                                        </td>
                                        <td className="p-4 font-bold text-slate-800">GHS {order.total.toLocaleString()}</td>
                                        <td className="p-4"><StatusBadge status={order.status} /></td>
                                        <td className="p-4 text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <select 
                                                className="border rounded p-1 text-xs bg-white text-slate-900" 
                                                value={order.status}
                                                onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
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

            {/* SERVICE DESK & BOOKINGS TAB */}
            {activeTab === 'bookings' && (
                <div className="space-y-6">
                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
                            {['All', 'Pending', 'In Progress', 'Completed'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setBookingFilter(status)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${bookingFilter === status ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setIsAddingTech(true)} variant="secondary" size="sm">
                                <UserPlus size={16} className="mr-2" /> Add Technician
                            </Button>
                            <Button onClick={() => setIsAddingBooking(!isAddingBooking)} size="sm">
                                {isAddingBooking ? "Cancel" : <><Plus size={16} className="mr-2" /> New Ticket</>}
                            </Button>
                        </div>
                    </div>

                    {/* New Technician Modal - Updated Professional */}
                    {isAddingTech && (
                        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                                <h3 className="font-bold text-lg mb-1 text-slate-900 flex items-center gap-2">
                                    <UserCog className="text-primary-600" /> Register Technician
                                </h3>
                                <p className="text-slate-500 text-sm mb-6">Enter details for new service staff member.</p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Full Name</label>
                                        <input className="w-full border p-2.5 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-slate-900" 
                                            placeholder="e.g., Kwame Osei" 
                                            value={newTechData.name} 
                                            onChange={e => setNewTechData({...newTechData, name: e.target.value})} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Address</label>
                                        <input className="w-full border p-2.5 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-slate-900" 
                                            placeholder="tech@buzzitech.com" 
                                            value={newTechData.email} 
                                            onChange={e => setNewTechData({...newTechData, email: e.target.value})} 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Role</label>
                                            <select 
                                                className="w-full border p-2.5 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-slate-900"
                                                value={newTechData.role}
                                                onChange={e => setNewTechData({...newTechData, role: e.target.value})}
                                            >
                                                {TECH_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Department</label>
                                            <input className="w-full border p-2.5 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-slate-900" 
                                                placeholder="e.g., Infrastructure" 
                                                value={newTechData.department} 
                                                onChange={e => setNewTechData({...newTechData, department: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                                    <button onClick={() => setIsAddingTech(false)} className="flex-1 py-2.5 text-slate-500 hover:bg-slate-50 rounded-lg font-medium transition">Cancel</button>
                                    <Button onClick={handleAddTechnician} className="flex-1">Register Staff</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Technician List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                        <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-slate-700 flex justify-between items-center">
                            <span>Active Technical Staff</span>
                            <span className="text-xs font-normal text-slate-500">{technicians.length} Members</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {technicians.map(tech => (
                                <div key={tech.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                            {tech.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{tech.name}</h4>
                                            <p className="text-xs text-slate-500">{tech.role} • {tech.department}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="flex items-center gap-1 text-yellow-600 font-bold"><Star size={14} fill="currentColor"/> {tech.rating}</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${tech.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {tech.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Assign Technician Modal */}
                    {assigningBookingId && (
                        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                                <h3 className="font-bold text-lg mb-4 text-slate-900">Assign Ticket</h3>
                                <p className="text-sm text-slate-500 mb-4">Select a technician for ticket: <span className="font-mono font-bold">{assigningBookingId}</span></p>
                                <div className="space-y-2">
                                    {technicians.map(tech => (
                                        <button 
                                            key={tech.id}
                                            onClick={() => handleAssignTechnician(assigningBookingId, tech.name)}
                                            className="w-full text-left p-3 border rounded-lg hover:bg-slate-50 flex justify-between items-center group"
                                        >
                                            <div>
                                                <p className="font-bold text-slate-800">{tech.name}</p>
                                                <p className="text-xs text-slate-500">{tech.role} • {tech.status}</p>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 text-primary-600 text-xs font-bold uppercase transition">Select</div>
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setAssigningBookingId(null)} className="w-full mt-4 py-2 text-slate-500 hover:text-slate-800 text-sm">Cancel</button>
                            </div>
                        </div>
                    )}

                    {isAddingBooking && (
                        <div className="bg-slate-50 p-4 rounded-xl border mb-4 animate-in slide-in-from-top-2">
                            <h4 className="font-bold mb-3 text-sm text-slate-800">Create Support Ticket</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input className="border p-2 rounded bg-white text-slate-900" placeholder="Client Name" value={newBookingData.name} onChange={e => setNewBookingData({...newBookingData, name: e.target.value})} />
                                <input className="border p-2 rounded bg-white text-slate-900" placeholder="Service Type / Issue" value={newBookingData.serviceType} onChange={e => setNewBookingData({...newBookingData, serviceType: e.target.value})} />
                                <input className="border p-2 rounded bg-white text-slate-900" type="date" value={newBookingData.date} onChange={e => setNewBookingData({...newBookingData, date: e.target.value})} />
                                <input className="border p-2 rounded bg-white text-slate-900" type="time" value={newBookingData.time} onChange={e => setNewBookingData({...newBookingData, time: e.target.value})} />
                            </div>
                            <Button onClick={handleCreateBooking} size="sm">Create Ticket</Button>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-700 text-xs uppercase border-b">
                                <tr>
                                    <th className="p-4">Ticket ID</th>
                                    <th className="p-4">Subject & Client</th>
                                    <th className="p-4">Priority / Type</th>
                                    <th className="p-4">Assignee</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-100">
                                {bookings.filter(b => bookingFilter === 'All' || b.status === bookingFilter).map(booking => (
                                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-mono font-medium text-slate-600">
                                            {booking.id.includes('bk') ? booking.id.replace('bk-', 'TKT-') : booking.id}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900">{booking.serviceType}</div>
                                            <div className="text-xs text-slate-500">{booking.name} • {booking.date}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold border border-slate-200">Normal</span>
                                        </td>
                                        <td className="p-4">
                                            {booking.technician ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                                                        {booking.technician.charAt(0)}
                                                    </div>
                                                    <span className="text-slate-700">{booking.technician}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="p-4"><StatusBadge status={booking.status} /></td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => setAssigningBookingId(booking.id)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Assign Technician"
                                                >
                                                    <UserCog size={18} />
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {bookings.filter(b => bookingFilter === 'All' || b.status === bookingFilter).length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400">No tickets found in this view.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MESSAGES TAB (Support Inbox) */}
            {activeTab === 'messages' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {messages.map(msg => (
                            <div key={msg.id} className="border-b border-gray-100 last:border-0 p-6 hover:bg-slate-50 transition">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">{msg.name} <span className="text-sm font-normal text-slate-500">({msg.email})</span></h4>
                                        <p className="text-xs text-primary-600 font-bold uppercase tracking-wide mt-1">{msg.service} • Ticket #{msg.ticketId || 'N/A'}</p>
                                    </div>
                                    <StatusBadge status={msg.status} />
                                </div>
                                <p className="text-slate-600 my-4 bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap">{msg.message}</p>
                                
                                {/* Replies */}
                                {msg.replies && msg.replies.length > 0 && (
                                    <div className="ml-8 mb-4 space-y-2 border-l-2 border-slate-200 pl-4">
                                        {msg.replies.map((reply: any, idx: number) => (
                                            <div key={idx} className="text-sm">
                                                <span className="font-bold text-slate-700">{reply.sender}:</span> <span className="text-slate-600">{reply.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {replyingMessage === msg.id ? (
                                    <div className="mt-4 flex gap-2">
                                        <input 
                                            className="flex-grow border rounded p-2 text-sm bg-white text-slate-900" 
                                            placeholder="Type reply..." 
                                            value={replyText} 
                                            onChange={e => setReplyText(e.target.value)} 
                                        />
                                        <Button onClick={() => handleSendReply(msg.id)} size="sm">Send</Button>
                                        <button onClick={() => setReplyingMessage(null)} className="text-slate-400 hover:text-slate-600">Cancel</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setReplyingMessage(msg.id)} className="text-sm text-primary-600 font-medium hover:underline">Reply to Ticket</button>
                                )}
                            </div>
                        ))}
                        {messages.length === 0 && <div className="p-8 text-center text-slate-400">No support tickets found.</div>}
                    </div>
                </div>
            )}

            {/* QUOTES TAB */}
            {activeTab === 'quotes' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">Quote Management</h3>
                            <p className="text-sm text-slate-500">Manage client estimates and invoices.</p>
                        </div>
                        <Button onClick={() => setIsCreatingQuote(!isCreatingQuote)} size="sm">
                            {isCreatingQuote ? "Close Builder" : <><Plus size={16} className="mr-2" /> Create New Quote</>}
                        </Button>
                    </div>

                    {isCreatingQuote && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-primary-200 mb-6 animate-in slide-in-from-top-4">
                            <h4 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2"><Briefcase size={18} /> Quote Builder</h4>
                            
                            {/* Client Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <input className="border p-2 rounded bg-white text-slate-900" placeholder="Client Name" value={newQuoteData.name} onChange={e => setNewQuoteData({...newQuoteData, name: e.target.value})} />
                                <input className="border p-2 rounded bg-white text-slate-900" placeholder="Client Email" value={newQuoteData.email} onChange={e => setNewQuoteData({...newQuoteData, email: e.target.value})} />
                                <input className="border p-2 rounded bg-white text-slate-900" placeholder="Client Phone" value={newQuoteData.phone} onChange={e => setNewQuoteData({...newQuoteData, phone: e.target.value})} />
                            </div>

                            {/* Add Item */}
                            <div className="bg-slate-50 p-4 rounded-lg border mb-4">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Add Line Item</p>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <input className="border p-2 rounded bg-white text-slate-900 md:col-span-2" placeholder="Item Name / Service" value={newQuoteItem.name} onChange={e => setNewQuoteItem({...newQuoteItem, name: e.target.value})} />
                                    <input className="border p-2 rounded bg-white text-slate-900" type="number" placeholder="Price" value={newQuoteItem.price || ''} onChange={e => setNewQuoteItem({...newQuoteItem, price: Number(e.target.value)})} />
                                    <input className="border p-2 rounded bg-white text-slate-900" type="number" placeholder="Qty" value={newQuoteItem.quantity} onChange={e => setNewQuoteItem({...newQuoteItem, quantity: Number(e.target.value)})} />
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button onClick={handleAddQuoteItem} className="text-sm bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800">Add Item</button>
                                </div>
                            </div>

                            {/* Preview List */}
                            {(newQuoteData.items || []).length > 0 && (
                                <div className="mb-4 border rounded overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="p-2">Item</th>
                                                <th className="p-2 text-right">Price</th>
                                                <th className="p-2 text-right">Qty</th>
                                                <th className="p-2 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(newQuoteData.items || []).map((item, idx) => (
                                                <tr key={idx} className="border-t">
                                                    <td className="p-2">{item.name}</td>
                                                    <td className="p-2 text-right">{item.price}</td>
                                                    <td className="p-2 text-right">{item.quantity}</td>
                                                    <td className="p-2 text-right">{(item.price * item.quantity).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-100 font-bold">
                                            <tr>
                                                <td colSpan={3} className="p-2 text-right">Grand Total:</td>
                                                <td className="p-2 text-right">GHS {newQuoteData.grandTotal?.toLocaleString()}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <Button onClick={handleGenerateAdminQuote}>Generate & Send Quote</Button>
                            </div>
                        </div>
                    )}

                    {/* Quote Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-slate-700 mb-2">Total Quote Value</h3>
                            <p className="text-3xl font-bold text-primary-600">GHS {quotes.reduce((acc, q) => acc + q.grandTotal, 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-slate-700 mb-2">Quote Requests</h3>
                            <p className="text-3xl font-bold text-slate-800">{quotes.length}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Recent Quotes</h3>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Live Sync Active</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-700 text-xs uppercase border-b">
                                    <tr>
                                        <th className="p-4">Client</th>
                                        <th className="p-4">Service Type</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Timeline</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100">
                                    {quotes.map((quote, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900">{quote.name}</div>
                                                <div className="text-xs text-slate-500">{quote.email}</div>
                                            </td>
                                            <td className="p-4">{quote.serviceType}</td>
                                            <td className="p-4 font-bold text-slate-800">GHS {quote.grandTotal.toLocaleString()}</td>
                                            <td className="p-4"><span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">{quote.timeline}</span></td>
                                            <td className="p-4">
                                                <button 
                                                    onClick={() => generateInvoice(quote)}
                                                    className="flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium text-xs bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded transition"
                                                >
                                                    <Download size={14} /> Download PDF
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800">Product Inventory</h3>
                        <Button onClick={() => setIsAddingProduct(!isAddingProduct)} size="sm">{isAddingProduct ? "Cancel" : "Add Product"}</Button>
                    </div>

                    {(isAddingProduct || editingProduct) && (
                        <div className="bg-slate-50 p-6 rounded-xl border mb-6">
                            <h4 className="font-bold mb-4 text-slate-800">{editingProduct ? "Edit Product" : "New Product"}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <input className="border p-2 rounded bg-white text-slate-900" placeholder="Product Name" value={editingProduct ? editingProduct.name : newProduct.name} onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} />
                                <input className="border p-2 rounded bg-white text-slate-900" placeholder="Price" type="number" value={editingProduct ? editingProduct.price : newProduct.price} onChange={e => editingProduct ? setEditingProduct({...editingProduct, price: parseFloat(e.target.value)}) : setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                                <input className="border p-2 rounded bg-white text-slate-900" placeholder="Stock" type="number" value={editingProduct ? editingProduct.stock : newProduct.stock} onChange={e => editingProduct ? setEditingProduct({...editingProduct, stock: parseInt(e.target.value)}) : setNewProduct({...newProduct, stock: parseInt(e.target.value)})} />
                                <input className="border p-2 rounded bg-white text-slate-900" placeholder="Category" value={editingProduct ? editingProduct.category : newProduct.category} onChange={e => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})} />
                            </div>
                            <Button onClick={editingProduct ? handleSaveProduct : handleCreateProduct} size="sm">Save Product</Button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map(product => (
                            <div key={product.id} className="bg-white border rounded-xl p-4 flex flex-col hover:shadow-md transition">
                                <img src={product.image} alt={product.name} className="h-32 object-contain mb-4" />
                                <h4 className="font-bold text-slate-900 text-sm mb-1">{product.name}</h4>
                                <p className="text-xs text-slate-500 mb-2">{product.category}</p>
                                <div className="flex justify-between items-center mt-auto">
                                    <span className="font-bold text-primary-600">GHS {product.price}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.stock} in stock</span>
                                </div>
                                <button onClick={() => setEditingProduct(product)} className="mt-3 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded text-xs font-bold transition">Edit</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MEETINGS TAB */}
            {activeTab === 'meetings' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800">Scheduled Meetings & Remote Support</h3>
                        <Button onClick={() => setIsAddingMeeting(!isAddingMeeting)} size="sm">{isAddingMeeting ? "Cancel" : "Schedule Meeting"}</Button>
                    </div>

                    {isAddingMeeting && (
                        <div className="bg-slate-50 p-4 rounded-xl border mb-6">
                            <h4 className="font-bold mb-3 text-slate-800">New Meeting</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input className="border p-2 rounded bg-white text-slate-900" placeholder="Meeting Title" value={newMeetingData.title} onChange={e => setNewMeetingData({...newMeetingData, title: e.target.value})} />
                                <select 
                                    className="border p-2 rounded bg-white text-slate-900" 
                                    value={newMeetingData.platform} 
                                    onChange={e => setNewMeetingData({...newMeetingData, platform: e.target.value as any})}
                                >
                                    <option value="Zoom">Zoom</option>
                                    <option value="Teams">Microsoft Teams</option>
                                </select>
                                <input className="border p-2 rounded bg-white text-slate-900" type="date" value={newMeetingData.date} onChange={e => setNewMeetingData({...newMeetingData, date: e.target.value})} />
                                <input className="border p-2 rounded bg-white text-slate-900" type="time" value={newMeetingData.time} onChange={e => setNewMeetingData({...newMeetingData, time: e.target.value})} />
                                <input className="border p-2 rounded bg-white text-slate-900" placeholder="Attendee Emails (comma separated)" value={newMeetingData.attendees} onChange={e => setNewMeetingData({...newMeetingData, attendees: e.target.value})} />
                            </div>
                            <Button onClick={handleScheduleMeeting} size="sm">Schedule</Button>
                        </div>
                    )}

                    {/* Chat Interface - Admin/User */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8 p-6">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Internal Communication</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[400px]">
                            {/* User List */}
                            <div className="border-r border-gray-100 pr-4 overflow-y-auto">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Select User</h4>
                                {users.filter(u => u.role !== 'admin').map(u => (
                                    <button 
                                        key={u.id}
                                        onClick={() => setChatTarget(u)}
                                        className={`w-full text-left p-3 rounded-lg mb-2 flex items-center gap-3 transition ${chatTarget?.id === u.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">{u.name.charAt(0)}</div>
                                        <div>
                                            <p className="font-bold text-sm">{u.name}</p>
                                            <p className="text-xs opacity-70 capitalize">{u.role}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Chat Area */}
                            <div className="md:col-span-2 flex flex-col">
                                {chatTarget ? (
                                    <>
                                        <div className="flex-grow overflow-y-auto bg-slate-50 rounded-lg p-4 mb-3 space-y-3">
                                            {internalChats
                                                .filter(c => (c.senderId === chatTarget.id && c.receiverId === 'admin') || (c.senderId === 'admin' && c.receiverId === chatTarget.id))
                                                .map(chat => (
                                                <div key={chat.id} className={`flex ${chat.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`p-3 rounded-xl max-w-[70%] text-sm ${chat.senderId === 'admin' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white border text-slate-800 rounded-bl-none'}`}>
                                                        <p>{chat.message}</p>
                                                        <span className="text-[10px] opacity-70 block text-right mt-1">{new Date(chat.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {internalChats.filter(c => (c.senderId === chatTarget.id && c.receiverId === 'admin') || (c.senderId === 'admin' && c.receiverId === chatTarget.id)).length === 0 && (
                                                <p className="text-center text-slate-400 text-sm mt-10">Start a conversation with {chatTarget.name}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                className="flex-grow border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                                                placeholder="Type a message..."
                                                value={internalMessage}
                                                onChange={e => setInternalMessage(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleInternalChat()}
                                            />
                                            <Button onClick={handleInternalChat} size="sm">Send</Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">
                                        <p>Select a user to start chatting</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SITE MEDIA TAB */}
            {activeTab === 'media' && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800">Site Media Manager</h3>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/3 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Select Image Area</label>
                                    <select 
                                        className="w-full border p-2 rounded bg-white text-slate-900" 
                                        value={selectedImageKey} 
                                        onChange={(e) => setSelectedImageKey(e.target.value)}
                                    >
                                        {MEDIA_LOCATIONS.map(loc => <option key={loc.key} value={loc.key}>{loc.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Image URL</label>
                                    <input 
                                        className="w-full border p-2 rounded bg-white text-slate-900 text-sm" 
                                        value={currentImageUrl} 
                                        onChange={(e) => setCurrentImageUrl(e.target.value)} 
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Or Upload New</label>
                                    <input type="file" onChange={(e) => handleUploadImage(e)} className="text-sm" />
                                </div>
                                <Button onClick={handleSaveImages} className="w-full">Update Image</Button>
                            </div>
                            <div className="md:w-2/3 bg-slate-100 rounded-xl flex items-center justify-center p-4 min-h-[300px]">
                                {currentImageUrl ? (
                                    <img src={currentImageUrl} alt="Preview" className="max-h-[400px] max-w-full rounded shadow-lg object-contain" />
                                ) : (
                                    <span className="text-slate-400">Select an area to preview</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CHATBOT & AI TAB */}
            {activeTab === 'chatbot' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="flex-grow">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Bot className="text-primary-600" /> Chatbot Knowledge Base
                            </h3>
                            <p className="text-sm text-slate-500">Manage automated responses and upload documents.</p>
                        </div>
                        <div className="flex gap-3">
                            <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer text-sm font-medium transition">
                                {uploading ? <RefreshCw size={16} className="animate-spin" /> : <UploadCloud size={16} />} 
                                <span>Upload JSON/PDF/DOCX</span>
                                <input type="file" className="hidden" accept=".json,.pdf,.docx,.doc" onChange={handleKBUpload} disabled={uploading} />
                            </label>
                            <Button onClick={() => setIsAddingKB(!isAddingKB)} size="sm">
                                {isAddingKB ? "Cancel" : <><Plus size={16} className="mr-1" /> Add Response</>}
                            </Button>
                        </div>
                    </div>

                    {isAddingKB && (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold mb-3 text-slate-800 uppercase tracking-wide">New Knowledge Entry</h4>
                            <div className="grid grid-cols-1 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Keywords (Comma Separated)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g., price, cost, how much, pricing" 
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900" 
                                        value={kbKeywordsInput} 
                                        onChange={e => setKbKeywordsInput(e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">AI Answer / Response</label>
                                    <textarea 
                                        rows={4}
                                        placeholder="The response the bot should give..." 
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900" 
                                        value={newKBEntry.answer} 
                                        onChange={e => setNewKBEntry({...newKBEntry, answer: e.target.value})} 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                                        <select 
                                            className="w-full border p-3 rounded-lg bg-white text-slate-900" 
                                            value={newKBEntry.category} 
                                            onChange={e => setNewKBEntry({...newKBEntry, category: e.target.value})}
                                        >
                                            <option value="general">General</option>
                                            <option value="pricing">Pricing</option>
                                            <option value="service">Service</option>
                                            <option value="support">Support</option>
                                            <option value="troubleshooting">Troubleshooting</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleAddKBEntry} size="sm">Save Entry</Button>
                            </div>
                        </div>
                    )}

                    <div className="border rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-700 text-xs uppercase border-b">
                                <tr>
                                    <th className="p-4 w-1/6">Category</th>
                                    <th className="p-4 w-1/4">Keywords</th>
                                    <th className="p-4 w-1/2">Response</th>
                                    <th className="p-4 w-1/12 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-100">
                                {knowledgeBase.map(entry => (
                                    <tr key={entry.id} className="hover:bg-slate-50 group transition-colors">
                                        <td className="p-4 align-top">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold uppercase">{entry.category}</span>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="flex flex-wrap gap-1">
                                                {entry.keywords.map((k, i) => (
                                                    <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{k}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 whitespace-pre-wrap align-top font-mono text-xs leading-relaxed">
                                            {entry.answer.length > 100 ? entry.answer.substring(0, 100) + '...' : entry.answer}
                                        </td>
                                        <td className="p-4 text-center align-top">
                                            <button 
                                                onClick={() => handleDeleteKBEntry(entry.id)}
                                                className="text-red-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition"
                                                title="Delete Entry"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {knowledgeBase.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-400">
                                            No knowledge base entries found. Add one or upload a JSON file.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* USERS MANAGEMENT TAB */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">User Management & Real-Time Monitoring</h3>
                            <Button onClick={() => setIsAddingUser(!isAddingUser)} size="sm">
                                {isAddingUser ? "Cancel" : "Add User"}
                            </Button>
                        </div>

                        {isAddingUser && (
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-sm font-bold mb-3">Add New User</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <input type="text" placeholder="Full Name" className="border p-2 rounded bg-white text-slate-900" value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} />
                                    <input type="email" placeholder="Email" className="border p-2 rounded bg-white text-slate-900" value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} />
                                    <input type="password" placeholder="Password" className="border p-2 rounded bg-white text-slate-900" value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})} />
                                    <select className="border p-2 rounded bg-white text-slate-900" value={newUserData.role} onChange={e => setNewUserData({...newUserData, role: e.target.value})}>
                                        <option value="customer">Customer</option>
                                        <option value="technician">Technician</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <Button onClick={handleCreateUser} size="sm">Create Account</Button>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-700 text-xs uppercase">
                                    <tr>
                                        <th className="p-3">User</th>
                                        <th className="p-3">Role</th>
                                        <th className="p-3">Status (Real-Time)</th>
                                        <th className="p-3">Last Active</th>
                                        <th className="p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50">
                                            <td className="p-3 font-medium">
                                                <div>{user.name}</div>
                                                <div className="text-xs text-slate-400">{user.email}</div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    user.role === 'technician' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {user.isOnline ? (
                                                    <span className="flex items-center gap-2 text-green-600 font-bold text-xs"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online ({user.location || 'Unknown'})</span>
                                                ) : (
                                                    <span className="flex items-center gap-2 text-slate-400 text-xs"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Offline</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-slate-500 text-xs">
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                            </td>
                                            <td className="p-3">
                                                <button className="text-blue-600 hover:underline mr-2" onClick={() => api.updateUserRole(user.id, user.role === 'admin' ? 'customer' : 'admin')}>
                                                    Change Role
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* LOGIN LOGS SECTION */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><ShieldCheck size={20} /> Security & Login Logs</h3>
                        <div className="overflow-x-auto max-h-64 overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-700 text-xs uppercase sticky top-0">
                                    <tr>
                                        <th className="p-3">User</th>
                                        <th className="p-3">IP Address</th>
                                        <th className="p-3">Location</th>
                                        <th className="p-3">Device</th>
                                        <th className="p-3">Time</th>
                                        <th className="p-3">Risk Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100">
                                    {loginLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50">
                                            <td className="p-3 font-medium">{log.userName}</td>
                                            <td className="p-3 font-mono text-slate-500">{log.ip}</td>
                                            <td className="p-3">{log.location}</td>
                                            <td className="p-3">{log.device}</td>
                                            <td className="p-3 text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    log.riskScore === 'High' ? 'bg-red-100 text-red-700' :
                                                    log.riskScore === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                    {log.riskScore}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* COMMUNICATION TAB (BULK) */}
            {activeTab === 'communication' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-3xl">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Megaphone size={24} className="text-primary-600" /> Bulk Messaging Center
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setBulkType('email')} className={`p-4 border rounded-lg flex items-center gap-3 ${bulkType === 'email' ? 'bg-blue-50 border-blue-500' : ''}`}>
                                <Mail className="text-blue-500" /> 
                                <div className="text-left">
                                    <div className="font-bold text-slate-800">Email Broadcast</div>
                                    <div className="text-xs text-slate-500">Send via SMTP</div>
                                </div>
                            </button>
                            <button onClick={() => setBulkType('sms')} className={`p-4 border rounded-lg flex items-center gap-3 ${bulkType === 'sms' ? 'bg-green-50 border-green-500' : ''}`}>
                                <Smartphone className="text-green-500" /> 
                                <div className="text-left">
                                    <div className="font-bold text-slate-800">SMS Blast</div>
                                    <div className="text-xs text-slate-500">Via Gateway</div>
                                </div>
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Target Audience</label>
                            <select className="w-full border p-3 rounded-lg bg-white text-slate-900" value={bulkRecipients} onChange={(e) => setBulkRecipients(e.target.value)}>
                                <option value="all">All Users ({users.length})</option>
                                <option value="technician">Technicians Only</option>
                                <option value="customer">Customers Only</option>
                            </select>
                        </div>

                        {bulkType === 'email' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Subject Line</label>
                                <input type="text" className="w-full border p-3 rounded-lg bg-white text-slate-900" placeholder="Newsletter Subject" value={bulkSubject} onChange={(e) => setBulkSubject(e.target.value)} />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Message Content</label>
                            <textarea 
                                className="w-full border p-3 rounded-lg h-32 bg-white text-slate-900" 
                                placeholder={bulkType === 'email' ? "HTML or Plain text content..." : "SMS content (160 chars recommended)..."}
                                value={bulkMessage}
                                onChange={(e) => setBulkMessage(e.target.value)}
                            ></textarea>
                            {bulkType === 'sms' && <p className="text-xs text-slate-500 mt-1">{bulkMessage.length} characters</p>}
                        </div>

                        <Button onClick={handleSendBulkMessage} className="w-full">
                            Send Broadcast
                        </Button>
                    </div>
                </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
                <div className="space-y-6">
                    {/* General Settings */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Settings size={24} className="text-primary-600" /> System Configurations
                        </h2>
                        
                        <div className="space-y-8 max-w-4xl">
                            {/* Logo Upload */}
                            <div>
                                <h3 className="text-md font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                                    <Image size={18} /> Branding
                                </h3>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 border rounded-lg flex items-center justify-center bg-gray-50">
                                        {settings.logoUrl ? <img src={settings.logoUrl} alt="Logo" className="max-w-full max-h-full p-2" /> : <span className="text-xs text-slate-400">No Logo</span>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Website Logo</label>
                                        <input type="file" accept="image/*" onChange={handleUploadLogo} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
                                        <p className="text-xs text-slate-400 mt-1">Upload PNG or SVG for best results.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Email Settings */}
                            <div>
                                <h3 className="text-md font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                                    <Mail size={18} /> Email & Notifications
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                                        <input type="email" className="w-full border rounded px-3 py-2 bg-white text-slate-900" value={settings.adminEmail} onChange={e => setSettings({...settings, adminEmail: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Host</label>
                                        <input type="text" className="w-full border rounded px-3 py-2 bg-white text-slate-900" value={settings.smtpHost} onChange={e => setSettings({...settings, smtpHost: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">SMTP User</label>
                                        <input type="text" className="w-full border rounded px-3 py-2 bg-white text-slate-900" value={settings.smtpUser} onChange={e => setSettings({...settings, smtpUser: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Password</label>
                                        <input type="password" className="w-full border rounded px-3 py-2 bg-white text-slate-900" value={settings.smtpPass} onChange={e => setSettings({...settings, smtpPass: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integration Settings */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Webhook size={24} className="text-purple-600" /> API Integrations
                        </h2>

                        <div className="space-y-8 max-w-4xl">
                            {/* n8n */}
                            <div>
                                <h3 className="text-md font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                                    <Activity size={18} /> n8n Automation
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">General Form Webhook URL</label>
                                        <input type="text" className="w-full border rounded px-3 py-2 bg-white text-slate-900" value={settings.n8nWebhook} onChange={e => setSettings({...settings, n8nWebhook: e.target.value})} placeholder="https://n8n.yourdomain.com/webhook/forms" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Quote Integration Webhook URL</label>
                                        <input type="text" className="w-full border rounded px-3 py-2 bg-white text-slate-900" value={settings.n8nQuoteWebhook} onChange={e => setSettings({...settings, n8nQuoteWebhook: e.target.value})} placeholder="https://n8n.yourdomain.com/webhook/quotes" />
                                        <p className="text-xs text-slate-500 mt-1">Dedicated webhook for handling complex quote logic and CRM syncing.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Request a Quick Callback Webhook URL</label>
                                        <input type="text" className="w-full border rounded px-3 py-2 bg-white text-slate-900" value={settings.n8nCallbackWebhook} onChange={e => setSettings({...settings, n8nCallbackWebhook: e.target.value})} placeholder="https://n8n.yourdomain.com/webhook/callback" />
                                        <p className="text-xs text-slate-500 mt-1">Triggers when a user requests a callback from the homepage.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Chatbot Webhook URL</label>
                                        <input type="text" className="w-full border rounded px-3 py-2 bg-white text-slate-900" value={settings.n8nChatWebhook} onChange={e => setSettings({...settings, n8nChatWebhook: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* SMS Gateway */}
                            <div>
                                <h3 className="text-md font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                                    <Smartphone size={18} /> SMS Gateway
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
                                        <select className="w-full border rounded px-3 py-2 bg-white text-slate-900" value={settings.smsProvider} onChange={e => setSettings({...settings, smsProvider: e.target.value})}>
                                            <option value="AfricaTalking">Africa's Talking</option>
                                            <option value="Twilio">Twilio</option>
                                            <option value="Hubtel">Hubtel</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Sender ID</label>
                                        <input type="text" className="w-full border rounded px-3 py-2 bg-white text-slate-900" value={settings.smsSenderId} onChange={e => setSettings({...settings, smsSenderId: e.target.value})} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">API Key / Auth Token</label>
                                        <input type="password" className="w-full border rounded px-3 py-2 bg-white text-slate-900" value={settings.smsApiKey} onChange={e => setSettings({...settings, smsApiKey: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleSaveSettings}>
                                    <Save size={18} className="mr-2" /> Save Configuration
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;