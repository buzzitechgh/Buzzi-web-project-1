import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, CheckCircle, Clock, Star, LogOut, MapPin, Calendar, Monitor, Video, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import Logo from '../components/Logo';
import { Meeting, ChatMessage } from '../types';

const TechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tech, setTech] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction State
  const [showRemoteModal, setShowRemoteModal] = useState(false);
  const [remoteId, setRemoteId] = useState("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const storedTech = localStorage.getItem('techUser');
    if (!storedTech) {
      navigate('/login');
      return;
    }
    const parsedTech = JSON.parse(storedTech);
    setTech(parsedTech);
    fetchData(parsedTech.name);
  }, [navigate]);

  const fetchData = async (name: string) => {
    setLoading(true);
    try {
        const [tasksData, meetingsData, chatsData] = await Promise.all([
            api.getTechnicianTasks(name),
            api.getMeetings(),
            api.getChatMessages()
        ]);
        setTasks(tasksData);
        setMeetings(meetingsData);
        setChats(chatsData);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('techToken');
    localStorage.removeItem('techUser');
    navigate('/login');
  };

  const handleLaunchRemote = (tool: 'anydesk' | 'teamviewer') => {
      if (!remoteId.trim()) {
          alert("Please enter the client's Session ID");
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

  const handleSendMessage = async () => {
      if (!newMessage.trim()) return;
      // Send as 'tech' role
      const res = await api.sendInternalMessage(tech.id || 'tech', tech.name, newMessage, undefined, 'technician');
      setChats(prev => [...prev, res.message]);
      setNewMessage("");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading Portal...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
       <header className="bg-slate-900 text-white p-4">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
             <div className="flex items-center gap-3">
                <Logo lightMode={true} className="h-8 scale-90" />
                <span className="text-sm bg-green-600 px-2 py-0.5 rounded text-white font-bold">TECH PORTAL</span>
             </div>
             <button onClick={handleLogout} className="text-slate-400 hover:text-white"><LogOut size={20} /></button>
          </div>
       </header>

       <div className="max-w-5xl mx-auto p-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Profile & Tools */}
          <div className="md:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
                    <Wrench size={32} />
                 </div>
                 <h1 className="text-xl font-bold text-slate-900">{tech?.name}</h1>
                 <p className="text-slate-500 text-sm mb-4">{tech?.role} • {tech?.status}</p>
                 <div className="flex justify-center gap-4 text-center border-t pt-4">
                    <div>
                       <div className="text-lg font-bold text-yellow-500 flex items-center gap-1 justify-center">
                          {tech?.rating} <Star size={16} fill="currentColor" />
                       </div>
                       <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Rating</p>
                    </div>
                    <div>
                       <div className="text-lg font-bold text-primary-600">{tasks.length}</div>
                       <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Tasks</p>
                    </div>
                 </div>
              </div>

              {/* Remote Tools */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Monitor className="text-primary-600" size={18} /> Remote Tools
                  </h3>
                  <button onClick={() => setShowRemoteModal(true)} className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm hover:bg-slate-800 mb-2 font-medium">
                      Start Remote Session
                  </button>
                  <p className="text-xs text-slate-400 text-center">Compatible with AnyDesk & TeamViewer</p>
              </div>

              {/* Upcoming Meetings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Video className="text-purple-600" size={18} /> My Meetings
                  </h3>
                  <div className="space-y-3">
                      {meetings.slice(0, 3).map(m => (
                          <div key={m.id} className="text-sm border-b pb-2 last:border-0">
                              <div className="flex justify-between font-medium">
                                  <span>{m.title}</span>
                                  <span className="text-xs text-slate-400">{m.time}</span>
                              </div>
                              <a href={m.link} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">Join {m.platform}</a>
                          </div>
                      ))}
                      {meetings.length === 0 && <p className="text-xs text-slate-400">No meetings scheduled.</p>}
                  </div>
              </div>
          </div>

          {/* MIDDLE/RIGHT: Tasks & Chat */}
          <div className="md:col-span-2 space-y-6">
              
              {/* Internal Team Chat */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[300px] flex flex-col">
                  <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <MessageSquare className="text-blue-500" size={18} /> Team Chat
                  </h3>
                  <div className="flex-grow overflow-y-auto bg-slate-50 border rounded-lg p-3 mb-2 space-y-2">
                      {chats.map(chat => (
                          <div key={chat.id} className={`flex ${chat.senderName === tech.name ? 'justify-end' : 'justify-start'}`}>
                              <div className={`p-2 rounded-lg max-w-[80%] text-xs ${chat.senderName === tech.name ? 'bg-blue-600 text-white' : 'bg-white border text-slate-800'}`}>
                                  <p className="font-bold opacity-70 mb-0.5">{chat.senderName}</p>
                                  <p>{chat.message}</p>
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="flex gap-2">
                      <input 
                          className="flex-grow border rounded px-3 py-1.5 text-sm" 
                          placeholder="Update status..." 
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button onClick={handleSendMessage} className="bg-blue-600 text-white px-4 rounded text-sm">Send</button>
                  </div>
              </div>

              {/* Tasks List */}
              <h2 className="text-xl font-bold text-slate-900">Assigned Work Orders</h2>
              <div className="space-y-4">
                 {tasks.length === 0 ? (
                     <p className="text-slate-400">No active tasks assigned.</p>
                 ) : (
                     tasks.map(task => (
                        <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-primary-300 transition-colors relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                           <div className="flex justify-between items-start mb-3">
                              <span className="font-mono text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">{task.id}</span>
                              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded flex items-center gap-1"><Clock size={12} /> {task.status}</span>
                           </div>
                           <h3 className="font-bold text-lg text-slate-900 mb-1">{task.type}</h3>
                           <p className="text-slate-600 text-sm mb-4">{task.client}</p>
                           
                           <div className="space-y-2 text-sm text-slate-500 mb-4">
                              <div className="flex items-center gap-2"><MapPin size={16} className="text-primary-500" /> {task.address}</div>
                              <div className="flex items-center gap-2"><Calendar size={16} className="text-primary-500" /> {task.date} @ {task.time}</div>
                           </div>

                           <div className="flex gap-2 mt-4">
                              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition">Mark Complete</button>
                              <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition">Details</button>
                           </div>
                        </div>
                     ))
                 )}
              </div>
          </div>

       </div>

       {/* REMOTE MODAL */}
       {showRemoteModal && (
            <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
                        <Monitor size={24} className="text-primary-600" /> Connect Remote
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">Ask client for their 9-digit Session ID:</p>
                    <input 
                        type="text" 
                        className="w-full border rounded-lg px-4 py-2 mb-4 text-center font-mono text-lg tracking-widest bg-white text-slate-900"
                        placeholder="000 000 000"
                        value={remoteId}
                        onChange={e => setRemoteId(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button onClick={() => handleLaunchRemote('anydesk')} className="bg-red-600 text-white py-2 rounded hover:bg-red-700 font-bold transition">AnyDesk</button>
                        <button onClick={() => handleLaunchRemote('teamviewer')} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold transition">TeamViewer</button>
                    </div>
                    <button onClick={() => setShowRemoteModal(false)} className="w-full text-slate-500 hover:text-slate-800 text-sm">Cancel</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default TechnicianDashboard;