
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, CheckCircle, Clock, Star, LogOut, MapPin, Calendar, Monitor, Video, MessageSquare, Send, X, AlertCircle, Key, Edit, User, Camera, ShieldCheck, Lock, Unlock } from 'lucide-react';
import { api } from '../services/api';
import Logo from '../components/Logo';
import { Meeting, ChatMessage } from '../types';
import Button from '../components/Button';

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
  
  // Task Details & Completion Logic
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState("");

  // Edit Profile State
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Styles
  const inputVisibleClass = "w-full border border-slate-400 bg-slate-50 p-3 rounded-lg text-sm outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all text-slate-900 placeholder-slate-400 font-medium";

  useEffect(() => {
    const storedTech = localStorage.getItem('techUser');
    if (!storedTech) {
      navigate('/login');
      return;
    }
    const parsedTech = JSON.parse(storedTech);
    setTech(parsedTech);
    setEditData({ name: parsedTech.name || '', email: parsedTech.email || '', phone: parsedTech.phone || '', password: '', confirmPassword: '' });
    if(parsedTech.verificationImage) setProfileImagePreview(parsedTech.verificationImage);
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

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          setProfileImage(file);
          const reader = new FileReader();
          reader.onloadend = () => setProfileImagePreview(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const handleUpdateProfile = async () => {
      if (editData.password && editData.password !== editData.confirmPassword) {
          alert("Passwords do not match!");
          return;
      }

      setIsUpdating(true);
      try {
          let imageUrl = tech.verificationImage;
          if(profileImage) {
              imageUrl = await api.uploadImage(profileImage);
          }

          const res = await api.updateProfile({
              name: editData.name,
              email: editData.email,
              phone: editData.phone,
              password: editData.password || undefined,
              verificationImage: imageUrl
          });

          if(res.success) {
              setTech(res.user);
              localStorage.setItem('techUser', JSON.stringify(res.user));
              alert("Profile updated successfully");
              setShowEditProfile(false);
              setEditData(prev => ({...prev, password: '', confirmPassword: ''}));
          }
      } catch (e: any) {
          alert(e.message || "Failed to update profile");
      } finally {
          setIsUpdating(false);
      }
  };

  const handleToggle2FA = async () => {
      if (!confirm(`Are you sure you want to ${tech.isTwoFactorEnabled ? 'disable' : 'enable'} Two-Factor Authentication?`)) return;
      try {
          const res = await api.toggleTwoFactor();
          const updatedUser = { ...tech, isTwoFactorEnabled: res.isTwoFactorEnabled };
          setTech(updatedUser);
          localStorage.setItem('techUser', JSON.stringify(updatedUser));
          alert(res.message);
      } catch (e) {
          alert("Failed to update security settings.");
      }
  };

  const handleLaunchRemote = (tool: 'anydesk' | 'teamviewer' | 'rustdesk') => {
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
      } else if (tool === 'rustdesk') {
          protocolUrl = `rustdesk://${cleanId}`;
          fallbackUrl = 'https://rustdesk.com/download';
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

  const initiateCompletion = (task: any) => {
      setSelectedTask(task);
      setShowVerifyModal(true);
      setVerificationCode("");
      setVerifyError("");
  };

  const handleVerifyAndComplete = async () => {
      if (!verificationCode || !selectedTask) return;
      
      try {
          // Call API to verify code and update
          await api.verifyJobCompletion(selectedTask.id, verificationCode);
          
          alert("Success! Job completed and confirmation sent.");
          
          // Update Local State
          setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: 'Completed' } : t));
          if (selectedTask) setSelectedTask({ ...selectedTask, status: 'Completed' });
          
          setShowVerifyModal(false);
          setVerificationCode("");
      } catch (e: any) {
          setVerifyError(e.message || "Invalid Code. Please ask the customer.");
      }
  };

  const handleViewDetails = (task: any) => {
      setSelectedTask(task);
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center relative group">
                 <button 
                    onClick={() => setShowEditProfile(true)} 
                    className="absolute top-2 right-2 p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-full transition"
                    title="Edit Profile"
                 >
                    <Edit size={16} />
                 </button>
                 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4 overflow-hidden border border-slate-200">
                    {tech?.verificationImage ? (
                        <img src={tech.verificationImage} alt="Tech" className="w-full h-full object-cover" />
                    ) : (
                        <Wrench size={32} />
                    )}
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

              {/* Security Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <ShieldCheck className="text-green-600" size={18} /> Account Security
                   </h3>
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-full ${tech.isTwoFactorEnabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                               {tech.isTwoFactorEnabled ? <Lock size={16} /> : <Unlock size={16} />}
                           </div>
                           <div>
                               <p className="text-sm font-bold text-slate-800">2FA</p>
                               <p className="text-[10px] text-slate-500">Login Protection</p>
                           </div>
                       </div>
                       <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                           <input 
                               type="checkbox" 
                               name="toggle" 
                               id="toggle" 
                               className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300"
                               style={{ right: tech.isTwoFactorEnabled ? '0' : '50%', borderColor: tech.isTwoFactorEnabled ? '#22c55e' : '#cbd5e1' }}
                               checked={tech.isTwoFactorEnabled || false}
                               onChange={handleToggle2FA}
                           />
                           <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${tech.isTwoFactorEnabled ? 'bg-green-500' : 'bg-slate-300'}`}></label>
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
                  <div className="flex gap-2 mt-2">
                      <div className="flex-grow flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm">
                          <input 
                              className="flex-grow bg-transparent border-none text-sm focus:ring-0 text-slate-900 placeholder:text-slate-400 outline-none" 
                              placeholder="Type a message..." 
                              value={newMessage}
                              onChange={e => setNewMessage(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                          />
                      </div>
                      <button onClick={handleSendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
                          <span>Send</span>
                          <Send size={16} />
                      </button>
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
                           <div className={`absolute top-0 left-0 w-1 h-full ${task.status === 'Completed' ? 'bg-green-500' : 'bg-primary-500'}`}></div>
                           <div className="flex justify-between items-start mb-3">
                              <span className="font-mono text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">{task.id}</span>
                              <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${task.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                                  {task.status === 'Completed' ? <CheckCircle size={12} /> : <Clock size={12} />} 
                                  {task.status}
                              </span>
                           </div>
                           <h3 className="font-bold text-lg text-slate-900 mb-1">{task.type}</h3>
                           <p className="text-slate-600 text-sm mb-4">{task.client}</p>
                           
                           <div className="space-y-2 text-sm text-slate-500 mb-4">
                              <div className="flex items-center gap-2"><MapPin size={16} className="text-primary-500" /> {task.address}</div>
                              <div className="flex items-center gap-2"><Calendar size={16} className="text-primary-500" /> {task.date} @ {task.time}</div>
                           </div>

                           <div className="flex gap-2 mt-4">
                              {task.status !== 'Completed' && (
                                  <button onClick={() => initiateCompletion(task)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition">Mark Complete</button>
                              )}
                              <button onClick={() => handleViewDetails(task)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition">Details</button>
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
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <button onClick={() => handleLaunchRemote('anydesk')} className="bg-red-600 text-white py-2 rounded hover:bg-red-700 font-bold transition text-xs">AnyDesk</button>
                        <button onClick={() => handleLaunchRemote('teamviewer')} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold transition text-xs">TeamViewer</button>
                        <button onClick={() => handleLaunchRemote('rustdesk')} className="bg-slate-800 text-white py-2 rounded hover:bg-slate-900 font-bold transition text-xs">RustDesk</button>
                    </div>
                    <button onClick={() => setShowRemoteModal(false)} className="w-full text-slate-500 hover:text-slate-800 text-sm">Cancel</button>
                </div>
            </div>
        )}

        {/* TASK DETAILS MODAL */}
        {selectedTask && !showVerifyModal && (
            <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 relative">
                    <button onClick={() => setSelectedTask(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                    
                    <div className="mb-6">
                        <span className="font-mono text-xs text-slate-400 uppercase tracking-wide">Work Order #{selectedTask.id}</span>
                        <h2 className="text-2xl font-bold text-slate-900 mt-1">{selectedTask.type}</h2>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded mt-2 ${selectedTask.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {selectedTask.status}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg">
                            <Wrench className="text-slate-400 mt-1" size={18} />
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Client</p>
                                <p className="font-medium text-slate-900">{selectedTask.client}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg">
                            <MapPin className="text-slate-400 mt-1" size={18} />
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Location</p>
                                <p className="font-medium text-slate-900">
                                    {/* Mock address expansion for demo */}
                                    {selectedTask.address === 'See Details' ? '12 Independence Ave, Accra (Near Ridge Hospital)' : selectedTask.address}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg">
                            <Clock className="text-slate-400 mt-1" size={18} />
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Schedule</p>
                                <p className="font-medium text-slate-900">{selectedTask.date} at {selectedTask.time}</p>
                            </div>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-xs font-bold text-blue-500 uppercase mb-1 flex items-center gap-1">
                                <AlertCircle size={12} /> Notes
                            </p>
                            <p className="text-sm text-blue-900">
                                Please ensure client signs off on the installation form upon completion. Take photos of the installed equipment.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                        <button onClick={() => setSelectedTask(null)} className="flex-1 py-3 text-slate-500 hover:bg-slate-50 rounded-lg font-medium">Close</button>
                        {selectedTask.status !== 'Completed' && (
                            <button onClick={() => { setSelectedTask(null); initiateCompletion(selectedTask); }} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium shadow-sm transition">
                                Complete Task
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* VERIFICATION MODAL */}
        {showVerifyModal && selectedTask && (
            <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Verify Completion</h3>
                    <p className="text-sm text-slate-500 text-center mb-6">
                        Ask the customer for the 4-digit <strong>Completion Code</strong> from their dashboard to sign off.
                    </p>

                    <div className="flex justify-center mb-6">
                        <input 
                            type="text" 
                            maxLength={4}
                            placeholder="0 0 0 0"
                            className="w-48 text-center text-3xl font-mono tracking-[0.5em] border-b-2 border-slate-300 focus:border-green-500 outline-none py-2 bg-transparent text-slate-900"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                        />
                    </div>

                    {verifyError && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-4 flex items-center justify-center gap-2">
                            <AlertCircle size={16} /> {verifyError}
                        </div>
                    )}

                    <div className="space-y-3">
                        <button 
                            onClick={handleVerifyAndComplete}
                            disabled={verificationCode.length !== 4}
                            className="w-full bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Key size={18} /> Verify & Finish Job
                        </button>
                        <button 
                            onClick={() => setShowVerifyModal(false)}
                            className="w-full text-slate-500 hover:text-slate-800 text-sm py-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Profile</h3>
                  
                  <div className="flex justify-center mb-6">
                      <label className="relative cursor-pointer group">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 group-hover:border-primary-500 transition">
                              {profileImagePreview ? (
                                  <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                      <User size={32} />
                                  </div>
                              )}
                          </div>
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <Camera className="text-white" size={24} />
                          </div>
                          <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                      </label>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                          <input className={inputVisibleClass} value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                          <input className={inputVisibleClass} type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                          <input className={inputVisibleClass} value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
                      </div>
                      <div className="border-t pt-4 mt-2">
                          <p className="text-xs text-slate-400 mb-2 italic">Change Password (Optional)</p>
                          <div className="space-y-3">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                                  <input type="password" className={inputVisibleClass} placeholder="New password" value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm Password</label>
                                  <input type="password" className={inputVisibleClass} placeholder="Confirm new password" value={editData.confirmPassword} onChange={e => setEditData({...editData, confirmPassword: e.target.value})} />
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                      <button onClick={() => setShowEditProfile(false)} className="flex-1 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-medium">Cancel</button>
                      <Button onClick={handleUpdateProfile} className="flex-1 py-2" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
