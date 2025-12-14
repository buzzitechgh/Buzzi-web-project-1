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

            {/* OTHER TABS (Placeholder implementation for brevity, typically full components) */}
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

            {/* ... Other tabs ... */}
            {activeTab !== 'overview' && activeTab !== 'orders' && activeTab !== 'bookings' && (
               <div className="text-center py-20 text-slate-400 bg-white rounded-xl border border-gray-200">
                  <p>Module loaded: {activeTab}</p>
                  <p className="text-sm">Functionality available in full implementation.</p>
               </div>
            )}

          </div>
        )}
      </main>

      {/* MODALS */}
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