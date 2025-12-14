import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Ticket, Star, LogOut, ChevronRight, MessageSquare, Clock, Video, Monitor, Download } from 'lucide-react';
import { api } from '../services/api';
import Button from '../components/Button';
import { ChatMessage, Meeting } from '../types';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Rating State
  const [ratingModal, setRatingModal] = useState<any>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem('customerUser');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchData(parsedUser.email);
  }, [navigate]);

  const fetchData = async (email: string) => {
    setLoading(true);
    try {
        const [ordersData, ticketsData, chatsData, meetingsData] = await Promise.all([
            api.getCustomerOrders(email),
            api.getCustomerTickets(email),
            api.getChatMessages(),
            api.getMeetings()
        ]);
        setOrders(ordersData);
        setTickets(ticketsData);
        
        // Filter messages for this customer (from/to them or general system)
        setChats(chatsData);
        
        setMeetings(meetingsData); 
    } catch (e) {
        console.error("Fetch failed", e);
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
    navigate('/login');
  };

  const handleSubmitRating = async () => {
      if (!ratingModal) return;
      await api.submitRating("Kwame Osei", ratingVal, feedback);
      alert("Thank you for your feedback!");
      setRatingModal(null);
      setFeedback("");
  };

  const handleSendMessage = async () => {
      if (!newMessage.trim()) return;
      // Send as customer role
      const res = await api.sendInternalMessage(user.id, user.name, newMessage, 'admin', 'customer');
      setChats(prev => [...prev, res.message]);
      setNewMessage("");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
           <div>
              <h1 className="text-3xl font-bold text-slate-900">Hello, {user?.name}</h1>
              <p className="text-slate-500">Welcome to your dashboard.</p>
           </div>
           <div className="flex gap-3">
              <Button to="/store" variant="outline" size="sm">New Order</Button>
              <Button to="/contact" variant="outline" size="sm">New Ticket</Button>
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition">
                 <LogOut size={18} /> Logout
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           
           {/* Column 1: Core Operations */}
           <div className="md:col-span-2 space-y-8">
               {/* Active Orders */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <Package className="text-primary-600" /> Recent Orders
                  </h2>
                  {orders.length === 0 ? (
                      <p className="text-slate-400 text-sm">No orders found.</p>
                  ) : (
                      <div className="space-y-3">
                          {orders.map(order => (
                              <div key={order._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <p className="font-bold text-slate-800 text-sm">{order.orderId}</p>
                                          <p className="text-xs text-slate-500">{new Date(order.date).toLocaleDateString()}</p>
                                      </div>
                                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                          {order.status}
                                      </span>
                                  </div>
                                  <div className="flex justify-between items-center mt-3">
                                      <span className="text-sm font-medium">GHS {order.total.toLocaleString()}</span>
                                      <Link to={`/tracking?id=${order.orderId}`} className="text-xs text-primary-600 font-bold flex items-center gap-1 hover:underline">
                                          Track <ChevronRight size={12} />
                                      </Link>
                                  </div>
                                  {order.status === 'Completed' && (
                                      <button 
                                        onClick={() => setRatingModal(order)}
                                        className="w-full mt-3 text-xs bg-yellow-50 text-yellow-700 py-2 rounded-lg font-medium hover:bg-yellow-100 transition"
                                      >
                                          Rate Service
                                      </button>
                                  )}
                              </div>
                          ))}
                      </div>
                  )}
               </div>

               {/* Meetings */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <Video className="text-purple-600" /> Upcoming Meetings
                  </h2>
                  {meetings.length === 0 ? (
                      <p className="text-slate-400 text-sm">No scheduled meetings.</p>
                  ) : (
                      <div className="space-y-3">
                          {meetings.map(meeting => (
                              <div key={meeting.id} className="flex justify-between items-center border p-3 rounded-lg">
                                  <div>
                                      <p className="font-bold text-sm">{meeting.title}</p>
                                      <p className="text-xs text-slate-500">{meeting.date} at {meeting.time}</p>
                                  </div>
                                  <a href={meeting.link} target="_blank" rel="noreferrer" className="bg-primary-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-primary-700">Join {meeting.platform}</a>
                              </div>
                          ))}
                      </div>
                  )}
               </div>
           </div>

           {/* Column 2: Support & Communication */}
           <div className="space-y-8">
               
               {/* Live Chat */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[400px]">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <MessageSquare className="text-blue-500" /> Tech Support
                  </h2>
                  <div className="flex-grow overflow-y-auto space-y-3 pr-2 mb-4 bg-slate-50 rounded-lg p-3">
                      {chats
                        .filter(c => (c.senderId === user.id && c.receiverId === 'admin') || (c.senderId === 'admin' && c.receiverId === user.id) || c.isSystem)
                        .map(chat => (
                          <div key={chat.id} className={`flex ${chat.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                              <div className={`p-3 rounded-xl max-w-[85%] text-sm ${chat.senderId === user.id ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white border text-slate-800 rounded-bl-none'}`}>
                                  {chat.senderId !== user.id && <p className="text-[10px] font-bold opacity-60 mb-1">{chat.senderName}</p>}
                                  <p>{chat.message}</p>
                                  <span className="text-[10px] opacity-70 block text-right mt-1">{new Date(chat.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                              </div>
                          </div>
                      ))}
                      {chats.length === 0 && <p className="text-center text-xs text-gray-400 mt-10">Start a chat with our support team.</p>}
                  </div>
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-grow border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button onClick={handleSendMessage} className="bg-primary-600 text-white p-2 rounded-lg"><ChevronRight /></button>
                  </div>
               </div>

               {/* Remote Support Tools */}
               <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                     <Monitor className="text-brand-yellow" /> Remote Support
                  </h2>
                  <p className="text-sm text-slate-300 mb-4">Download a tool to allow our technicians to connect to your PC.</p>
                  <div className="space-y-3">
                      <a href="https://anydesk.com/en/downloads" target="_blank" rel="noreferrer" className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-3 rounded-lg transition">
                          <span className="font-bold text-sm">Download AnyDesk</span>
                          <Download size={16} />
                      </a>
                      <a href="https://www.teamviewer.com/en/download/" target="_blank" rel="noreferrer" className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-3 rounded-lg transition">
                          <span className="font-bold text-sm">Download TeamViewer</span>
                          <Download size={16} />
                      </a>
                  </div>
               </div>

               {/* Support Tickets Summary */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <Ticket className="text-red-500" /> Open Tickets
                  </h2>
                  {tickets.length === 0 ? (
                      <p className="text-slate-400 text-sm">No active tickets.</p>
                  ) : (
                      <div className="space-y-3">
                          {tickets.map(ticket => (
                              <div key={ticket.id} className="border border-gray-100 rounded-xl p-4">
                                  <div className="flex justify-between items-center mb-1">
                                      <span className="font-mono text-xs text-slate-400">{ticket.id}</span>
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${ticket.status === 'Open' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                          {ticket.status}
                                      </span>
                                  </div>
                                  <h4 className="font-bold text-slate-800 text-sm">{ticket.subject}</h4>
                              </div>
                          ))}
                      </div>
                  )}
               </div>

           </div>

        </div>
      </div>

      {/* Rating Modal */}
      {ratingModal && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Rate Your Experience</h3>
                  <p className="text-sm text-slate-500 mb-4">How was the service for Order {ratingModal.orderId}?</p>
                  
                  <div className="flex justify-center gap-2 mb-4">
                      {[1,2,3,4,5].map(star => (
                          <button key={star} onClick={() => setRatingVal(star)} className={`transition ${star <= ratingVal ? 'text-yellow-400' : 'text-gray-200'}`}>
                              <Star size={32} fill="currentColor" />
                          </button>
                      ))}
                  </div>

                  <textarea 
                    className="w-full border p-3 rounded-lg text-sm mb-4" 
                    rows={3} 
                    placeholder="Write a review..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  ></textarea>

                  <div className="flex gap-2">
                      <button onClick={() => setRatingModal(null)} className="flex-1 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
                      <Button onClick={handleSubmitRating} className="flex-1 py-2">Submit</Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CustomerDashboard;