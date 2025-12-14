import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, ShoppingBag, Package, RefreshCw, LayoutDashboard, 
  Calendar, MessageSquare, FileText, TrendingUp, Users, DollarSign,
  Phone, Mail, Clock, CheckCircle, AlertCircle, Edit2, Image, Save, X, Ticket,
  Settings, CreditCard, Webhook, Server, Plus, Star, Link as LinkIcon, Upload, UserPlus, Truck
} from 'lucide-react';
import Logo from '../components/Logo';
import { api } from '../services/api';
import Button from '../components/Button';
import { Product, Technician } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'bookings' | 'quotes' | 'messages' | 'inventory' | 'media' | 'settings'>('overview');
  
  // Data States
  const [stats, setStats] = useState<any>({ totalVisits: 0, monthlyVisits: 0, totalRevenue: 0, activeOrders: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  
  // Edit States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', price: 0, stock: 0, category: 'General', description: '', image: 'https://via.placeholder.com/300' });

  const [replyingMessage, setReplyingMessage] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Technician Edit State
  const [newTechData, setNewTechData] = useState<Partial<Technician>>({ name: '', role: '', rating: 5, feedback: '' });
  const [isAddingTech, setIsAddingTech] = useState(false);

  // Site Media State
  const [siteImages, setSiteImages] = useState<any>({
     hero_bg: "https://images.unsplash.com/photo-1551703606-2ad43d5b24c0",
     about_img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837",
     cctv_banner: "https://images.unsplash.com/photo-1599256872237-5dcc0fbe9668"
  });
  const [newImageKey, setNewImageKey] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
      adminEmail: 'admin@buzzitech.com',
      smtpHost: 'smtp.gmail.com',
      smtpUser: '',
      smtpPass: '',
      paystackPublicKey: '',
      paystackSecretKey: '',
      n8nWebhook: '',
      n8nChatWebhook: '',
      formspreeUrl: 'https://formspree.io/f/mgvgdbyr', // Default
      supabaseUrl: '',
      supabaseKey: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (!storedToken) {
      navigate('/admin/login');
      return;
    }
    setToken(storedToken);
    fetchData(storedToken);
  }, [navigate]);

  const fetchData = async (authToken: string) => {
    setLoading(true);
    try {
      const [statsData, ordersData, bookingsData, messagesData, quotesData, productsData, settingsData, techsData] = await Promise.all([
        api.getAdminStats(authToken),
        api.getAdminOrders(authToken),
        api.getAdminBookings(authToken),
        api.getAdminMessages(authToken),
        api.getAdminQuotes(authToken),
        api.getAdminProducts(authToken),
        api.getSettings(authToken),
        api.getTechnicians(authToken)
      ]);
      
      setStats(statsData);
      setOrders(ordersData);
      setBookings(bookingsData);
      setMessages(messagesData);
      setQuotes(quotesData);
      setProducts(productsData);
      setTechnicians(techsData);
      if(settingsData && Object.keys(settingsData).length > 0) {
          setSettings(prev => ({...prev, ...settingsData}));
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
       setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, technician: technician === 'Unassigned' ? null : technician } : b));
     } catch (e) {
       alert("Failed to assign technician");
     }
  };

  const handleAddTechnician = async () => {
      if(!newTechData.name?.trim()) return;
      try {
          const result = await api.addTechnician(newTechData, token);
          if (result.technicians) setTechnicians(result.technicians);
          setNewTechData({ name: '', role: '', rating: 5, feedback: '' });
          setIsAddingTech(false);
      } catch (error) {
          alert("Failed to add technician");
      }
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
          setNewProduct({ name: '', price: 0, stock: 0, category: 'General', description: '', image: 'https://via.placeholder.com/300' });
          alert("Product created successfully");
      } catch (e) {
          alert("Failed to create product");
      }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, fieldSetter: (url: string) => void) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setUploading(true);
      try {
          const url = await api.uploadImage(file);
          fieldSetter(url);
      } catch (error) {
          alert("Failed to upload image");
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
      try {
        await api.updateSiteImages(siteImages, token);
        alert("Site images updated successfully!");
      } catch (e) {
        alert("Failed to update images");
      }
  };

  const handleAddImage = () => {
      if (!newImageKey || !newImageUrl) return;
      setSiteImages({ ...siteImages, [newImageKey]: newImageUrl });
      setNewImageKey("");
      setNewImageUrl("");
  };

  const handleDeleteImage = (key: string) => {
      const newImages = { ...siteImages };
      delete newImages[key];
      setSiteImages(newImages);
  };

  const handleSaveSettings = async () => {
      try {
          await api.saveSettings(settings, token);
          alert("System settings saved successfully.");
      } catch (e) {
          alert("Failed to save settings.");
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans relative">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="bg-slate-900 text-slate-400 w-full md:w-64 flex-shrink-0 md:h-screen sticky top-0 flex flex-col z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
           <Logo lightMode={true} className="h-8 scale-90 origin-left" />
        </div>
        
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <LayoutDashboard size={18} /> <span className="font-medium">Dashboard</span>
          </button>
          
          <div className="pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-slate-600 px-4">Operations</div>
          
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'bookings' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Calendar size={18} /> <span>Tasks & Bookings</span>
          </button>
          
          <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'messages' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <div className="flex items-center gap-3"><Ticket size={18} /> <span>Support Tickets</span></div>
            {messages.filter(m => m.status === 'Open').length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{messages.filter(m => m.status === 'Open').length}</span>}
          </button>

          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'orders' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <div className="flex items-center gap-3"><ShoppingBag size={18} /> <span>Orders</span></div>
          </button>

          <button onClick={() => setActiveTab('quotes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'quotes' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <FileText size={18} /> <span>Quotes</span>
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
          <h1 className="text-2xl font-bold text-slate-800 capitalize">{activeTab.replace('media', 'Site Media Manager').replace('bookings', 'Technician Tasks')}</h1>
          <button 
             onClick={() => fetchData(token)} 
             className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-50 shadow-sm transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
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
                  <OverviewCard title="Active Orders" value={stats.activeOrders} icon={ShoppingBag} color="bg-orange-500" />
                </div>
                
                {/* Recent Activity Table Preview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
                  <div className="mt-4 space-y-4">
                     {bookings.slice(0, 3).map((b: any) => (
                       <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-3">
                             <div className="bg-purple-100 p-2 rounded-full text-purple-600"><Calendar size={14} /></div>
                             <div>
                               <p className="text-sm font-semibold text-slate-900">Task: {b.serviceType}</p>
                               <p className="text-xs text-slate-500">Tech: {b.technician || "Unassigned"}</p>
                             </div>
                          </div>
                          <StatusBadge status={b.status} />
                       </div>
                     ))}
                  </div>
                </div>
              </>
            )}

            {/* TASKS & BOOKINGS TAB (Technician Assignment) */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                
                {/* Technician Management Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-primary-600" /> Manage Technicians
                    </h3>
                    
                    {/* Technician List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {technicians.map((tech) => (
                            <div key={tech.id} className="bg-slate-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-slate-900">{tech.name}</h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${tech.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{tech.status}</span>
                                </div>
                                <p className="text-xs text-primary-600 font-medium">{tech.role}</p>
                                <div className="flex items-center gap-1 text-xs text-yellow-500">
                                    <Star size={12} fill="currentColor" /> {tech.rating.toFixed(1)}
                                </div>
                                <p className="text-xs text-slate-500 italic border-t border-gray-100 pt-2 mt-auto">"{tech.feedback}"</p>
                            </div>
                        ))}
                    </div>

                    {/* Add Technician Form */}
                    {isAddingTech ? (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold text-blue-800 mb-3">Add New Technician Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={newTechData.name}
                                        onChange={(e) => setNewTechData({...newTechData, name: e.target.value})}
                                        placeholder="e.g. Daniel Mensah"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Role / Specialty</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={newTechData.role}
                                        onChange={(e) => setNewTechData({...newTechData, role: e.target.value})}
                                        placeholder="e.g. Network Engineer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Initial Rating (1-5)</label>
                                    <input 
                                        type="number" 
                                        min="1" max="5" step="0.1"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={newTechData.rating}
                                        onChange={(e) => setNewTechData({...newTechData, rating: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Latest Feedback / Note</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={newTechData.feedback}
                                        onChange={(e) => setNewTechData({...newTechData, feedback: e.target.value})}
                                        placeholder="e.g. Excellent field work"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => setIsAddingTech(false)} className="text-slate-500 px-4 py-2 text-sm hover:text-slate-700">Cancel</button>
                                <button onClick={handleAddTechnician} className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700">Save Technician</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setIsAddingTech(true)} className="flex items-center gap-2 text-sm text-primary-600 font-semibold hover:text-primary-800">
                            <Plus size={16} /> Add New Technician
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold">
                        <tr>
                          <th className="px-6 py-4">Task / Service</th>
                          <th className="px-6 py-4">Client</th>
                          <th className="px-6 py-4">Schedule</th>
                          <th className="px-6 py-4">Technician & Work Done</th>
                          <th className="px-6 py-4">Status & Rating</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-slate-600 divide-y divide-gray-100">
                        {bookings.map(booking => (
                          <tr key={booking.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-bold text-slate-900 align-top">
                                {booking.serviceType}
                                <div className="text-xs font-normal text-slate-400 mt-1">ID: {booking.id}</div>
                            </td>
                            <td className="px-6 py-4 align-top">
                              <div>{booking.name}</div>
                              <div className="text-xs text-slate-400">{booking.phone}</div>
                            </td>
                            <td className="px-6 py-4 align-top">
                              <div className="flex items-center gap-2"><Calendar size={14} /> {booking.date}</div>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1"><Clock size={12} /> {booking.time}</div>
                            </td>
                            <td className="px-6 py-4 align-top">
                                <select 
                                  className={`text-xs border rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2 w-full ${booking.technician ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                  value={booking.technician || "Unassigned"}
                                  onChange={(e) => handleAssignTechnician(booking.id, e.target.value)}
                                >
                                  <option value="Unassigned">Unassigned</option>
                                  {technicians.map(t => (
                                    <option key={t.id} value={t.name}>{t.name} ({t.role})</option>
                                  ))}
                                </select>
                                {booking.workDone && (
                                  <div className="bg-slate-50 p-2 rounded border text-xs text-slate-600 italic">
                                      <span className="font-bold not-italic">Work Done:</span> {booking.workDone}
                                  </div>
                                )}
                            </td>
                            <td className="px-6 py-4 align-top">
                                <div className="mb-2"><StatusBadge status={booking.status} /></div>
                                {booking.rating && (
                                    <div className="flex items-center gap-1 text-xs">
                                        <span className="font-bold text-slate-700">Rating:</span>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill={i < booking.rating ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {booking.customerFeedback && (
                                    <div className="text-xs text-slate-500 mt-1">"{booking.customerFeedback}"</div>
                                )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MESSAGES & TICKETING TAB */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                 {messages.map(msg => (
                   <div key={msg.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                          <div>
                             <h4 className="font-bold text-slate-900 flex items-center gap-2">
                               {msg.name} 
                               <span className="text-xs font-normal text-slate-400">({msg.email})</span>
                             </h4>
                             <p className="text-sm flex items-center gap-2 text-slate-600 mt-1"><Phone size={14} /> {msg.phone}</p>
                             {msg.ticketId && <p className="text-xs text-blue-600 font-mono mt-1 bg-blue-50 inline-block px-2 rounded">TICKET: {msg.ticketId}</p>}
                          </div>
                          <div className="text-right">
                             <StatusBadge status={msg.status || 'Open'} />
                             <div className="text-xs text-slate-400 mt-1">{new Date(msg.date).toLocaleDateString()}</div>
                          </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Inquiry / Issue:</p>
                        <p className="text-slate-800 leading-relaxed">{msg.message}</p>
                      </div>

                      {/* Thread / Replies */}
                      {msg.replies && msg.replies.length > 0 && (
                        <div className="pl-6 border-l-2 border-primary-200 space-y-3">
                           {msg.replies.map((reply: any, idx: number) => (
                             <div key={idx} className="bg-blue-50 p-3 rounded-r-lg">
                               <p className="text-xs font-bold text-blue-800 mb-1">{reply.sender} <span className="text-slate-400 font-normal">- {new Date(reply.date).toLocaleDateString()}</span></p>
                               <p className="text-sm text-slate-700">{reply.text}</p>
                             </div>
                           ))}
                        </div>
                      )}

                      {/* Reply Box */}
                      {replyingMessage === msg.id ? (
                         <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                            <textarea 
                              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 bg-white"
                              rows={3}
                              placeholder="Type your reply to the customer..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            ></textarea>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" onClick={() => handleSendReply(msg.id)}>Send Reply</Button>
                              <button onClick={() => setReplyingMessage(null)} className="px-3 text-sm text-slate-500 hover:text-slate-800">Cancel</button>
                            </div>
                         </div>
                      ) : (
                         <div className="flex gap-2">
                            <button 
                              onClick={() => { setReplyingMessage(msg.id); setReplyText(""); }} 
                              className="text-sm font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
                            >
                              <MessageSquare size={16} /> Reply
                            </button>
                         </div>
                      )}
                   </div>
                 ))}
              </div>
            )}

            {/* INVENTORY TAB (Editable) */}
            {activeTab === 'inventory' && (
              <>
                <div className="flex justify-end mb-4">
                    <Button onClick={() => setIsAddingProduct(true)}>
                        <Plus size={18} className="mr-2" /> Add New Product
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 font-bold">Product Name</th>
                            <th className="px-6 py-4 font-bold">Category</th>
                            <th className="px-6 py-4 font-bold">Price (GHS)</th>
                            <th className="px-6 py-4 font-bold">Disc. Price</th>
                            <th className="px-6 py-4 font-bold">Stock</th>
                            <th className="px-6 py-4 font-bold">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {products.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                               <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                  <img src={product.image} className="w-8 h-8 rounded object-cover bg-gray-100" />
                                  <div className="truncate max-w-[200px]" title={product.name}>{product.name}</div>
                               </td>
                               <td className="px-6 py-4">{product.category}</td>
                               <td className="px-6 py-4">{product.price.toLocaleString()}</td>
                               <td className="px-6 py-4 text-xs text-slate-400">
                                  {product.originalPrice ? `Was: ${product.originalPrice}` : '-'}
                               </td>
                               <td className="px-6 py-4">
                                  <span className={product.stock <= 0 ? "text-red-600 font-bold bg-red-50 px-2 py-1 rounded" : (product.stock < 5 ? "text-orange-600 font-bold" : "text-slate-800")}>
                                    {product.stock <= 0 ? "Out of Stock" : product.stock}
                                  </span>
                               </td>
                               <td className="px-6 py-4">
                                  <button 
                                    onClick={() => setEditingProduct(product)}
                                    className="flex items-center gap-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded transition-colors"
                                  >
                                    <Edit2 size={14} /> Edit
                                  </button>
                               </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
                
                {/* CREATE/EDIT MODAL */}
                {(editingProduct || isAddingProduct) && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
                      <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-800">{isAddingProduct ? "Add New Product" : "Edit Product"}</h3>
                        <button onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
                      </div>
                      
                      <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                           <input type="text" className="w-full border rounded-lg px-3 py-2 bg-white text-slate-900" 
                             value={isAddingProduct ? newProduct.name : editingProduct?.name} 
                             onChange={e => isAddingProduct ? setNewProduct({...newProduct, name: e.target.value}) : setEditingProduct({...editingProduct!, name: e.target.value})} 
                           />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price (GHS)</label>
                            <input type="number" className="w-full border rounded-lg px-3 py-2 bg-white text-slate-900" 
                              value={isAddingProduct ? newProduct.price : editingProduct?.price} 
                              onChange={e => isAddingProduct ? setNewProduct({...newProduct, price: parseFloat(e.target.value)}) : setEditingProduct({...editingProduct!, price: parseFloat(e.target.value)})} 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Original Price (Discount)</label>
                            <input type="number" className="w-full border rounded-lg px-3 py-2 bg-white text-slate-900" 
                              value={isAddingProduct ? newProduct.originalPrice || '' : editingProduct?.originalPrice || ''} 
                              onChange={e => isAddingProduct ? setNewProduct({...newProduct, originalPrice: parseFloat(e.target.value)}) : setEditingProduct({...editingProduct!, originalPrice: parseFloat(e.target.value)})} 
                              placeholder="Optional" 
                            />
                          </div>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                           <textarea className="w-full border rounded-lg px-3 py-2 bg-white text-slate-900" rows={3} 
                             value={isAddingProduct ? newProduct.description : editingProduct?.description} 
                             onChange={e => isAddingProduct ? setNewProduct({...newProduct, description: e.target.value}) : setEditingProduct({...editingProduct!, description: e.target.value})}
                           ></textarea>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                           <div className="flex gap-2">
                               <input type="text" className="flex-grow border rounded-lg px-3 py-2 bg-white text-slate-900" 
                                 value={isAddingProduct ? newProduct.image : editingProduct?.image} 
                                 onChange={e => isAddingProduct ? setNewProduct({...newProduct, image: e.target.value}) : setEditingProduct({...editingProduct!, image: e.target.value})} 
                                 placeholder="https://..."
                               />
                               <label className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center border border-slate-300">
                                   <Upload size={18} />
                                   <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadImage(e, (url) => isAddingProduct ? setNewProduct({...newProduct, image: url}) : setEditingProduct({...editingProduct!, image: url}))} />
                               </label>
                           </div>
                           {uploading && <p className="text-xs text-blue-500 mt-1">Uploading...</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Stock Level</label>
                            <input type="number" className="w-full border rounded-lg px-3 py-2 bg-white text-slate-900" 
                              value={isAddingProduct ? newProduct.stock : editingProduct?.stock} 
                              onChange={e => isAddingProduct ? setNewProduct({...newProduct, stock: parseInt(e.target.value)}) : setEditingProduct({...editingProduct!, stock: parseInt(e.target.value)})} 
                            />
                          </div>
                          <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                             <input type="text" className="w-full border rounded-lg px-3 py-2 bg-white text-slate-900" 
                               value={isAddingProduct ? newProduct.category : editingProduct?.category} 
                               onChange={e => isAddingProduct ? setNewProduct({...newProduct, category: e.target.value}) : setEditingProduct({...editingProduct!, category: e.target.value})} 
                             />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 px-6 py-4 border-t flex justify-end gap-3">
                        <button onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }} className="px-4 py-2 text-slate-600 hover:text-slate-800">Cancel</button>
                        <Button onClick={isAddingProduct ? handleCreateProduct : handleSaveProduct}>
                            <Save size={16} className="mr-2" /> {isAddingProduct ? "Create Product" : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ORDERS TAB (Editable Status) */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-yellow-50 text-yellow-800 text-sm border-b border-yellow-100 flex items-center gap-2">
                   <AlertCircle size={16} /> 
                   <span>Update order status here. Changes reflect immediately on the Customer Tracking Page.</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold">
                       <tr>
                         <th className="px-6 py-4">ID</th>
                         <th className="px-6 py-4">Customer</th>
                         <th className="px-6 py-4">Total</th>
                         <th className="px-6 py-4">Status Update</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm text-slate-600 divide-y divide-gray-100">
                       {orders.map(o => (
                         <tr key={o._id}>
                           <td className="px-6 py-4 font-mono">{o.orderId}</td>
                           <td className="px-6 py-4">
                               <div>{o.customer.name}</div>
                               <div className="text-xs text-slate-400">{o.customer.phone}</div>
                           </td>
                           <td className="px-6 py-4 font-bold">GHS {o.total.toLocaleString()}</td>
                           <td className="px-6 py-4">
                               <select 
                                  className="border border-gray-300 rounded px-2 py-1 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                  value={o.status}
                                  onChange={(e) => handleUpdateOrderStatus(o.orderId, e.target.value)}
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

            {/* MEDIA MANAGER TAB */}
            {activeTab === 'media' && (
               <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-3xl">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Image size={24} className="text-primary-600" /> Website Image Manager
                  </h2>
                  <p className="text-slate-500 mb-8">Update images displayed on the website. Use direct image URLs or upload from device.</p>
                  
                  <div className="space-y-6">
                     {Object.entries(siteImages).map(([key, url]: [string, any]) => (
                        <div key={key}>
                            <div className="flex justify-between items-end mb-2">
                                <label className="block text-sm font-bold text-slate-700 capitalize">{key.replace('_', ' ')}</label>
                                <button onClick={() => handleDeleteImage(key)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                            </div>
                            <div className="flex gap-4">
                               <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden border flex-shrink-0">
                                  <img src={url} className="w-full h-full object-cover" alt={key} onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'} />
                               </div>
                               <div className="flex-grow flex gap-2">
                                   <input 
                                     type="text" 
                                     className="flex-grow border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900" 
                                     value={url}
                                     onChange={e => setSiteImages({...siteImages, [key]: e.target.value})}
                                   />
                                   <label className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 rounded-lg cursor-pointer flex items-center justify-center border border-slate-300">
                                       <Upload size={18} />
                                       <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadImage(e, (newUrl) => setSiteImages({...siteImages, [key]: newUrl}))} />
                                   </label>
                               </div>
                            </div>
                        </div>
                     ))}

                     {/* Add New Image Section */}
                     <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Plus size={16} /> Add New Image Resource</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Image Key (e.g. 'promo_banner')</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900"
                                    value={newImageKey}
                                    onChange={(e) => setNewImageKey(e.target.value)}
                                    placeholder="new_section_image"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Image URL / Upload</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900"
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        placeholder="https://..."
                                    />
                                    <label className="bg-white hover:bg-gray-50 text-slate-600 px-3 py-2 rounded border border-gray-300 cursor-pointer flex items-center justify-center">
                                        <Upload size={16} />
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadImage(e, setNewImageUrl)} />
                                    </label>
                                </div>
                                {uploading && <p className="text-xs text-blue-500 mt-1">Uploading...</p>}
                            </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                            <button 
                                onClick={handleAddImage}
                                disabled={!newImageKey || !newImageUrl}
                                className="bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-900 disabled:opacity-50"
                            >
                                Add Image
                            </button>
                        </div>
                     </div>

                     <div className="pt-6 border-t flex justify-end">
                        <Button onClick={handleSaveImages}>
                           <Save size={18} className="mr-2" /> Save All Changes
                        </Button>
                     </div>
                  </div>
               </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Settings size={24} className="text-primary-600" /> System Configurations
                    </h2>
                    
                    <div className="space-y-8 max-w-4xl">
                        
                        {/* Email Settings */}
                        <div>
                            <h3 className="text-md font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                                <Mail size={18} /> Email & Notifications
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email (Notifications)</label>
                                    <input type="email" className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900" value={settings.adminEmail} onChange={e => setSettings({...settings, adminEmail: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Host</label>
                                    <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900" value={settings.smtpHost} onChange={e => setSettings({...settings, smtpHost: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">SMTP User</label>
                                    <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900" value={settings.smtpUser} onChange={e => setSettings({...settings, smtpUser: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Password</label>
                                    <input type="password" className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900" value={settings.smtpPass} onChange={e => setSettings({...settings, smtpPass: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        {/* Integration Settings */}
                        <div>
                            <h3 className="text-md font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                                <Webhook size={18} /> API & Integrations
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Formspree Endpoint (Contact/Booking)</label>
                                    <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900" value={settings.formspreeUrl} onChange={e => setSettings({...settings, formspreeUrl: e.target.value})} placeholder="https://formspree.io/f/..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">N8N Form/Quote Webhook URL</label>
                                    <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900" value={settings.n8nWebhook} onChange={e => setSettings({...settings, n8nWebhook: e.target.value})} placeholder="https://your-n8n.com/webhook/..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">N8N Chatbot Webhook URL</label>
                                    <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900" value={settings.n8nChatWebhook} onChange={e => setSettings({...settings, n8nChatWebhook: e.target.value})} placeholder="https://your-n8n.com/webhook/chat..." />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Supabase URL</label>
                                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900" value={settings.supabaseUrl} onChange={e => setSettings({...settings, supabaseUrl: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Supabase Key</label>
                                        <input type="password" className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900" value={settings.supabaseKey} onChange={e => setSettings({...settings, supabaseKey: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Settings */}
                        <div>
                            <h3 className="text-md font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                                <CreditCard size={18} /> Payment Gateway (Paystack)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Public Key</label>
                                    <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900" value={settings.paystackPublicKey} onChange={e => setSettings({...settings, paystackPublicKey: e.target.value})} placeholder="pk_test_..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Secret Key</label>
                                    <input type="password" className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900" value={settings.paystackSecretKey} onChange={e => setSettings({...settings, paystackSecretKey: e.target.value})} placeholder="sk_test_..." />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleSaveSettings}>
                                <Save size={18} className="mr-2" /> Save System Settings
                            </Button>
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