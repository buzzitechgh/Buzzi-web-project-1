import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Wrench, Shield, UserPlus, ArrowLeft, Key, AlertCircle } from 'lucide-react';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { api } from '../services/api';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customer' | 'technician'>('customer');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showForgotPass, setShowForgotPass] = useState(false);
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: New Pass
  const [resetMessage, setResetMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'customer') {
        const res = await api.customerLogin(email, password);
        localStorage.setItem('customerToken', res.token);
        localStorage.setItem('customerUser', JSON.stringify(res.user));
        navigate('/dashboard');
      } else if (activeTab === 'technician') {
        const res = await api.technicianLogin(email, password);
        localStorage.setItem('techToken', res.token);
        localStorage.setItem('techUser', JSON.stringify(res.user));
        navigate('/technician');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
          const res = await api.register({
              name: regName,
              email: regEmail,
              phone: regPhone,
              password: regPassword
          });
          
          if (res.success) {
              localStorage.setItem('customerToken', res.token);
              localStorage.setItem('customerUser', JSON.stringify(res.user));
              navigate('/dashboard');
          }
      } catch (err: any) {
          setError(err.message || "Registration failed");
      } finally {
          setLoading(false);
      }
  };

  const handleForgotPass = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          if (resetStep === 1) {
              await api.requestPasswordReset(resetEmail);
              setResetStep(2);
              setResetMessage("Verification code sent to email.");
          } else {
              await api.resetPassword(resetEmail, newPassword);
              setResetMessage("Password updated! Please login.");
              setTimeout(() => {
                  setShowForgotPass(false);
                  setResetStep(1);
                  setResetMessage("");
              }, 2000);
          }
      } catch(e) {
          setError("Operation failed. Try again.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-20">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 relative">
        
        {/* Return Link */}
        <Link to="/" className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-medium transition-colors z-10">
            <ArrowLeft size={16} /> Website
        </Link>

        {/* Header */}
        <div className="p-8 pb-0 text-center mt-6">
           <div className="flex justify-center mb-6">
             <Logo className="h-10" />
           </div>
           <h2 className="text-2xl font-bold text-slate-900">
               {showForgotPass ? "Recover Account" : (isRegistering ? "Create Account" : "Welcome Back")}
           </h2>
           <p className="text-slate-500 text-sm mt-1">
               {showForgotPass ? "Reset your password securely" : (isRegistering ? "Join Buzzitech for better service" : "Access your portal below")}
           </p>
        </div>

        {/* Tabs - Only show if not registering and not forgot pass */}
        {!isRegistering && !showForgotPass && (
            <div className="flex border-b border-gray-100 mt-6 px-4 gap-2">
                <button 
                    onClick={() => setActiveTab('customer')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'customer' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    Customer
                </button>
                <button 
                    onClick={() => setActiveTab('technician')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'technician' ? 'border-green-600 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    Technician
                </button>
            </div>
        )}

        {/* Form Container */}
        <div className="p-8">
           
           {/* Context Banner */}
           {!isRegistering && !showForgotPass && (
               <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 text-sm ${
                   activeTab === 'customer' ? 'bg-blue-50 text-blue-800' : 
                   'bg-green-50 text-green-800'
               }`}>
                   {activeTab === 'customer' && <User size={20} />}
                   {activeTab === 'technician' && <Wrench size={20} />}
                   
                   <span>
                       {activeTab === 'customer' && "Track orders & tickets."}
                       {activeTab === 'technician' && "View assigned tasks."}
                   </span>
               </div>
           )}

           {(error || resetMessage) && (
               <div className={`mb-4 text-sm p-3 rounded-lg flex items-center gap-2 ${error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                   <AlertCircle size={16} /> {error || resetMessage}
               </div>
           )}

           {showForgotPass ? (
               // FORGOT PASSWORD FORM
               <form onSubmit={handleForgotPass} className="space-y-4">
                   {resetStep === 1 ? (
                       <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Enter Email</label>
                           <input 
                               type="email" required
                               className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                               value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                           />
                       </div>
                   ) : (
                       <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">New Password</label>
                           <div className="relative">
                               <input 
                                   type="password" required
                                   className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                                   value={newPassword} onChange={e => setNewPassword(e.target.value)}
                               />
                               <Key className="absolute right-3 top-3 text-slate-400" size={18} />
                           </div>
                       </div>
                   )}
                   <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
                       {loading ? 'Processing...' : (resetStep === 1 ? 'Verify Email' : 'Set New Password')}
                   </Button>
                   <button type="button" onClick={() => { setShowForgotPass(false); setResetStep(1); }} className="w-full text-center text-sm text-slate-500 mt-4 hover:text-slate-800 underline">
                       Back to Login
                   </button>
               </form>
           ) : isRegistering ? (
               // REGISTER FORM
               <form onSubmit={handleRegister} className="space-y-4">
                   <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Full Name</label>
                       <input 
                           type="text" required
                           className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                           placeholder="John Doe"
                           value={regName} onChange={e => setRegName(e.target.value)}
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Address</label>
                       <input 
                           type="email" required
                           className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                           placeholder="name@example.com"
                           value={regEmail} onChange={e => setRegEmail(e.target.value)}
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Phone Number</label>
                       <input 
                           type="tel" required
                           className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                           placeholder="050..."
                           value={regPhone} onChange={e => setRegPhone(e.target.value)}
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Password</label>
                       <input 
                           type="password" required
                           className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                           placeholder="Create a password"
                           value={regPassword} onChange={e => setRegPassword(e.target.value)}
                       />
                   </div>
                   <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register Now'}
                   </Button>
                   <div className="text-center mt-4">
                       <button type="button" onClick={() => setIsRegistering(false)} className="text-sm text-primary-600 hover:underline">
                           Already have an account? Login
                       </button>
                   </div>
               </form>
           ) : (
               // LOGIN FORM
               <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Address</label>
                     <input 
                       type="email" 
                       required
                       className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition"
                       placeholder="name@example.com"
                       value={email}
                       onChange={e => setEmail(e.target.value)}
                     />
                  </div>
                  <div>
                     <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase">
                            {activeTab === 'customer' ? 'Phone (or Password)' : 'Password'}
                        </label>
                        <button type="button" onClick={() => setShowForgotPass(true)} className="text-xs text-primary-600 hover:text-primary-800">
                            Forgot Password?
                        </button>
                     </div>
                     <input 
                       type="password" 
                       required
                       className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition"
                       placeholder="••••••••"
                       value={password}
                       onChange={e => setPassword(e.target.value)}
                     />
                  </div>

                  <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
                     {loading ? 'Authenticating...' : `Login as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                  </Button>

                  {activeTab === 'customer' && (
                      <div className="text-center mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm text-slate-500 mb-2">New to Buzzitech?</p>
                          <button type="button" onClick={() => setIsRegistering(true)} className="flex items-center justify-center gap-2 w-full py-2 border border-primary-200 rounded-lg text-primary-700 hover:bg-primary-50 transition font-medium text-sm">
                              <UserPlus size={16} /> Create Customer Account
                          </button>
                      </div>
                  )}
               </form>
           )}
        </div>

      </div>
    </div>
  );
};

export default Login;