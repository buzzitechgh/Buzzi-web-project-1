import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, ShoppingBag, Package, RefreshCw, LayoutDashboard, 
  Calendar, MessageSquare, FileText, TrendingUp, Users, DollarSign,
  Phone, Mail, Clock, CheckCircle, AlertCircle, Edit2, Image, Save, X, Ticket,
  Settings, CreditCard, Webhook, Server, Plus, Star, Link as LinkIcon, Upload, UserPlus, Truck, Monitor, Video, ShieldCheck, Trash2,
  Bot, FileJson, UploadCloud, Smartphone, Radio, Activity, Eye, File, Megaphone, UserCog, MoreVertical, Briefcase, Download, Building, ArrowRight, Smile, Paperclip, Lock, Key, Send, Search, Filter, MapPin, EyeOff
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
      name: '', price: 0, originalPrice: 0, stock: 0, brand: '', category: 'General', description: '', image: '', features: [] 
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

  const handleLaunchRemote = (tool: 'anydesk' | 'teamviewer') => {
      if (!remoteId) {
          alert("Please enter a Session ID");
          return;
      }
      
      const cleanId = remoteId.replace(/\s/g, ''); // Remove spaces
      
      // Attempt to launch application via custom protocol URI
      let protocolUrl = '';
      let fallbackUrl = '';

      if (tool === 'anydesk') {
          protocolUrl = `anydesk:${cleanId}`;
          fallbackUrl = 'https://anydesk.com/en/downloads';
      } else {
          // TeamViewer protocol (standard is teamviewer10 or 8 usually)
          protocolUrl = `teamviewer8://${cleanId}`; 
          fallbackUrl = 'https://www.teamviewer.com/en/download/';
      }
      
      // Try to open protocol
      window.location.href = protocolUrl;

      // Set a fallback timeout if the app doesn't open (user might not have it installed)
      setTimeout(() => {
         const confirmDownload = window.confirm(`It seems ${tool} didn't open. Do you want to download it?`);
         if (confirmDownload) {
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
          setNewProduct({ name: '', price: 0, originalPrice: 0, stock: 0, brand: '', category: 'General', description: '', image: '', features: [] });
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
  
  // Analytics Data
  const techPerformance = technicians.map(t => t.jobsCompleted || 0);
  const techNames = technicians.map(t => t.name.split(' ')[0]);
  const customerRatings = [5, 4, 3, 2, 1].map(r => technicians.reduce((acc, t) => acc + (t.reviews?.filter(rv => Math.round(rv.rating) === r).length || 0), 0));
  
  // Specific Requested Counts
  const totalTechs = technicians.length;
  const totalUsers = users.length;
  const otpsGenerated = bookings.filter(b => b.completionCode).length;
  // Estimate 'Job Assigned' by counting pending or in-progress tasks that have a technician assigned
  const activeJobsCount = bookings.filter(b => (b.status === 'In Progress' || b.status === 'Assigned') && b.technician).length;

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
                            <Button onClick={() => setIsAddingTech(!isAddingTech)} variant="secondary" size="sm">
                                {isAddingTech ? "Cancel" : <><UserPlus size={16} className="mr-2" /> Add Technician</>}
                            </Button>
                            <Button onClick={() => setIsAddingBooking(!isAddingBooking)} size="sm">
                                {isAddingBooking ? "Close Form" : <><Plus size={16} className="mr-2" /> Create Job Ticket</>}
                            </Button>
                        </div>
                    </div>

                    {/* Add Technician Form */}
                    {isAddingTech && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200 mb-6 animate-in slide-in-from-top-4">
                            <h4 className="font-bold mb-4 text-lg text-slate-800 border-b pb-2 flex items-center gap-2">
                                <UserCog className="text-blue-600" /> Register New Technician
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelStyle}>Full Name</label>
                                    <input className={inputStyle} value={newTechData.name} onChange={e => setNewTechData({...newTechData, name: e.target.value})} placeholder="Tech Name" />
                                </div>
                                <div>
                                    <label className={labelStyle}>Email Address</label>
                                    <input className={inputStyle} value={newTechData.email} onChange={e => setNewTechData({...newTechData, email: e.target.value})} placeholder="tech@company.com" />
                                </div>
                                <div>
                                    <label className={labelStyle}>Phone Number</label>
                                    <input className={inputStyle} value={newTechData.phone || ''} onChange={e => setNewTechData({...newTechData, phone: e.target.value})} placeholder="050..." />
                                </div>
                                <div>
                                    <label className={labelStyle}>Role</label>
                                    <select className={inputStyle} value={newTechData.role} onChange={e => setNewTechData({...newTechData, role: e.target.value})}>
                                        {TECH_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelStyle}>Department</label>
                                    <select className={inputStyle} value={newTechData.department} onChange={e => setNewTechData({...newTechData, department: e.target.value})}>
                                        {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button onClick={() => setIsAddingTech(false)} className="px-6 py-2 text-slate-500 hover:bg-slate-50 rounded-lg transition">Cancel</button>
                                <Button onClick={handleAddTechnician}>Register Technician</Button>
                            </div>
                        </div>
                    )}

                    {/* New Booking Form */}
                    {isAddingBooking && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-primary-200 mb-6 animate-in slide-in-from-top-4">
                            <h4 className="font-bold mb-4 text-lg text-slate-800 border-b pb-2 flex items-center gap-2">
                                <Briefcase className="text-primary-600" /> Create New Job Ticket
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Customer Selection */}
                                <div>
                                    <label className={labelStyle}>Select Pending User / Client</label>
                                    <select 
                                        className={inputStyle} 
                                        onChange={(e) => handleUserSelectForTicket(e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Choose a customer...</option>
                                        <option value="new">-- Enter Manually --</option>
                                        {users.filter(u => u.role === 'customer').map(user => (
                                            <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelStyle}>Client Name</label>
                                    <input className={inputStyle} value={newBookingData.name} onChange={e => setNewBookingData({...newBookingData, name: e.target.value})} placeholder="Full Name" />
                                </div>

                                <div>
                                    <label className={labelStyle}>Contact Email</label>
                                    <input className={inputStyle} value={newBookingData.email} onChange={e => setNewBookingData({...newBookingData, email: e.target.value})} placeholder="Email Address" />
                                </div>

                                <div>
                                    <label className={labelStyle}>Contact Phone</label>
                                    <input className={inputStyle} value={newBookingData.phone} onChange={e => setNewBookingData({...newBookingData, phone: e.target.value})} placeholder="050..." />
                                </div>

                                <div className="lg:col-span-2">
                                    <label className={labelStyle}>Job Description / Service Type</label>
                                    <textarea 
                                        className={inputStyle} 
                                        rows={2}
                                        placeholder="e.g. Starlink Installation at East Legon, Roof Mounting required." 
                                        value={newBookingData.serviceType} 
                                        onChange={e => setNewBookingData({...newBookingData, serviceType: e.target.value})} 
                                    />
                                </div>

                                <div>
                                    <label className={labelStyle}>Schedule Date</label>
                                    <input className={inputStyle} type="date" value={newBookingData.date} onChange={e => setNewBookingData({...newBookingData, date: e.target.value})} />
                                </div>

                                <div>
                                    <label className={labelStyle}>Schedule Time</label>
                                    <input className={inputStyle} type="time" value={newBookingData.time} onChange={e => setNewBookingData({...newBookingData, time: e.target.value})} />
                                </div>

                                <div>
                                    <label className={labelStyle}>Assign Technician (Optional)</label>
                                    <select 
                                        className={inputStyle}
                                        value={newBookingData.technician}
                                        onChange={e => setNewBookingData({...newBookingData, technician: e.target.value})}
                                    >
                                        <option value="">-- Unassigned --</option>
                                        {technicians.map(t => <option key={t.id} value={t.name}>{t.name} ({t.status})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button onClick={() => setIsAddingBooking(false)} className="px-6 py-2 text-slate-500 hover:bg-slate-50 rounded-lg transition">Cancel</button>
                                <Button onClick={handleCreateBooking} disabled={isSubmitting}>
                                    {isSubmitting ? "Creating & Notifying..." : "Create Ticket & Notify"}
                                </Button>
                            </div>
                            <p className="text-xs text-center text-slate-400 mt-2">
                                <CheckCircle size={12} className="inline mr-1" />
                                Automations: OTP generated, SMS/Email sent to Client & Technician.
                            </p>
                        </div>
                    )}

                    {/* Tickets Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-700 text-xs uppercase border-b">
                                <tr>
                                    <th className="p-4">Ticket ID</th>
                                    <th className="p-4">Subject & Client</th>
                                    <th className="p-4">Assignee</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">OTP Code</th>
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
                                            <select 
                                                className="border border-gray-300 rounded p-1 text-xs bg-white text-slate-900 w-full max-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={booking.technician || 'Unassigned'}
                                                onChange={(e) => handleAssignTechnician(booking.id, e.target.value)}
                                            >
                                                <option value="Unassigned">Unassigned</option>
                                                {technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                className="border border-gray-300 rounded p-1 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={booking.status}
                                                onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => toggleOtpVisibility(booking.id)}
                                                className="flex items-center gap-2 font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold tracking-widest text-xs border border-slate-200 hover:bg-slate-200 transition"
                                                title="Click to reveal/hide"
                                            >
                                                {booking.completionCode ? (
                                                    <>
                                                        {revealedOtps[booking.id] ? booking.completionCode : '****'}
                                                        {revealedOtps[booking.id] ? <EyeOff size={10} /> : <Eye size={10} />}
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleDeleteBooking(booking.id)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                    title="Delete Ticket"
                                                >
                                                    <Trash2 size={18} />
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

            {/* MESSAGES TAB */}
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

            {/* CHATBOT & AI TAB */}
            {activeTab === 'chatbot' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">AI Knowledge Base</h3>
                            <p className="text-sm text-slate-500">Train the chatbot to answer common questions automatically.</p>
                        </div>
                        <div className="flex gap-2">
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
                                <UploadCloud size={16} /> Import JSON/PDF
                                <input type="file" className="hidden" onChange={handleKBUpload} accept=".json,.pdf,.docx" />
                            </label>
                            <Button onClick={() => setIsAddingKB(!isAddingKB)} size="sm">
                                {isAddingKB ? "Close Editor" : <><Plus size={16} className="mr-2" /> Add Entry</>}
                            </Button>
                        </div>
                    </div>

                    {/* KB Editor */}
                    {isAddingKB && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-primary-200 mb-6 animate-in slide-in-from-top-4">
                            <h4 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2"><Bot size={18} /> New Knowledge Entry</h4>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelStyle}>Category</label>
                                        <select 
                                            className={inputStyle}
                                            value={newKBEntry.category}
                                            onChange={e => setNewKBEntry({...newKBEntry, category: e.target.value})}
                                        >
                                            <option value="general">General Info</option>
                                            <option value="pricing">Pricing & Services</option>
                                            <option value="troubleshooting">Troubleshooting</option>
                                            <option value="support">Support Policies</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Keywords (Comma Separated)</label>
                                        <input 
                                            className={inputStyle} 
                                            placeholder="e.g. price, cost, how much"
                                            value={kbKeywordsInput}
                                            onChange={e => setKbKeywordsInput(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelStyle}>AI Response / Answer</label>
                                    <textarea 
                                        className={inputStyle} 
                                        rows={3}
                                        placeholder="The AI will respond with this text..."
                                        value={newKBEntry.answer}
                                        onChange={e => setNewKBEntry({...newKBEntry, answer: e.target.value})}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button onClick={handleAddKBEntry}>Save Entry</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Knowledge Base Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-700 text-xs uppercase border-b">
                                <tr>
                                    <th className="p-4 w-1/6">Category</th>
                                    <th className="p-4 w-1/4">Keywords</th>
                                    <th className="p-4">Response</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-100">
                                {knowledgeBase.map(entry => (
                                    <tr key={entry.id} className="hover:bg-slate-50">
                                        <td className="p-4">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">{entry.category}</span>
                                        </td>
                                        <td className="p-4 text-slate-500 italic">
                                            {entry.keywords.join(", ")}
                                        </td>
                                        <td className="p-4 text-slate-800 whitespace-pre-wrap">
                                            {entry.answer.length > 100 ? entry.answer.substring(0, 100) + "..." : entry.answer}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleDeleteKBEntry(entry.id)}
                                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {knowledgeBase.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-400">Knowledge base is empty. Add entries to train the AI.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
                                <input className={inputStyle} placeholder="Client Name" value={newQuoteData.name} onChange={e => setNewQuoteData({...newQuoteData, name: e.target.value})} />
                                <input className={inputStyle} placeholder="Client Email" value={newQuoteData.email} onChange={e => setNewQuoteData({...newQuoteData, email: e.target.value})} />
                                <input className={inputStyle} placeholder="Client Phone" value={newQuoteData.phone} onChange={e => setNewQuoteData({...newQuoteData, phone: e.target.value})} />
                            </div>

                            {/* Add Item */}
                            <div className="bg-slate-50 p-4 rounded-lg border mb-4">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Add Line Item</p>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <input className={`${inputStyle} md:col-span-2`} placeholder="Item Name / Service" value={newQuoteItem.name} onChange={e => setNewQuoteItem({...newQuoteItem, name: e.target.value})} />
                                    <input className={inputStyle} type="number" placeholder="Price" value={newQuoteItem.price || ''} onChange={e => setNewQuoteItem({...newQuoteItem, price: Number(e.target.value)})} />
                                    <input className={inputStyle} type="number" placeholder="Qty" value={newQuoteItem.quantity} onChange={e => setNewQuoteItem({...newQuoteItem, quantity: Number(e.target.value)})} />
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
                                        <th className="p-4">Date</th>
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
                                            <td className="p-4 text-slate-500">{new Date(quote.date).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <button 
                                                    onClick={() => generateInvoice(quote)}
                                                    className="flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium text-xs bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded transition"
                                                >
                                                    <Download size={14} /> PDF
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

            {/* INVENTORY TAB - ENHANCED FORM */}
            {activeTab === 'inventory' && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h3 className="text-lg font-bold text-slate-800">Product Inventory</h3>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-grow md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search name, brand, category..." 
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 bg-white"
                                    value={inventorySearch}
                                    onChange={(e) => setInventorySearch(e.target.value)}
                                />
                            </div>
                            <Button onClick={() => setIsAddingProduct(!isAddingProduct)} size="sm" className="whitespace-nowrap">
                                {isAddingProduct ? "Cancel" : "Add Product"}
                            </Button>
                        </div>
                    </div>

                    {(isAddingProduct || editingProduct) && (
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 mb-6 animate-in fade-in slide-in-from-top-4">
                            <h4 className="font-bold text-xl mb-6 text-slate-900 pb-2 border-b">{editingProduct ? "Edit Product Details" : "Add New Product"}</h4>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Col: Image */}
                                <div className="lg:col-span-1">
                                    <label className={labelStyle}>Product Image</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center min-h-[200px] bg-slate-50 hover:bg-slate-100 transition relative overflow-hidden group">
                                        {(editingProduct?.image || newProduct.image) ? (
                                            <img src={editingProduct?.image || newProduct.image} alt="Product" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <Image size={40} className="mx-auto mb-2" />
                                                <p className="text-xs">Click to upload or drag image</p>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                            onChange={(e) => handleProductImageUpload(e, !!editingProduct)}
                                        />
                                        {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><RefreshCw className="animate-spin text-primary-600"/></div>}
                                    </div>
                                    <div className="mt-2 text-xs text-slate-400 text-center">Supported: JPG, PNG, WEBP</div>
                                </div>

                                {/* Right Col: Details */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelStyle}>Product Name</label>
                                            <input className={inputStyle} 
                                                value={editingProduct ? editingProduct.name : newProduct.name} 
                                                onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} 
                                                placeholder="e.g. Starlink Standard Kit"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Brand</label>
                                            <input className={inputStyle} 
                                                value={editingProduct ? editingProduct.brand : newProduct.brand} 
                                                onChange={e => editingProduct ? setEditingProduct({...editingProduct, brand: e.target.value}) : setNewProduct({...newProduct, brand: e.target.value})} 
                                                placeholder="e.g. SpaceX, Hikvision"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={labelStyle}>Category</label>
                                            <select className={inputStyle}
                                                value={editingProduct ? editingProduct.category : newProduct.category} 
                                                onChange={e => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})}
                                            >
                                                {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Stock Qty</label>
                                            <input type="number" className={inputStyle}
                                                value={editingProduct ? editingProduct.stock : newProduct.stock} 
                                                onChange={e => editingProduct ? setEditingProduct({...editingProduct, stock: parseInt(e.target.value)}) : setNewProduct({...newProduct, stock: parseInt(e.target.value)})} 
                                            />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Price (GHS)</label>
                                            <input type="number" className={inputStyle}
                                                value={editingProduct ? editingProduct.price : newProduct.price} 
                                                onChange={e => editingProduct ? setEditingProduct({...editingProduct, price: parseFloat(e.target.value)}) : setNewProduct({...newProduct, price: parseFloat(e.target.value)})} 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelStyle}>Original Price (Set higher to show discount)</label>
                                        <input type="number" className={inputStyle}
                                            value={editingProduct ? editingProduct.originalPrice : newProduct.originalPrice} 
                                            onChange={e => editingProduct ? setEditingProduct({...editingProduct, originalPrice: parseFloat(e.target.value)}) : setNewProduct({...newProduct, originalPrice: parseFloat(e.target.value)})} 
                                            placeholder="Optional"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelStyle}>Description</label>
                                        <textarea rows={3} className={inputStyle}
                                            value={editingProduct ? editingProduct.description : newProduct.description} 
                                            onChange={e => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} 
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="px-6 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
                                        <Button onClick={editingProduct ? handleSaveProduct : handleCreateProduct}>
                                            <Save size={18} className="mr-2" /> Save Product
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.filter(product => 
                            product.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                            product.category.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                            (product.brand && product.brand.toLowerCase().includes(inventorySearch.toLowerCase()))
                        ).map(product => (
                            <div key={product.id} className="bg-white border rounded-xl p-4 flex flex-col hover:shadow-md transition group">
                                <div className="h-40 flex items-center justify-center bg-gray-50 rounded-lg mb-4 p-2">
                                    <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="mb-2">
                                    <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1">{product.name}</h4>
                                    <p className="text-xs text-slate-500">{product.brand} • {product.category}</p>
                                </div>
                                <div className="flex justify-between items-end mt-auto">
                                    <div>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <span className="text-xs text-slate-400 line-through block">GHS {product.originalPrice}</span>
                                        )}
                                        <span className="font-bold text-primary-600">GHS {product.price}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-1 rounded font-bold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {product.stock} Stock
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setEditingProduct(product)} className="mt-3 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1">
                                    <Edit2 size={12} /> Edit
                                </button>
                            </div>
                        ))}
                        {products.filter(product => 
                            product.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                            product.category.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                            (product.brand && product.brand.toLowerCase().includes(inventorySearch.toLowerCase()))
                        ).length === 0 && (
                            <div className="col-span-full text-center py-10 text-slate-400">
                                <Search size={40} className="mx-auto mb-2 opacity-20" />
                                <p>No products found matching "{inventorySearch}"</p>
                            </div>
                        )}
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
                                <input className={inputStyle} placeholder="Meeting Title" value={newMeetingData.title} onChange={e => setNewMeetingData({...newMeetingData, title: e.target.value})} />
                                <select 
                                    className={inputStyle} 
                                    value={newMeetingData.platform} 
                                    onChange={e => setNewMeetingData({...newMeetingData, platform: e.target.value as any})}
                                >
                                    <option value="Zoom">Zoom</option>
                                    <option value="Teams">Microsoft Teams</option>
                                </select>
                                <input className={inputStyle} type="date" value={newMeetingData.date} onChange={e => setNewMeetingData({...newMeetingData, date: e.target.value})} />
                                <input className={inputStyle} type="time" value={newMeetingData.time} onChange={e => setNewMeetingData({...newMeetingData, time: e.target.value})} />
                                <input className={inputStyle} placeholder="Attendee Emails (comma separated)" value={newMeetingData.attendees} onChange={e => setNewMeetingData({...newMeetingData, attendees: e.target.value})} />
                            </div>
                            <Button onClick={handleScheduleMeeting} size="sm">Schedule</Button>
                        </div>
                    )}

                    {/* Chat Interface - Admin/User */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8 p-6">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Internal Communication</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
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
                                        <div className="flex-grow overflow-y-auto bg-slate-50 rounded-lg p-4 mb-3 space-y-3 border border-gray-200">
                                            {internalChats
                                                .filter(c => (c.senderId === chatTarget.id && c.receiverId === 'admin') || (c.senderId === 'admin' && c.receiverId === chatTarget.id))
                                                .map(chat => (
                                                <div key={chat.id} className={`flex ${chat.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`p-3 rounded-xl max-w-[70%] text-sm shadow-sm ${chat.senderId === 'admin' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white border text-slate-800 rounded-bl-none'}`}>
                                                        <p>{chat.message}</p>
                                                        <span className="text-[10px] opacity-70 block text-right mt-1">{new Date(chat.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={chatEndRef}></div>
                                        </div>
                                        
                                        {/* Updated Chat Input Area with Upload and Emoji */}
                                        <div className="relative">
                                            {showEmojiPicker && (
                                                <div className="absolute bottom-14 left-0 bg-white shadow-xl border rounded-xl p-3 grid grid-cols-6 gap-2 z-10 w-64 animate-in slide-in-from-bottom-2">
                                                    {emojis.map(e => (
                                                        <button key={e} onClick={() => handleEmojiClick(e)} className="text-xl p-1 hover:bg-slate-100 rounded transition">
                                                            {e}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-2 py-2">
                                                <input 
                                                    type="file" 
                                                    ref={fileInputRef} 
                                                    className="hidden" 
                                                    onChange={handleFileChange} 
                                                />
                                                <button 
                                                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-gray-100 transition" 
                                                    title="Attach File"
                                                    onClick={handleAttachClick}
                                                >
                                                    <Paperclip size={18} />
                                                </button>
                                                <button 
                                                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-gray-100 transition" 
                                                    title="Add Emoji"
                                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                >
                                                    <Smile size={18} />
                                                </button>
                                                <input 
                                                    className="flex-grow bg-transparent border-none text-sm focus:ring-0 text-slate-800 placeholder:text-slate-400 px-2 outline-none" 
                                                    placeholder={`Message ${chatTarget.name}...`}
                                                    value={internalMessage}
                                                    onChange={e => setInternalMessage(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleInternalChat()}
                                                />
                                                <Button onClick={handleInternalChat} size="sm" className="rounded-lg px-4">Send</Button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 bg-slate-50 rounded-xl border border-dashed border-gray-200">
                                        <div className="text-center">
                                            <MessageSquare size={40} className="mx-auto mb-2 opacity-20" />
                                            <p>Select a user to start chatting</p>
                                        </div>
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
                                    <label className={labelStyle}>Select Image Area</label>
                                    <select 
                                        className={inputStyle} 
                                        value={selectedImageKey} 
                                        onChange={(e) => setSelectedImageKey(e.target.value)}
                                    >
                                        {MEDIA_LOCATIONS.map(loc => <option key={loc.key} value={loc.key}>{loc.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelStyle}>Image URL</label>
                                    <input 
                                        className={inputStyle} 
                                        value={currentImageUrl} 
                                        onChange={(e) => setCurrentImageUrl(e.target.value)} 
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className={labelStyle}>Or Upload New</label>
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

            {/* USERS MANAGEMENT TAB */}
            {activeTab === 'users' && (
                <div className="space-y-8">
                    {/* User Manager Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <Users className="text-primary-600" size={24} /> User Directory
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">Manage user roles, access, and account status.</p>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <div className="relative flex-grow md:flex-grow-0">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input 
                                            type="text" 
                                            placeholder="Search users..." 
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={() => setIsAddingUser(!isAddingUser)} size="sm" className="whitespace-nowrap">
                                        {isAddingUser ? "Cancel" : <><UserPlus size={16} className="mr-2" /> Add User</>}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {isAddingUser && (
                            <div className="bg-slate-50 p-6 border-b border-gray-100 animate-in slide-in-from-top-2">
                                <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Create New Account</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Full Name</label>
                                        <input className={inputStyle} type="text" placeholder="John Doe" value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Email Address</label>
                                        <input className={inputStyle} type="email" placeholder="john@example.com" value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Password</label>
                                        <input className={inputStyle} type="password" placeholder="••••••••" value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Role</label>
                                        <select className={inputStyle} value={newUserData.role} onChange={e => setNewUserData({...newUserData, role: e.target.value})}>
                                            <option value="customer">Customer</option>
                                            <option value="technician">Technician</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleCreateUser} size="sm">Create Account</Button>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">User Identity</th>
                                        <th className="px-6 py-4">Role & Access</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Activity</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {users.filter(u => 
                                        u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                                        u.email.toLowerCase().includes(userSearch.toLowerCase())
                                    ).map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm
                                                        ${user.role === 'admin' ? 'bg-purple-600' : user.role === 'technician' ? 'bg-blue-600' : 'bg-slate-400'}
                                                    `}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
                                                        <p className="text-xs text-slate-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border
                                                    ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                                      user.role === 'technician' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                                      'bg-green-50 text-green-700 border-green-100'}
                                                `}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isOnline ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="relative flex h-2 w-2">
                                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                        </span>
                                                        <span className="text-xs font-medium text-green-700">Online</span>
                                                        {user.location && <span className="text-[10px] text-slate-400 border px-1 rounded bg-white">{user.location}</span>}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                                                        <span className="text-xs text-slate-500">Offline</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-700">Last Login:</span>
                                                    <span>{user.lastLogin && user.lastLogin !== 'Never' ? new Date(user.lastLogin).toLocaleString() : 'Never'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => api.updateUserRole(user.id, user.role === 'admin' ? 'customer' : 'admin')}
                                                    className="text-xs font-medium text-primary-600 hover:text-primary-800 hover:underline transition-colors"
                                                >
                                                    Modify Role
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">No users found matching your search.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* LOGIN LOGS SECTION */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <ShieldCheck className="text-green-600" size={24} /> Security & Audit Logs
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Recent login attempts and security events.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">IP Address & Location</th>
                                        <th className="px-6 py-4">Device</th>
                                        <th className="px-6 py-4">Timestamp</th>
                                        <th className="px-6 py-4 text-center">Risk Analysis</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {loginLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-sm text-slate-900">{log.userName}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-fit mb-1">{log.ip}</span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} /> {log.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{log.device}</td>
                                            <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border
                                                    ${log.riskScore === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                                                      log.riskScore === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                      'bg-green-50 text-green-700 border-green-200'}
                                                `}>
                                                    {log.riskScore === 'High' && <AlertCircle size={12} />}
                                                    {log.riskScore === 'Medium' && <AlertCircle size={12} />}
                                                    {log.riskScore === 'Low' && <ShieldCheck size={12} />}
                                                    {log.riskScore} Risk
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {loginLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">No recent login activity logged.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* COMMUNICATION TAB (BULK) */}
            {activeTab === 'communication' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Megaphone size={24} className="text-primary-600" /> Bulk Messaging Center
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setBulkType('email')} className={`p-4 border rounded-lg flex items-center gap-3 transition-colors ${bulkType === 'email' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                <Mail className={bulkType === 'email' ? "text-blue-600" : "text-slate-400"} /> 
                                <div className="text-left">
                                    <div className="font-bold text-slate-800">Email Broadcast</div>
                                    <div className="text-xs text-slate-500">Send via SMTP</div>
                                </div>
                            </button>
                            <button onClick={() => setBulkType('sms')} className={`p-4 border rounded-lg flex items-center gap-3 transition-colors ${bulkType === 'sms' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                <Smartphone className={bulkType === 'sms' ? "text-green-600" : "text-slate-400"} /> 
                                <div className="text-left">
                                    <div className="font-bold text-slate-800">SMS Blast</div>
                                    <div className="text-xs text-slate-500">Via Gateway</div>
                                </div>
                            </button>
                        </div>

                        <div>
                            <label className={labelStyle}>Target Audience</label>
                            <select className={inputStyle} value={bulkRecipients} onChange={(e) => setBulkRecipients(e.target.value)}>
                                <option value="all">All Users ({users.length})</option>
                                <option value="technician">Technicians Only</option>
                                <option value="customer">Customers Only</option>
                            </select>
                        </div>

                        {bulkType === 'email' && (
                            <div>
                                <label className={labelStyle}>Subject Line</label>
                                <input type="text" className={inputStyle} placeholder="Newsletter Subject" value={bulkSubject} onChange={(e) => setBulkSubject(e.target.value)} />
                            </div>
                        )}

                        <div>
                            <label className={labelStyle}>Message Content</label>
                            <textarea 
                                className={inputStyle}
                                style={{ minHeight: '150px' }}
                                placeholder={bulkType === 'email' ? "HTML or Plain text content..." : "SMS content (160 chars recommended)..."}
                                value={bulkMessage}
                                onChange={(e) => setBulkMessage(e.target.value)}
                            ></textarea>
                            {bulkType === 'sms' && <p className="text-xs text-slate-500 mt-1">{bulkMessage.length} characters</p>}
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleSendBulkMessage} className="w-full md:w-auto">
                                <Send size={18} className="mr-2" /> Send Broadcast
                            </Button>
                        </div>
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
                                    <div className="w-24 h-24 border rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {settings.logoUrl ? <img src={settings.logoUrl} alt="Logo" className="max-w-full max-h-full p-2 object-contain" /> : <span className="text-xs text-slate-400">No Logo</span>}
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Website Logo</label>
                                        <input type="file" accept="image/*" onChange={handleUploadLogo} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"/>
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
                                        <label className={labelStyle}>Admin Email</label>
                                        <input type="email" className={inputStyle} value={settings.adminEmail} onChange={e => setSettings({...settings, adminEmail: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>SMTP Host</label>
                                        <input type="text" className={inputStyle} value={settings.smtpHost} onChange={e => setSettings({...settings, smtpHost: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>SMTP User</label>
                                        <input type="text" className={inputStyle} value={settings.smtpUser} onChange={e => setSettings({...settings, smtpUser: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>SMTP Password</label>
                                        <input type="password" className={inputStyle} value={settings.smtpPass} onChange={e => setSettings({...settings, smtpPass: e.target.value})} />
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
                                        <label className={labelStyle}>General Form Webhook URL</label>
                                        <input type="text" className={inputStyle} value={settings.n8nWebhook} onChange={e => setSettings({...settings, n8nWebhook: e.target.value})} placeholder="https://n8n.yourdomain.com/webhook/forms" />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Quote Integration Webhook URL</label>
                                        <input type="text" className={inputStyle} value={settings.n8nQuoteWebhook} onChange={e => setSettings({...settings, n8nQuoteWebhook: e.target.value})} placeholder="https://n8n.yourdomain.com/webhook/quotes" />
                                        <p className="text-xs text-slate-500 mt-1">Dedicated webhook for handling complex quote logic and CRM syncing.</p>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Request a Quick Callback Webhook URL</label>
                                        <input type="text" className={inputStyle} value={settings.n8nCallbackWebhook} onChange={e => setSettings({...settings, n8nCallbackWebhook: e.target.value})} placeholder="https://n8n.yourdomain.com/webhook/callback" />
                                        <p className="text-xs text-slate-500 mt-1">Triggers when a user requests a callback from the homepage.</p>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Chatbot Webhook URL</label>
                                        <input type="text" className={inputStyle} value={settings.n8nChatWebhook} onChange={e => setSettings({...settings, n8nChatWebhook: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Formspree Integration */}
                            <div>
                                <h3 className="text-md font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                                    <Send size={18} /> Formspree Integration
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className={labelStyle}>Formspree Endpoint URL</label>
                                        <input 
                                            type="text" 
                                            className={inputStyle} 
                                            value={settings.formspreeUrl} 
                                            onChange={e => setSettings({...settings, formspreeUrl: e.target.value})} 
                                            placeholder="https://formspree.io/f/your-form-id" 
                                        />
                                        <p className="text-xs text-slate-500 mt-1">
                                            Alternative email service for contact forms.
                                        </p>
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
                                        <label className={labelStyle}>Provider</label>
                                        <select className={inputStyle} value={settings.smsProvider} onChange={e => setSettings({...settings, smsProvider: e.target.value})}>
                                            <option value="AfricaTalking">Africa's Talking</option>
                                            <option value="Twilio">Twilio</option>
                                            <option value="Hubtel">Hubtel</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Sender ID</label>
                                        <input type="text" className={inputStyle} value={settings.smsSenderId} onChange={e => setSettings({...settings, smsSenderId: e.target.value})} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelStyle}>API Key / Auth Token</label>
                                        <input type="password" className={inputStyle} value={settings.smsApiKey} onChange={e => setSettings({...settings, smsApiKey: e.target.value})} />
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

      {/* REMOTE ACCESS MODAL (Global for Admin Dashboard) */}
      {showRemoteModal && (
            <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 relative">
                    <button onClick={() => setShowRemoteModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
                        <Monitor size={24} className="text-primary-600" /> Admin Remote Access
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">Enter client's Session ID to connect:</p>
                    <input 
                        type="text" 
                        className="w-full border-2 border-primary-100 focus:border-primary-500 rounded-lg px-4 py-3 mb-6 text-center font-mono text-xl tracking-widest bg-slate-50 text-slate-900 font-bold outline-none transition-colors"
                        placeholder="000 000 000"
                        value={remoteId}
                        onChange={e => setRemoteId(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <button onClick={() => handleLaunchRemote('anydesk')} className="bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-bold transition flex flex-col items-center justify-center gap-1">
                            <span>AnyDesk</span>
                            <span className="text-[10px] opacity-80 font-normal">Launch App</span>
                        </button>
                        <button onClick={() => handleLaunchRemote('teamviewer')} className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold transition flex flex-col items-center justify-center gap-1">
                            <span>TeamViewer</span>
                            <span className="text-[10px] opacity-80 font-normal">Launch App</span>
                        </button>
                    </div>
                </div>
            </div>
      )}
    </div>
  );
};

export default AdminDashboard;