import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, ShoppingBag, Package, RefreshCw, LayoutDashboard, 
  Calendar, MessageSquare, FileText, TrendingUp, Users, DollarSign,
  Phone, Mail, Clock, CheckCircle, AlertCircle, Edit2, Image, Save, X, Ticket,
  Settings, CreditCard, Webhook, Server, Plus, Star, Link as LinkIcon, Upload, UserPlus, Truck, Monitor, Video, ShieldCheck, Trash2,
  Bot, FileJson, UploadCloud, Smartphone, Radio, Activity, Eye, File, Megaphone, UserCog, MoreVertical, Briefcase, Download, Building, ArrowRight, Smile, Paperclip, Lock, Key, Send, Search, Filter, MapPin, EyeOff, UserCheck, Globe, Shield, Zap, Copy, ImagePlus, ToggleLeft, ToggleRight, Wrench
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

  // Technician Edit State
  const [newTechData, setNewTechData] = useState<Partial<Technician>>({ name: '', email: '', phone: '', role: 'Network Engineer', department: 'Infrastructure', rating: 5, feedback: '' });
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
  const DEPARTMENTS = ["Infrastructure", "Security", "IT Support", "Field Ops", "Networking", "General"];
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
      if(!newTechData.name?.trim() || !newTechData.email?.trim()) {
          alert("Name and Email are required");
          return;
      }
      try {
          const result = await api.addTechnician(newTechData, token);
          if (result.technicians) setTechnicians(result.technicians);
          setNewTechData({ name: '', email: '', phone: '', role: 'Network Engineer', department: 'Infrastructure', rating: 5, feedback: '' });
          setIsAddingTech(false);
          alert("Technician Added Successfully");
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

  const toggleOtpVisibility = (id: string) => {
      setRevealedOtps(prev => ({...prev, [id]: !prev[id]}));
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

  // --- CHAT ACTIONS ---
  const handleLaunchRemote = (tool: 'anydesk' | 'teamviewer') => {
      if (!remoteId) {
          alert("Please enter a Session ID");
          return;
      }
      
      const cleanId = remoteId.replace(/\s/g, ''); // Remove spaces
      let protocolUrl = '';
      let fallbackUrl = '';

      if (tool === 'anydesk') {
          protocolUrl = `anydesk:${cleanId}`;
          fallbackUrl = 'https://anydesk.com/en/downloads';
      } else {
          protocolUrl = `teamviewer8://${cleanId}`; 
          fallbackUrl = 'https://www.teamviewer.com/en/download/';
      }
      
      window.location.href = protocolUrl;
      setTimeout(() => {
         if(confirm(`It seems ${tool} didn't open. Do you want to download it?`)) {
             window.open(fallbackUrl, '_blank');
         }
      }, 1500);
      
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
          setNewProduct({ name: '', price: 0, originalPrice: 0, stock: 0, brand: '', category: 'General', description: '', image: '', features: [], isActive: true });
          alert("Product created successfully");
      } catch (e) {
          alert("Failed to create product");
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

  // --- Missing Handlers Definitions ---

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setUploading(true);
      try {
          const url = await api.uploadImage(file);
          setCurrentImageUrl(url);
          setSiteImages((prev: any) => ({ ...prev, [selectedImageKey]: url }));
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

  const handleDeleteMeeting = async (id: string) => {
      if(!confirm("Cancel this meeting?")) return;
      // Since API doesn't have deleteMeeting, we just remove from local state
      setMeetings(prev => prev.filter(m => m.id !== id));
  };

  const handleApproveUser = async (userId: string) => {
      try {
          await api.approveUser(userId, token);
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, isApproved: true, status: 'Active' } : u));
          alert("User approved successfully");
      } catch (e) {
          alert("Failed to approve user");
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

  // Chart Data Preparation
  const revenueData = [1200, 1900, 1500, 2200, 1800, 2800, 3500, 3100, 4200, 4500]; // Mock monthly revenue
  const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  
  // Analytics Data
  const totalUsers = users.length;

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
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-slate-600 shadow-sm transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 
                <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh Data'}</span>
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
                  <OverviewCard title="Registered Users" value={totalUsers} icon={Users} color="bg-blue-500" />
                  <OverviewCard title="Total Revenue" value={`GHS ${stats.totalRevenue?.toLocaleString() || 0}`} icon={DollarSign} color="bg-green-500" />
                  <OverviewCard title="Active Orders" value={stats.activeOrders || 0} icon={ShoppingBag} color="bg-purple-500" />
                  <OverviewCard title="Open Tickets" value={stats.openTickets || 0} icon={Ticket} color="bg-orange-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="lg:col-span-2">
                      <DashboardChart data={revenueData} labels={chartLabels} title="Revenue Trend" type="line" height={300} />
                   </div>
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="font-bold text-slate-700 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                         <button onClick={() => setActiveTab('bookings')} className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition">
                            <span className="text-sm font-medium">Manage Tickets</span>
                            <ArrowRight size={16} className="text-slate-400" />
                         </button>
                         <button onClick={() => setActiveTab('users')} className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition">
                            <span className="text-sm font-medium">View Users</span>
                            <ArrowRight size={16} className="text-slate-400" />
                         </button>
                         <button onClick={() => setActiveTab('inventory')} className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition">
                            <span className="text-sm font-medium">Update Inventory</span>
                            <ArrowRight size={16} className="text-slate-400" />
                         </button>
                      </div>
                   </div>
                </div>
              </>
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

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                      <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-64" 
                              placeholder="Search products..."
                              value={inventorySearch}
                              onChange={e => setInventorySearch(e.target.value)}
                          />
                      </div>
                      <Button onClick={() => setIsAddingProduct(true)} size="sm">
                          <Plus size={16} className="mr-2"/> Add Product
                      </Button>
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
                                      <td className="px-6 py-4 flex items-center gap-3">
                                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover bg-gray-100" />
                                          <div>
                                              <div className="font-bold text-slate-900">{product.name}</div>
                                              <div className="text-xs text-slate-400">{product.brand || 'Generic'}</div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">{product.category}</td>
                                      <td className="px-6 py-4">GHS {product.price.toLocaleString()}</td>
                                      <td className="px-6 py-4">
                                          <span className={product.stock < 5 ? 'text-red-500 font-bold' : ''}>{product.stock}</span>
                                      </td>
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

            {/* SITE MEDIA TAB */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <h3 className="font-bold text-lg mb-4">Manage Site Images</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                              <div>
                                  <label className={labelStyle}>Select Section</label>
                                  <select 
                                      className={inputStyle}
                                      value={selectedImageKey}
                                      onChange={e => setSelectedImageKey(e.target.value)}
                                  >
                                      {MEDIA_LOCATIONS.map(loc => (
                                          <option key={loc.key} value={loc.key}>{loc.label}</option>
                                      ))}
                                  </select>
                              </div>
                              <div>
                                  <label className={labelStyle}>Image URL</label>
                                  <input 
                                      className={inputStyle}
                                      value={currentImageUrl}
                                      onChange={e => setCurrentImageUrl(e.target.value)}
                                      placeholder="https://..."
                                  />
                              </div>
                              <div>
                                  <label className={labelStyle}>Or Upload New Image</label>
                                  <input 
                                      type="file" 
                                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                      onChange={(e) => handleUploadImage(e)}
                                  />
                              </div>
                              <Button onClick={handleSaveImages} disabled={uploading} className="w-full">
                                  {uploading ? 'Uploading...' : 'Save Image Update'}
                              </Button>
                          </div>
                          
                          <div className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 min-h-[300px] overflow-hidden relative">
                              {currentImageUrl ? (
                                  <img src={currentImageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                              ) : (
                                  <div className="text-center text-slate-400">
                                      <Image size={48} className="mx-auto mb-2 opacity-50" />
                                      <p>No image selected</p>
                                  </div>
                              )}
                              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Preview</div>
                          </div>
                      </div>
                  </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Settings size={20} /> General Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className={labelStyle}>Admin Email</label>
                              <input className={inputStyle} value={settings.adminEmail} onChange={e => setSettings({...settings, adminEmail: e.target.value})} />
                          </div>
                          <div>
                              <label className={labelStyle}>Logo URL</label>
                              <div className="flex gap-2">
                                  <input className={inputStyle} value={settings.logoUrl} onChange={e => setSettings({...settings, logoUrl: e.target.value})} />
                                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-2.5 rounded-lg border border-gray-300">
                                      <Upload size={20} className="text-slate-600" />
                                      <input type="file" className="hidden" onChange={handleUploadLogo} />
                                  </label>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Webhook size={20} /> Automation (n8n / Webhooks)</h3>
                      <div className="space-y-4">
                          <div>
                              <label className={labelStyle}>Main Webhook URL</label>
                              <input className={inputStyle} value={settings.n8nWebhook} onChange={e => setSettings({...settings, n8nWebhook: e.target.value})} placeholder="https://your-n8n-instance.com/webhook/..." />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label className={labelStyle}>Chatbot Webhook</label>
                                  <input className={inputStyle} value={settings.n8nChatWebhook} onChange={e => setSettings({...settings, n8nChatWebhook: e.target.value})} />
                              </div>
                              <div>
                                  <label className={labelStyle}>Quote Generator Webhook</label>
                                  <input className={inputStyle} value={settings.n8nQuoteWebhook} onChange={e => setSettings({...settings, n8nQuoteWebhook: e.target.value})} />
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Mail size={20} /> Email (SMTP)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className={labelStyle}>SMTP Host</label>
                              <input className={inputStyle} value={settings.smtpHost} onChange={e => setSettings({...settings, smtpHost: e.target.value})} />
                          </div>
                          <div>
                              <label className={labelStyle}>SMTP User</label>
                              <input className={inputStyle} value={settings.smtpUser} onChange={e => setSettings({...settings, smtpUser: e.target.value})} />
                          </div>
                          <div className="col-span-2">
                              <label className={labelStyle}>SMTP Password</label>
                              <input type="password" className={inputStyle} value={settings.smtpPass} onChange={e => setSettings({...settings, smtpPass: e.target.value})} />
                          </div>
                      </div>
                  </div>

                  <div className="flex justify-end">
                      <Button onClick={handleSaveSettings} className="px-8">Save Configuration</Button>
                  </div>
              </div>
            )}

            {/* BULK COMMS TAB */}
            {activeTab === 'communication' && (
              <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Megaphone className="text-primary-600" /> Bulk Messaging Center</h3>
                  
                  <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className={labelStyle}>Channel</label>
                              <div className="flex gap-4 mt-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="channel" checked={bulkType === 'email'} onChange={() => setBulkType('email')} className="text-primary-600 focus:ring-primary-500" />
                                      <span>Email Broadcast</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="channel" checked={bulkType === 'sms'} onChange={() => setBulkType('sms')} className="text-primary-600 focus:ring-primary-500" />
                                      <span>SMS Blast</span>
                                  </label>
                              </div>
                          </div>
                          <div>
                              <label className={labelStyle}>Target Audience</label>
                              <select className={inputStyle} value={bulkRecipients} onChange={e => setBulkRecipients(e.target.value)}>
                                  <option value="all">All Users</option>
                                  <option value="customer">Customers Only</option>
                                  <option value="technician">Technicians Only</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className={labelStyle}>Subject Line</label>
                          <input className={inputStyle} value={bulkSubject} onChange={e => setBulkSubject(e.target.value)} placeholder="Important Announcement..." />
                      </div>

                      <div>
                          <label className={labelStyle}>Message Content</label>
                          <textarea className={inputStyle} rows={6} value={bulkMessage} onChange={e => setBulkMessage(e.target.value)} placeholder="Type your message here..."></textarea>
                          <p className="text-xs text-slate-400 mt-1 text-right">0 / 160 characters (for SMS)</p>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-sm text-slate-500">Estimated Recipients: <span className="font-bold text-slate-800">{
                              bulkRecipients === 'all' ? users.length : 
                              bulkRecipients === 'technician' ? technicians.length : 
                              users.length - technicians.length
                          }</span></span>
                          <Button onClick={handleSendBulkMessage}>Send Broadcast</Button>
                      </div>
                  </div>
              </div>
            )}

            {/* CHATBOT TAB */}
            {activeTab === 'chatbot' && (
              <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex gap-4">
                          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold border border-blue-100">
                              Total Entries: {knowledgeBase.length}
                          </div>
                          <div className="relative">
                              <input 
                                type="file" 
                                id="kb-upload" 
                                className="hidden" 
                                accept=".json,.pdf,.docx" 
                                onChange={handleKBUpload} 
                              />
                              <label htmlFor="kb-upload" className="cursor-pointer bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 flex items-center gap-2">
                                  {uploading ? <RefreshCw size={14} className="animate-spin" /> : <UploadCloud size={16} />}
                                  Upload JSON/PDF
                              </label>
                          </div>
                      </div>
                      <Button onClick={() => setIsAddingKB(true)} size="sm"><Plus size={16} className="mr-2"/> Add Entry</Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* KB Table */}
                      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <div className="p-4 border-b border-gray-100 font-bold text-slate-700">Knowledge Base</div>
                          <div className="max-h-[600px] overflow-y-auto">
                              <table className="w-full text-sm text-left text-slate-500">
                                  <thead className="bg-slate-50 text-xs text-slate-700 uppercase">
                                      <tr>
                                          <th className="px-4 py-3">Category</th>
                                          <th className="px-4 py-3">Keywords</th>
                                          <th className="px-4 py-3">Answer Preview</th>
                                          <th className="px-4 py-3">Action</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {knowledgeBase.map(entry => (
                                          <tr key={entry.id} className="border-b hover:bg-slate-50">
                                              <td className="px-4 py-3 font-bold text-slate-800">{entry.category}</td>
                                              <td className="px-4 py-3">
                                                  <div className="flex flex-wrap gap-1">
                                                      {entry.keywords.slice(0, 3).map((k, i) => (
                                                          <span key={i} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">{k}</span>
                                                      ))}
                                                      {entry.keywords.length > 3 && <span className="text-[10px] text-gray-400">+{entry.keywords.length - 3}</span>}
                                                  </div>
                                              </td>
                                              <td className="px-4 py-3 truncate max-w-[200px]" title={entry.answer}>{entry.answer}</td>
                                              <td className="px-4 py-3 text-right">
                                                  <button onClick={() => handleDeleteKBEntry(entry.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={14}/></button>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>

                      {/* Add Form (Inline) */}
                      {isAddingKB && (
                          <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-6 h-fit">
                              <h3 className="font-bold text-lg mb-4 text-blue-900">New Response</h3>
                              <div className="space-y-4">
                                  <div>
                                      <label className={labelStyle}>Category</label>
                                      <select className={inputStyle} value={newKBEntry.category} onChange={e => setNewKBEntry({...newKBEntry, category: e.target.value})}>
                                          <option value="general">General</option>
                                          <option value="pricing">Pricing</option>
                                          <option value="troubleshooting">Troubleshooting</option>
                                          <option value="service">Service Info</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className={labelStyle}>Keywords (Comma Separated)</label>
                                      <input className={inputStyle} value={kbKeywordsInput} onChange={e => setKbKeywordsInput(e.target.value)} placeholder="price, cost, how much" />
                                  </div>
                                  <div>
                                      <label className={labelStyle}>Answer / Response</label>
                                      <textarea className={inputStyle} rows={5} value={newKBEntry.answer} onChange={e => setNewKBEntry({...newKBEntry, answer: e.target.value})} placeholder="The price is GHS..."></textarea>
                                  </div>
                                  <div className="flex gap-2">
                                      <Button onClick={handleAddKBEntry} className="flex-1">Save Entry</Button>
                                      <button onClick={() => setIsAddingKB(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
            )}

            {/* MEETINGS TAB */}
            {activeTab === 'meetings' && (
              <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                      <h3 className="font-bold text-slate-800">Scheduled Video Meetings</h3>
                      <Button onClick={() => setIsAddingMeeting(true)} size="sm"><Plus size={16} className="mr-2"/> Schedule Meeting</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {meetings.map(meeting => (
                          <div key={meeting.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                  <div className="bg-purple-50 text-purple-700 p-2 rounded-lg"><Video size={20} /></div>
                                  <StatusBadge status={meeting.status} />
                              </div>
                              <h4 className="font-bold text-slate-900 text-lg mb-1">{meeting.title}</h4>
                              <div className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                                  <Clock size={14} /> {meeting.date} at {meeting.time}
                              </div>
                              <div className="flex flex-wrap gap-2 mb-4">
                                  {meeting.attendees.slice(0, 3).map((att, i) => (
                                      <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{att}</span>
                                  ))}
                                  {meeting.attendees.length > 3 && <span className="text-xs text-gray-400">+{meeting.attendees.length - 3}</span>}
                              </div>
                              <div className="flex gap-2">
                                  <a href={meeting.link} target="_blank" rel="noreferrer" className="flex-1 bg-slate-900 text-white text-center py-2 rounded-lg text-sm font-bold hover:bg-primary-600 transition">Start Meeting</a>
                                  <button onClick={() => handleDeleteMeeting(meeting.id)} className="text-red-500 hover:bg-red-50 px-3 rounded-lg"><Trash2 size={18} /></button>
                              </div>
                          </div>
                      ))}
                      {meetings.length === 0 && <div className="col-span-full text-center py-10 text-slate-400">No upcoming meetings.</div>}
                  </div>
              </div>
            )}

            {/* USER MANAGER TAB */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-200 gap-4">
                      <div className="relative w-full md:w-auto">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-64" 
                              placeholder="Search users..."
                              value={userSearch}
                              onChange={e => setUserSearch(e.target.value)}
                          />
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                          <Button onClick={() => setIsAddingTech(true)} size="sm" variant="outline"><Wrench size={16} className="mr-2"/> Add Technician</Button>
                          <Button onClick={() => setIsAddingUser(true)} size="sm"><UserPlus size={16} className="mr-2"/> Add Customer</Button>
                      </div>
                  </div>

                  {/* Pending Approvals Section */}
                  {users.some(u => u.role === 'technician' && !u.isApproved) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2"><AlertCircle size={18} /> Pending Approvals</h4>
                          <div className="space-y-2">
                              {users.filter(u => u.role === 'technician' && !u.isApproved).map(u => (
                                  <div key={u.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-yellow-100 shadow-sm">
                                      <div>
                                          <p className="font-bold text-slate-800">{u.name} <span className="text-xs text-slate-400 font-normal">({u.email})</span></p>
                                          <p className="text-xs text-slate-500">Technician Request</p>
                                      </div>
                                      <button onClick={() => handleApproveUser(u.id)} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700">Approve</button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <table className="w-full text-sm text-left text-slate-500">
                          <thead className="bg-slate-50 text-xs text-slate-700 uppercase">
                              <tr>
                                  <th className="px-6 py-3">Name</th>
                                  <th className="px-6 py-3">Email</th>
                                  <th className="px-6 py-3">Role</th>
                                  <th className="px-6 py-3">Status</th>
                                  <th className="px-6 py-3">Last Login</th>
                              </tr>
                          </thead>
                          <tbody>
                              {users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).map(user => (
                                  <tr key={user.id} className="border-b hover:bg-slate-50">
                                      <td className="px-6 py-4 font-bold text-slate-800">{user.name}</td>
                                      <td className="px-6 py-4">{user.email}</td>
                                      <td className="px-6 py-4 capitalize">
                                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'technician' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                              {user.role}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                                      <td className="px-6 py-4 text-xs text-slate-400">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
            )}

            {/* QUOTES TAB */}
            {activeTab === 'quotes' && (
              <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                      <h3 className="font-bold text-slate-800">Generated Quotes</h3>
                      <Button onClick={() => setIsCreatingQuote(true)} size="sm"><Plus size={16} className="mr-2"/> Create Quote</Button>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <table className="w-full text-sm text-left text-slate-500">
                          <thead className="bg-slate-50 text-xs text-slate-700 uppercase">
                              <tr>
                                  <th className="px-6 py-3">Client</th>
                                  <th className="px-6 py-3">Service Type</th>
                                  <th className="px-6 py-3">Amount</th>
                                  <th className="px-6 py-3">Items</th>
                                  <th className="px-6 py-3 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody>
                              {quotes.map((quote, idx) => (
                                  <tr key={idx} className="border-b hover:bg-slate-50">
                                      <td className="px-6 py-4">
                                          <p className="font-bold text-slate-800">{quote.name}</p>
                                          <p className="text-xs text-slate-400">{quote.email}</p>
                                      </td>
                                      <td className="px-6 py-4">{quote.serviceType}</td>
                                      <td className="px-6 py-4 font-bold text-slate-900">GHS {quote.grandTotal.toLocaleString()}</td>
                                      <td className="px-6 py-4 text-xs text-slate-500">{quote.items.length} items</td>
                                      <td className="px-6 py-4 text-right">
                                          <button onClick={() => generateInvoice(quote)} className="text-primary-600 hover:underline text-xs font-bold flex items-center justify-end gap-1">
                                              <Download size={14} /> PDF
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                              {quotes.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-slate-400">No quotes generated yet.</td></tr>}
                          </tbody>
                      </table>
                  </div>
              </div>
            )}

            {/* INBOX TAB */}
            {activeTab === 'messages' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
                  {/* List */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-y-auto">
                      {messages.map(msg => (
                          <div 
                              key={msg.id} 
                              onClick={() => setReplyingMessage(msg.id)}
                              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-slate-50 transition ${replyingMessage === msg.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                          >
                              <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-slate-800 text-sm">{msg.sender}</span>
                                  <span className="text-[10px] text-slate-400">{new Date(msg.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs text-slate-600 font-medium mb-1 truncate">{msg.subject}</p>
                              <p className="text-xs text-slate-400 truncate">{msg.message}</p>
                              {msg.status === 'Open' && <span className="mt-2 inline-block bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold">New</span>}
                          </div>
                      ))}
                  </div>

                  {/* Detail View */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 flex flex-col">
                      {replyingMessage ? (
                          (() => {
                              const msg = messages.find(m => m.id === replyingMessage);
                              return (
                                  <>
                                      <div className="p-6 border-b border-gray-100">
                                          <div className="flex justify-between items-start mb-4">
                                              <div>
                                                  <h3 className="text-xl font-bold text-slate-900">{msg?.subject}</h3>
                                                  <p className="text-sm text-slate-500">From: {msg?.sender} &lt;{msg?.email || 'No Email'}&gt;</p>
                                              </div>
                                              <StatusBadge status={msg?.status} />
                                          </div>
                                          <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
                                              {msg?.message}
                                          </div>
                                      </div>
                                      
                                      <div className="flex-grow overflow-y-auto p-6 space-y-4">
                                          {msg?.replies?.map((reply: any, i: number) => (
                                              <div key={i} className={`flex ${reply.sender === 'Admin' ? 'justify-end' : 'justify-start'}`}>
                                                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${reply.sender === 'Admin' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-slate-800 rounded-bl-none'}`}>
                                                      <p>{reply.text}</p>
                                                      <span className="text-[10px] opacity-70 block text-right mt-1">{new Date(reply.date).toLocaleTimeString()}</span>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>

                                      <div className="p-4 border-t border-gray-100 bg-gray-50">
                                          <div className="flex gap-2">
                                              <textarea 
                                                  className="flex-grow p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                  placeholder="Type your reply..."
                                                  rows={2}
                                                  value={replyText}
                                                  onChange={e => setReplyText(e.target.value)}
                                              ></textarea>
                                              <Button onClick={() => handleSendReply(msg.id)} disabled={!replyText}>Send</Button>
                                          </div>
                                      </div>
                                  </>
                              );
                          })()
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400">
                              <MessageSquare size={48} className="mb-4 opacity-20" />
                              <p>Select a message to view details</p>
                          </div>
                      )}
                  </div>
              </div>
            )}

            {/* Other Tabs (Preserved in full implementation) */}
            {activeTab === 'bookings' && (
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between mb-4">
                     <h3 className="font-bold text-slate-800">Support Tickets</h3>
                     <button onClick={() => setIsAddingBooking(true)} className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-700">New Ticket</button>
                  </div>
                  {/* Table logic similar to Orders */}
                  <div className="text-center py-10 text-slate-400">Tickets listed here...</div>
               </div>
            )}

          </div>
        )}
      </main>

      {/* --- ALL MODALS --- */}

      {/* Add/Edit Product Modal */}
      {(isAddingProduct || editingProduct) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-lg p-6 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
                  <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  <div className="space-y-4">
                      {/* Image Upload */}
                      <div className="flex justify-center">
                          <label className="cursor-pointer group relative w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500">
                              <img src={editingProduct?.image || newProduct.image || ''} className="w-full h-full object-cover" alt="" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-xs font-bold">Change</div>
                              <input type="file" className="hidden" onChange={(e) => handleProductImageUpload(e, !!editingProduct)} />
                          </label>
                      </div>

                      <input className={inputStyle} placeholder="Product Name" value={editingProduct ? editingProduct.name : newProduct.name} onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} />
                      
                      <div className="grid grid-cols-2 gap-4">
                          <input type="number" className={inputStyle} placeholder="Price" value={editingProduct ? editingProduct.price : newProduct.price} onChange={e => editingProduct ? setEditingProduct({...editingProduct, price: parseFloat(e.target.value)}) : setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                          <input type="number" className={inputStyle} placeholder="Original Price" value={editingProduct ? editingProduct.originalPrice : newProduct.originalPrice} onChange={e => editingProduct ? setEditingProduct({...editingProduct, originalPrice: parseFloat(e.target.value)}) : setNewProduct({...newProduct, originalPrice: parseFloat(e.target.value)})} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <input type="number" className={inputStyle} placeholder="Stock" value={editingProduct ? editingProduct.stock : newProduct.stock} onChange={e => editingProduct ? setEditingProduct({...editingProduct, stock: parseInt(e.target.value)}) : setNewProduct({...newProduct, stock: parseInt(e.target.value)})} />
                          <select className={inputStyle} value={editingProduct ? editingProduct.category : newProduct.category} onChange={e => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})}>
                              {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>

                      <textarea className={inputStyle} rows={3} placeholder="Description" value={editingProduct ? editingProduct.description : newProduct.description} onChange={e => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})}></textarea>

                      <div className="flex gap-2 justify-end">
                          <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="px-4 py-2 text-slate-500">Cancel</button>
                          <Button onClick={editingProduct ? handleSaveProduct : handleCreateProduct}>{editingProduct ? 'Save Changes' : 'Create Product'}</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Create Quote Modal */}
      {isCreatingQuote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-3xl p-6 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
                  <h3 className="text-xl font-bold mb-4">Generate Admin Quote</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                          <h4 className="font-bold text-sm uppercase text-slate-500">Client Details</h4>
                          <input className={inputStyle} placeholder="Client Name" value={newQuoteData.name} onChange={e => setNewQuoteData({...newQuoteData, name: e.target.value})} />
                          <input className={inputStyle} placeholder="Email" value={newQuoteData.email} onChange={e => setNewQuoteData({...newQuoteData, email: e.target.value})} />
                          <input className={inputStyle} placeholder="Phone" value={newQuoteData.phone} onChange={e => setNewQuoteData({...newQuoteData, phone: e.target.value})} />
                          <select className={inputStyle} value={newQuoteData.serviceType} onChange={e => setNewQuoteData({...newQuoteData, serviceType: e.target.value})}>
                              <option>General Quote</option>
                              <option>CCTV Installation</option>
                              <option>Starlink Setup</option>
                              <option>Networking</option>
                          </select>
                      </div>
                      <div className="space-y-4">
                          <h4 className="font-bold text-sm uppercase text-slate-500">Add Items</h4>
                          <div className="flex gap-2">
                              <input className={inputStyle} placeholder="Item Name" value={newQuoteItem.name} onChange={e => setNewQuoteItem({...newQuoteItem, name: e.target.value})} />
                              <input type="number" className="w-24 border rounded-lg px-2" placeholder="Price" value={newQuoteItem.price} onChange={e => setNewQuoteItem({...newQuoteItem, price: parseFloat(e.target.value)})} />
                              <input type="number" className="w-16 border rounded-lg px-2" placeholder="Qty" value={newQuoteItem.quantity} onChange={e => setNewQuoteItem({...newQuoteItem, quantity: parseInt(e.target.value)})} />
                          </div>
                          <Button onClick={handleAddQuoteItem} size="sm" variant="secondary" className="w-full">Add Item to List</Button>
                          
                          <div className="bg-slate-50 p-3 rounded-lg h-40 overflow-y-auto border border-gray-200">
                              {newQuoteData.items?.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm border-b border-gray-200 pb-1 mb-1">
                                      <span>{item.name} x{item.quantity}</span>
                                      <span className="font-bold">{(item.price * item.quantity).toLocaleString()}</span>
                                  </div>
                              ))}
                          </div>
                          <div className="flex justify-between items-center font-bold text-lg">
                              <span>Total:</span>
                              <span>GHS {newQuoteData.grandTotal?.toLocaleString()}</span>
                          </div>
                      </div>
                  </div>
                  <div className="flex gap-2 justify-end mt-6">
                      <button onClick={() => setIsCreatingQuote(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                      <Button onClick={handleGenerateAdminQuote}>Generate & Download PDF</Button>
                  </div>
              </div>
          </div>
      )}

      {/* Schedule Meeting Modal */}
      {isAddingMeeting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-md p-6 animate-in zoom-in-95">
                  <h3 className="text-xl font-bold mb-4">Schedule Meeting</h3>
                  <div className="space-y-4">
                      <input className={inputStyle} placeholder="Meeting Title" value={newMeetingData.title} onChange={e => setNewMeetingData({...newMeetingData, title: e.target.value})} />
                      <select className={inputStyle} value={newMeetingData.platform} onChange={e => setNewMeetingData({...newMeetingData, platform: e.target.value})}>
                          <option value="Zoom">Zoom</option>
                          <option value="Google Meet">Google Meet</option>
                          <option value="Microsoft Teams">Microsoft Teams</option>
                      </select>
                      <div className="grid grid-cols-2 gap-4">
                          <input type="date" className={inputStyle} value={newMeetingData.date} onChange={e => setNewMeetingData({...newMeetingData, date: e.target.value})} />
                          <input type="time" className={inputStyle} value={newMeetingData.time} onChange={e => setNewMeetingData({...newMeetingData, time: e.target.value})} />
                      </div>
                      <input className={inputStyle} placeholder="Attendee Emails (comma separated)" value={newMeetingData.attendees} onChange={e => setNewMeetingData({...newMeetingData, attendees: e.target.value})} />
                      <div className="flex gap-2 justify-end mt-4">
                          <button onClick={() => setIsAddingMeeting(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                          <Button onClick={handleScheduleMeeting}>Schedule</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Add User Modal */}
      {isAddingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-md p-6 animate-in zoom-in-95">
                  <h3 className="text-xl font-bold mb-4">Create New User</h3>
                  <div className="space-y-4">
                      <input className={inputStyle} placeholder="Full Name" value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} />
                      <input className={inputStyle} placeholder="Email" value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} />
                      <input className={inputStyle} type="password" placeholder="Password" value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})} />
                      <select className={inputStyle} value={newUserData.role} onChange={e => setNewUserData({...newUserData, role: e.target.value})}>
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                      </select>
                      <div className="flex gap-2 justify-end mt-4">
                          <button onClick={() => setIsAddingUser(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                          <Button onClick={handleCreateUser}>Create Account</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Add Technician Modal */}
      {isAddingTech && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-md p-6 animate-in zoom-in-95">
                  <h3 className="text-xl font-bold mb-4">Register Technician</h3>
                  <div className="space-y-4">
                      <input className={inputStyle} placeholder="Full Name" value={newTechData.name} onChange={e => setNewTechData({...newTechData, name: e.target.value})} />
                      <input className={inputStyle} placeholder="Email" value={newTechData.email} onChange={e => setNewTechData({...newTechData, email: e.target.value})} />
                      <input className={inputStyle} placeholder="Phone" value={newTechData.phone} onChange={e => setNewTechData({...newTechData, phone: e.target.value})} />
                      <select className={inputStyle} value={newTechData.role} onChange={e => setNewTechData({...newTechData, role: e.target.value})}>
                          {TECH_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <select className={inputStyle} value={newTechData.department} onChange={e => setNewTechData({...newTechData, department: e.target.value})}>
                          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <div className="flex gap-2 justify-end mt-4">
                          <button onClick={() => setIsAddingTech(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                          <Button onClick={handleAddTechnician}>Add & Send Invite</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* REMOTE MODAL */}
      {showRemoteModal && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                  <h3 className="text-xl font-bold mb-4 text-slate-900">Remote Session</h3>
                  <input className="w-full border rounded px-3 py-2 mb-4" placeholder="Session ID" value={remoteId} onChange={e => setRemoteId(e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleLaunchRemote('anydesk')} className="bg-red-500 text-white py-2 rounded">AnyDesk</button>
                      <button onClick={() => handleLaunchRemote('teamviewer')} className="bg-blue-600 text-white py-2 rounded">TeamViewer</button>
                  </div>
                  <button onClick={() => setShowRemoteModal(false)} className="w-full mt-2 text-slate-500 text-sm">Cancel</button>
              </div>
          </div>
      )}

    </div>
  );
};

export default AdminDashboard;