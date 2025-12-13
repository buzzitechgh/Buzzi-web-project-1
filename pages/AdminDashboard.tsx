import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, ShoppingBag, Package, RefreshCw, LayoutDashboard, 
  Calendar, MessageSquare, FileText, TrendingUp, Users, DollarSign,
  MapPin, Phone, Mail, Clock
} from 'lucide-react';
import Logo from '../components/Logo';
import { api } from '../services/api';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'bookings' | 'quotes' | 'messages' | 'inventory'>('overview');
  
  // Data States
  const [stats, setStats] = useState<any>({ totalVisits: 0, monthlyVisits: 0, totalRevenue: 0, activeOrders: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
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
      const [statsData, ordersData, bookingsData, messagesData, quotesData, productsData] = await Promise.all([
        api.getAdminStats(authToken),
        api.getAdminOrders(authToken),
        api.getAdminBookings(authToken),
        api.getAdminMessages(authToken),
        api.getAdminQuotes(authToken),
        api.getAdminProducts(authToken)
      ]);
      
      setStats(statsData);
      setOrders(ordersData);
      setBookings(bookingsData);
      setMessages(messagesData);
      setQuotes(quotesData);
      setProducts(productsData);
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

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      await api.updateProductStock(productId, newStock, token);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      alert("Stock Updated");
    } catch (error) {
      alert("Failed to update stock");
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
    if (['Completed', 'Confirmed', 'Read'].includes(status)) colorClass = 'bg-green-100 text-green-700';
    else if (['Pending', 'Processing'].includes(status)) colorClass = 'bg-yellow-100 text-yellow-700';
    else if (['Cancelled', 'Rejected'].includes(status)) colorClass = 'bg-red-100 text-red-700';
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colorClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="bg-slate-900 text-slate-400 w-full md:w-64 flex-shrink-0 md:h-screen sticky top-0 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
           <Logo lightMode={true} className="h-8 scale-90 origin-left" />
        </div>
        
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <LayoutDashboard size={18} /> <span className="font-medium">Dashboard</span>
          </button>
          
          <div className="pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-slate-600 px-4">Management</div>
          
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'orders' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <div className="flex items-center gap-3"><ShoppingBag size={18} /> <span>Orders</span></div>
            {orders.length > 0 && <span className="bg-slate-700 text-xs px-2 py-0.5 rounded-full">{orders.length}</span>}
          </button>
          
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'bookings' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Calendar size={18} /> <span>Bookings</span>
          </button>
          
          <button onClick={() => setActiveTab('quotes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'quotes' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <FileText size={18} /> <span>Quotes</span>
          </button>
          
          <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'messages' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <div className="flex items-center gap-3"><MessageSquare size={18} /> <span>Messages</span></div>
            {messages.filter(m => !m.read).length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{messages.filter(m => !m.read).length}</span>}
          </button>
          
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Package size={18} /> <span>Inventory</span>
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
          <h1 className="text-2xl font-bold text-slate-800 capitalize">{activeTab}</h1>
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
                  <OverviewCard title="Total Visits (All Time)" value={stats.totalVisits.toLocaleString()} icon={Users} color="bg-blue-500" />
                  <OverviewCard title="Visits (This Month)" value={stats.monthlyVisits.toLocaleString()} icon={TrendingUp} color="bg-indigo-500" />
                  <OverviewCard title="Total Revenue" value={`GHS ${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-green-500" />
                  <OverviewCard title="Active Orders" value={stats.activeOrders} icon={ShoppingBag} color="bg-orange-500" />
                </div>
                
                {/* Recent Activity Table Preview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
                  <p className="text-slate-500 text-sm">A summary of the latest events across the platform.</p>
                  <div className="mt-4 space-y-4">
                     {orders.slice(0, 3).map((o: any) => (
                       <div key={o._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-3">
                             <div className="bg-green-100 p-2 rounded-full text-green-600"><ShoppingBag size={14} /></div>
                             <div>
                               <p className="text-sm font-semibold text-slate-900">New Order: {o.orderId}</p>
                               <p className="text-xs text-slate-500">{o.customer.name}</p>
                             </div>
                          </div>
                          <span className="text-xs text-slate-400">Just now</span>
                       </div>
                     ))}
                     {messages.slice(0, 2).map((m: any) => (
                       <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-3">
                             <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Mail size={14} /></div>
                             <div>
                               <p className="text-sm font-semibold text-slate-900">Message: {m.service}</p>
                               <p className="text-xs text-slate-500">{m.name}</p>
                             </div>
                          </div>
                          <span className="text-xs text-slate-400">2h ago</span>
                       </div>
                     ))}
                  </div>
                </div>
              </>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold">
                        <tr>
                          <th className="px-6 py-4">Order Details</th>
                          <th className="px-6 py-4">Customer Info</th>
                          <th className="px-6 py-4">Delivery / Address</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Items / Total</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-slate-600 divide-y divide-gray-100">
                        {orders.map(order => (
                          <tr key={order._id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 align-top">
                              <span className="font-mono font-bold text-primary-600">{order.orderId}</span>
                              <p className="text-xs text-slate-400 mt-1">{new Date(order.date).toLocaleDateString()}</p>
                              <p className="text-xs mt-1 uppercase font-bold text-slate-500">{order.paymentMethod}</p>
                            </td>
                            <td className="px-6 py-4 align-top">
                              <div className="flex flex-col gap-1">
                                <span className="font-bold text-slate-900">{order.customer.name}</span>
                                <span className="flex items-center gap-1 text-xs"><Phone size={12} /> {order.customer.phone}</span>
                                <span className="flex items-center gap-1 text-xs"><Mail size={12} /> {order.customer.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 align-top max-w-xs">
                              <span className={`text-xs px-2 py-0.5 rounded border mb-2 inline-block ${order.deliveryMode === 'pickup' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                                {order.deliveryMode === 'pickup' ? 'Store Pickup' : 'Delivery'}
                              </span>
                              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                                {order.deliveryMode === 'pickup' 
                                  ? 'Pickup at Accra Office' 
                                  : order.customer.address || `${order.customer.region} (No Address)`}
                              </p>
                            </td>
                            <td className="px-6 py-4 align-top">
                               <StatusBadge status={order.status} />
                            </td>
                            <td className="px-6 py-4 align-top">
                               <div className="font-bold text-slate-900">GHS {order.total.toLocaleString()}</div>
                               <div className="text-xs text-slate-500 mt-1">
                                 {order.items.length} Items: <br/>
                                 {order.items.map((i:any) => i.name).join(', ').substring(0, 30)}...
                               </div>
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Client</th>
                        <th className="px-6 py-4">Date & Time</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-600 divide-y divide-gray-100">
                       {bookings.map(booking => (
                         <tr key={booking.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4 font-bold text-slate-900">{booking.serviceType}</td>
                           <td className="px-6 py-4">{booking.name}</td>
                           <td className="px-6 py-4">
                             <div className="flex items-center gap-2"><Calendar size={14} /> {booking.date}</div>
                             <div className="flex items-center gap-2 text-xs text-slate-400 mt-1"><Clock size={12} /> {booking.time}</div>
                           </td>
                           <td className="px-6 py-4">
                              <p>{booking.phone}</p>
                              <p className="text-xs text-slate-400">{booking.email}</p>
                           </td>
                           <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                         </tr>
                       ))}
                    </tbody>
                </table>
              </div>
            )}

            {/* QUOTES TAB */}
            {activeTab === 'quotes' && (
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4">Client</th>
                        <th className="px-6 py-4">Service Interest</th>
                        <th className="px-6 py-4">Est. Total</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-600 divide-y divide-gray-100">
                       {quotes.map(quote => (
                         <tr key={quote.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4">
                              <div className="font-bold text-slate-900">{quote.name}</div>
                              <div className="text-xs">{quote.phone}</div>
                           </td>
                           <td className="px-6 py-4">{quote.serviceType}</td>
                           <td className="px-6 py-4 font-bold text-primary-600">GHS {quote.grandTotal.toLocaleString()}</td>
                           <td className="px-6 py-4 max-w-xs truncate" title={quote.description}>{quote.description}</td>
                           <td className="px-6 py-4 text-xs">{new Date(quote.date).toLocaleDateString()}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            )}

            {/* MESSAGES TAB */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                 {messages.map(msg => (
                   <div key={msg.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/4">
                         <h4 className="font-bold text-slate-900">{msg.name}</h4>
                         <p className="text-sm text-slate-500 mb-2">{msg.email}</p>
                         <p className="text-sm flex items-center gap-2 text-slate-600"><Phone size={14} /> {msg.phone}</p>
                         <div className="mt-2 text-xs text-slate-400">{new Date(msg.date).toLocaleDateString()}</div>
                      </div>
                      <div className="md:w-3/4">
                         <div className="flex items-center justify-between mb-2">
                           <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">{msg.service}</span>
                           <StatusBadge status={msg.read ? 'Read' : 'Unread'} />
                         </div>
                         <p className="text-slate-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                           {msg.message}
                         </p>
                      </div>
                   </div>
                 ))}
              </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-slate-900 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 font-bold">Product Name</th>
                          <th className="px-6 py-4 font-bold">Category</th>
                          <th className="px-6 py-4 font-bold">Price (GHS)</th>
                          <th className="px-6 py-4 font-bold">Current Stock</th>
                          <th className="px-6 py-4 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                <img src={product.image} className="w-8 h-8 rounded object-cover bg-gray-100" />
                                {product.name}
                             </td>
                             <td className="px-6 py-4">{product.category}</td>
                             <td className="px-6 py-4">{product.price.toLocaleString()}</td>
                             <td className="px-6 py-4">
                                <span className={product.stock < 5 ? "text-red-600 font-bold" : "text-slate-800"}>
                                  {product.stock}
                                </span>
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    className="w-16 border rounded px-2 py-1"
                                    defaultValue={product.stock}
                                    id={`stock-${product.id}`}
                                  />
                                  <button 
                                    onClick={() => {
                                      const input = document.getElementById(`stock-${product.id}`) as HTMLInputElement;
                                      handleStockUpdate(product.id, parseInt(input.value));
                                    }}
                                    className="text-xs bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700"
                                  >
                                    Update
                                  </button>
                                </div>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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