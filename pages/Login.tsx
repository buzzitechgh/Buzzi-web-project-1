
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Wrench, Shield, UserPlus, ArrowLeft, Key, AlertCircle, CheckCircle, Mail, Hash, Camera, Upload } from 'lucide-react';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { api } from '../services/api';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customer' | 'technician'>('customer');
  const [viewState, setViewState] = useState<'login' | 'register' | 'forgot_pass' | 'verify_email' | 'pending_approval' | 'verify_2fa'>('login');
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  // Technician Specific Registration
  const [techDepartment, setTechDepartment] = useState('Infrastructure');
  const [techSubRole, setTechSubRole] = useState('Network Engineer');
  const [techImage, setTechImage] = useState<File | null>(null);
  const [techImagePreview, setTechImagePreview] = useState<string | null>(null);

  // Forgot Password / Verification State
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Code, 3: New Pass (or Welcome)
  const [statusMessage, setStatusMessage] = useState('');
  
  // Result Data
  const [generatedTechId, setGeneratedTechId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Shared visible input style
  const inputVisibleClass = "w-full border border-slate-400 bg-slate-50 rounded-lg px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none placeholder-slate-400 transition-all font-medium";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setTechImage(file);
          const reader = new FileReader();
          reader.onloadend = () => setTechImagePreview(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Unified login call
      const res = await api.login(email, password);
      
      if (res.requiresTwoFactor) {
          setResetEmail(res.email);
          setViewState('verify_2fa');
          setStatusMessage("Two-Factor Authentication Required. Check your email.");
      } else {
          const storageKey = activeTab === 'technician' ? 'tech' : 'customer';
          localStorage.setItem(`${storageKey}Token`, res.token);
          localStorage.setItem(`${storageKey}User`, JSON.stringify(res.user));
          
          navigate(activeTab === 'technician' ? '/technician' : '/dashboard');
      }

    } catch (err: any) {
      if (err.requiresVerification) {
          setResetEmail(err.email);
          setViewState('verify_email');
          setStatusMessage("Account verification required. A code has been sent to your email.");
      } else if (err.isPendingApproval) {
          setViewState('pending_approval');
      } else {
          setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
          const res = await api.verifyTwoFactor(resetEmail, resetCode);
          
          const storageKey = res.user.role === 'technician' ? 'tech' : 'customer';
          localStorage.setItem(`${storageKey}Token`, res.token);
          localStorage.setItem(`${storageKey}User`, JSON.stringify(res.user));
          
          navigate(res.user.role === 'technician' ? '/technician' : '/dashboard');
      } catch (err: any) {
          setError(err.message || "Invalid 2FA Code");
      } finally {
          setLoading(false);
      }
  };

  const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      if (regPassword !== regConfirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
      }

      try {
          let imageUrl = '';
          
          // Upload Image first if present
          if (activeTab === 'technician' && techImage) {
              imageUrl = await api.uploadImage(techImage);
          }

          const payload = {
              name: regName,
              email: regEmail,
              phone: regPhone,
              password: regPassword,
              role: activeTab,
              department: activeTab === 'technician' ? techDepartment : undefined,
              subRole: activeTab === 'technician' ? techSubRole : undefined,
              verificationImage: imageUrl
          };

          const res = await api.register(payload);
          
          if (res.requiresVerification) {
              setResetEmail(regEmail);
              setViewState('verify_email');
              setStatusMessage("Registration successful! Please verify your email with the code sent.");
          } else {
              setViewState('login');
              setStatusMessage("Account created. Please login.");
          }
      } catch (err: any) {
          setError(err.message || "Registration failed");
      } finally {
          setLoading(false);
      }
  };

  const handleVerification = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
          const res = await api.verifyEmail(resetEmail, resetCode);
          
          // Check if pending approval logic returned from backend
          if (res.isPendingApproval) {
              setViewState('pending_approval');
              return;
          }

          if (res.success) {
              setStatusMessage(res.message);
              
              if (res.user.role === 'technician' && res.user.technicianId) {
                  setGeneratedTechId(res.user.technicianId);
                  // Don't navigate yet, let them see their ID
              } else {
                  // Auto login logic
                  const storageKey = res.user.role === 'technician' ? 'tech' : 'customer';
                  localStorage.setItem(`${storageKey}Token`, res.token);
                  localStorage.setItem(`${storageKey}User`, JSON.stringify(res.user));
                  setTimeout(() => navigate(res.user.role === 'technician' ? '/technician' : '/dashboard'), 1500);
              }
          }
      } catch (e: any) {
          setError(e.message || "Verification failed");
      } finally {
          setLoading(false);
      }
  };

  const handleForgotPass = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
          if (resetStep === 1) {
              await api.requestPasswordReset(resetEmail);
              setResetStep(2);
              setStatusMessage(`Verification code sent to ${resetEmail}`);
          } else if (resetStep === 2) {
              await api.verifyResetCode(resetEmail, resetCode);
              setResetStep(3);
              setStatusMessage("Code Verified. Set your new password.");
          } else if (resetStep === 3) {
              await api.resetPassword(resetEmail, newPassword, resetCode);
              setStatusMessage("Password updated! Redirecting to login...");
              setTimeout(() => {
                  setViewState('login');
                  setResetStep(1);
                  setStatusMessage("");
                  setResetCode("");
                  setResetEmail("");
                  setNewPassword("");
              }, 2000);
          }
      } catch(e: any) {
          setError(e.message || "Operation failed. Try again.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-20">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 relative">
        
        <Link to="/" className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-medium transition-colors z-10">
            <ArrowLeft size={16} /> Website
        </Link>

        {/* Header */}
        <div className="p-8 pb-0 text-center mt-6">
           <div className="flex justify-center mb-6">
             <Logo className="h-10" />
           </div>
           <h2 className="text-2xl font-bold text-slate-900">
               {viewState === 'forgot_pass' ? "Recover Account" : 
                viewState === 'verify_email' ? "Verify Email" :
                viewState === 'verify_2fa' ? "Security Verification" :
                viewState === 'pending_approval' ? "Approval Pending" :
                viewState === 'register' ? "Create Account" : "Welcome Back"}
           </h2>
           <p className="text-slate-500 text-sm mt-1">
               {viewState === 'forgot_pass' ? "Secure password reset" : 
                viewState === 'verify_email' ? "Enter the code sent to your inbox" :
                viewState === 'verify_2fa' ? "Enter 2-Factor Authentication Code" :
                viewState === 'pending_approval' ? "Technician Verification" :
                viewState === 'register' ? `Join as a ${activeTab}` : "Access your portal below"}
           </p>
        </div>

        {/* Tabs - Only show on Login/Register to switch context */}
        {(viewState === 'login' || viewState === 'register') && (
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

        <div className="p-8">
           
           {(error || statusMessage) && (
               <div className={`mb-4 text-sm p-3 rounded-lg flex items-center gap-2 ${error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                   {error ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {error || statusMessage}
               </div>
           )}

           {viewState === 'pending_approval' ? (
               <div className="text-center">
                   <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Shield size={32} />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Account Under Review</h3>
                   <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                       Thank you for registering. For security reasons, all technician accounts must be manually approved by an administrator before access is granted.
                   </p>
                   <p className="text-xs text-slate-400 mb-6">
                       You will receive an email once your account status changes.
                   </p>
                   <Button onClick={() => setViewState('login')} className="w-full">Return to Login</Button>
               </div>
           ) : viewState === 'verify_email' ? (
               // VERIFICATION FORM (Registration)
               <div className="text-center">
                   {generatedTechId ? (
                       <div className="animate-in zoom-in duration-300">
                           <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                               <Hash size={32} />
                           </div>
                           <h3 className="text-xl font-bold text-slate-900 mb-2">Verification Complete!</h3>
                           <p className="text-slate-500 text-sm mb-4">Your account is active. Here is your official ID:</p>
                           <div className="bg-slate-100 border-2 border-dashed border-slate-300 p-4 rounded-xl mb-6">
                               <span className="text-3xl font-mono font-bold text-slate-800 tracking-wider select-all">{generatedTechId}</span>
                           </div>
                           <Button onClick={() => navigate('/technician')} className="w-full">Go to Portal</Button>
                       </div>
                   ) : (
                       <form onSubmit={handleVerification} className="space-y-4">
                           <div>
                               <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Address</label>
                               <input type="email" value={resetEmail} readOnly className="w-full border border-gray-200 bg-gray-50 text-slate-500 rounded-lg px-4 py-3 outline-none" />
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Enter 6-Digit Code</label>
                               <input 
                                   type="text" required autoFocus
                                   className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none text-center tracking-[0.5em] text-xl font-mono"
                                   value={resetCode} onChange={e => setResetCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                   placeholder="000000"
                               />
                           </div>
                           <Button type="submit" className="w-full py-3" disabled={loading}>
                               {loading ? 'Verifying...' : 'Verify & Activate'}
                           </Button>
                           <button type="button" onClick={() => api.resendOtp(resetEmail).then(() => setStatusMessage("New code sent!"))} className="text-sm text-primary-600 hover:underline">
                               Resend Code
                           </button>
                       </form>
                   )}
               </div>
           ) : viewState === 'verify_2fa' ? (
                // 2FA VERIFICATION FORM (Login)
                <form onSubmit={handle2FAVerify} className="space-y-4">
                    <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Shield size={24} />
                        </div>
                        <p className="text-xs text-slate-500">A security code has been sent to <strong>{resetEmail}</strong></p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Verification Code</label>
                        <input 
                            type="text" required autoFocus
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none text-center tracking-[0.5em] text-xl font-mono"
                            value={resetCode} onChange={e => setResetCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            placeholder="000000"
                        />
                    </div>
                    <Button type="submit" className="w-full py-3" disabled={loading}>
                        {loading ? 'Verifying...' : 'Confirm & Login'}
                    </Button>
                    <button type="button" onClick={() => api.resendOtp(resetEmail).then(() => setStatusMessage("New code sent!"))} className="w-full text-center text-sm text-primary-600 hover:underline mt-2">
                        Resend Code
                    </button>
                    <button type="button" onClick={() => { setViewState('login'); setStatusMessage(""); setResetCode(""); }} className="w-full text-center text-sm text-slate-400 hover:text-slate-600 mt-2">
                        Cancel Login
                    </button>
                </form>
           ) : viewState === 'forgot_pass' ? (
               // FORGOT PASSWORD FORM
               <form onSubmit={handleForgotPass} className="space-y-4">
                   {resetStep === 1 && (
                       <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Enter Email Address</label>
                           <input type="email" required autoFocus className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="you@example.com" />
                       </div>
                   )}
                   {resetStep === 2 && (
                       <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Enter Verification Code</label>
                           <input type="text" required autoFocus className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none text-center tracking-[0.5em] font-mono text-xl" value={resetCode} onChange={e => setResetCode(e.target.value)} placeholder="000000" maxLength={6} />
                       </div>
                   )}
                   {resetStep === 3 && (
                       <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Create New Password</label>
                           <input type="password" required autoFocus className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
                       </div>
                   )}
                   <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
                       {loading ? 'Processing...' : (resetStep === 1 ? 'Send Code' : resetStep === 2 ? 'Verify Code' : 'Reset Password')}
                   </Button>
                   <button type="button" onClick={() => { setViewState('login'); setResetStep(1); setStatusMessage(""); }} className="w-full text-center text-sm text-slate-500 mt-4 hover:text-slate-800 underline">
                       Back to Login
                   </button>
               </form>
           ) : viewState === 'register' ? (
               // REGISTER FORM
               <form onSubmit={handleRegister} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                       <div className="col-span-2">
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Full Name</label>
                           <input type="text" required className={inputVisibleClass} placeholder="John Doe" value={regName} onChange={e => setRegName(e.target.value)} />
                       </div>
                       <div className="col-span-2">
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Address</label>
                           <input type="email" required className={inputVisibleClass} placeholder="name@example.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                       </div>
                       <div className="col-span-2">
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Phone Number</label>
                           <input type="tel" required className={inputVisibleClass} placeholder="050..." value={regPhone} onChange={e => setRegPhone(e.target.value)} />
                       </div>
                       
                       {/* Technician Specific Fields */}
                       {activeTab === 'technician' && (
                           <>
                               <div className="col-span-1">
                                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Department</label>
                                   <select className={`${inputVisibleClass} text-xs py-3`} value={techDepartment} onChange={e => setTechDepartment(e.target.value)}>
                                       <option value="Infrastructure">Infrastructure</option>
                                       <option value="Security">Security (CCTV)</option>
                                       <option value="IT Support">IT Support</option>
                                       <option value="Field Ops">Field Ops</option>
                                   </select>
                               </div>
                               <div className="col-span-1">
                                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Role</label>
                                   <select className={`${inputVisibleClass} text-xs py-3`} value={techSubRole} onChange={e => setTechSubRole(e.target.value)}>
                                       <option value="Network Engineer">Network Engineer</option>
                                       <option value="CCTV Specialist">CCTV Specialist</option>
                                       <option value="Field Technician">Field Technician</option>
                                       <option value="System Administrator">System Administrator</option>
                                   </select>
                               </div>
                               
                               {/* Image Capture for Technicians */}
                               <div className="col-span-2">
                                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Technician ID / Photo</label>
                                   <div className="flex items-center gap-4">
                                       <label className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition bg-white">
                                           {techImagePreview ? (
                                               <img src={techImagePreview} alt="Preview" className="h-24 object-contain rounded" />
                                           ) : (
                                               <div className="text-center text-slate-400">
                                                   <Camera size={24} className="mx-auto mb-1" />
                                                   <span className="text-xs">Take Photo / Upload</span>
                                               </div>
                                           )}
                                           <input 
                                               type="file" 
                                               accept="image/*" 
                                               capture="user" // Opens front camera on mobile
                                               className="hidden" 
                                               onChange={handleImageChange}
                                           />
                                       </label>
                                   </div>
                               </div>
                           </>
                       )}

                       <div className="col-span-2">
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Password</label>
                           <input type="password" required className={inputVisibleClass} placeholder="Create password" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                       </div>
                       <div className="col-span-2">
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Confirm Password</label>
                           <input type="password" required className={inputVisibleClass} placeholder="Re-enter password" value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} />
                       </div>
                   </div>
                   <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
                        {loading ? 'Creating Account...' : `Register as ${activeTab}`}
                   </Button>
                   <div className="text-center mt-4">
                       <button type="button" onClick={() => setViewState('login')} className="text-sm text-primary-600 hover:underline">
                           Already have an account? Login
                       </button>
                   </div>
               </form>
           ) : (
               // LOGIN FORM
               <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Address</label>
                     <input type="email" required className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div>
                     <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Password</label>
                        <button type="button" onClick={() => { setViewState('forgot_pass'); setStatusMessage(''); }} className="text-xs text-primary-600 hover:text-primary-800">Forgot Password?</button>
                     </div>
                     <input type="password" required className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>

                  <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
                     {loading ? 'Authenticating...' : `Login as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                  </Button>

                  <div className="text-center mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-slate-500 mb-2">New to Buzzitech?</p>
                      <button type="button" onClick={() => setViewState('register')} className="flex items-center justify-center gap-2 w-full py-2 border border-primary-200 rounded-lg text-primary-700 hover:bg-primary-50 transition font-medium text-sm">
                          <UserPlus size={16} /> Create {activeTab === 'technician' ? 'Technician' : 'Customer'} Account
                      </button>
                  </div>
               </form>
           )}
        </div>
      </div>
    </div>
  );
};

export default Login;
