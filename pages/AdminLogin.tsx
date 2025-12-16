import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowLeft, Key, CheckCircle, Shield } from 'lucide-react';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { api } from '../services/api';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot Password State (Secured)
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Code, 3: New Pass
  const [resetMessage, setResetMessage] = useState('');
  
  // 2FA State
  const [is2FA, setIs2FA] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login(email, password);
      
      // Strict Role Check for Admin Portal
      if (!res.isAdmin && res.user.role !== 'admin') {
          setError("Access Denied: You do not have administrator privileges.");
          setLoading(false);
          return;
      }

      if (res.requiresTwoFactor) {
          setIs2FA(true);
          setResetEmail(res.email);
          setResetMessage("2FA Enabled. Please enter the code sent to your email.");
      } else {
          // Store Auth Data
          localStorage.setItem('adminToken', res.token);
          localStorage.setItem('adminUser', JSON.stringify({ name: res.user.name, email: res.user.email }));
          navigate('/admin/dashboard');
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      // Determine if it's a network error or credentials
      const errorMessage = err.message || '';
      if (errorMessage === 'Failed to fetch' || errorMessage === 'Load failed' || err.name === 'TypeError') {
          setError("Cannot connect to server. Ensure the backend is running on port 5000 and CORS is configured.");
      } else {
          setError(errorMessage || "Invalid credentials");
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
          
          if (!res.isAdmin && res.user.role !== 'admin') {
             setError("Access Denied: User is not an admin.");
             return;
          }

          localStorage.setItem('adminToken', res.token);
          localStorage.setItem('adminUser', JSON.stringify({ name: res.user.name, email: res.user.email }));
          navigate('/admin/dashboard');
      } catch (err: any) {
          setError(err.message || "Invalid Code");
      } finally {
          setLoading(false);
      }
  };

  const handleForgotPassRequest = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
          if (resetStep === 1) {
              await api.requestPasswordReset(resetEmail);
              setResetStep(2);
              setResetMessage("Verification code sent to email.");
          } else if (resetStep === 2) {
              await api.verifyResetCode(resetEmail, resetCode);
              setResetStep(3);
              setResetMessage("Code verified. Enter new password.");
          } else if (resetStep === 3) {
              await api.resetPassword(resetEmail, newPassword, resetCode);
              setResetMessage("Password reset successfully! Please login.");
              setTimeout(() => {
                  setShowForgotPass(false);
                  setResetStep(1);
                  setResetMessage("");
                  setResetCode("");
                  setNewPassword("");
                  setResetEmail("");
              }, 2000);
          }
      } catch (e: any) {
          setError(e.message || "Failed to process request.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 relative">
        
        {/* Back Link */}
        <Link to="/" className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-medium transition-colors">
            <ArrowLeft size={16} /> Return to Website
        </Link>

        <div className="flex justify-center mb-8 mt-6">
          <Logo className="h-12" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
            {showForgotPass ? "Secure Recovery" : is2FA ? "Security Check" : "Admin Portal"}
        </h2>
        <p className="text-center text-slate-500 mb-6">
            {showForgotPass ? "Verify identity to reset password" : is2FA ? "Two-Factor Authentication Required" : "Sign in to manage orders & inventory"}
        </p>
        
        {(error || resetMessage) && (
          <div className={`p-3 rounded-lg flex items-center gap-2 mb-6 text-sm ${error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {error ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {error || resetMessage}
          </div>
        )}

        {showForgotPass ? (
            <form onSubmit={handleForgotPassRequest} className="space-y-5">
                
                {/* Step Indicator */}
                <div className="flex justify-center gap-2 mb-4">
                    <div className={`h-1 w-8 rounded-full ${resetStep >= 1 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>
                    <div className={`h-1 w-8 rounded-full ${resetStep >= 2 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>
                    <div className={`h-1 w-8 rounded-full ${resetStep >= 3 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>
                </div>

                {resetStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Enter Admin Email</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="email" required
                                value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 bg-white"
                                placeholder="admin@buzzitech.com"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {resetStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
                        <div className="relative">
                            <input 
                                type="text" required
                                value={resetCode} onChange={(e) => setResetCode(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 bg-white text-center font-mono text-lg tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                autoFocus
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-center">Check email for 6-digit code.</p>
                    </div>
                )}

                {resetStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="password" required
                                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 bg-white"
                                placeholder="Create new password"
                                autoFocus
                            />
                        </div>
                    </div>
                )}
                
                <Button type="submit" className="w-full py-3" disabled={loading}>
                    {loading ? 'Processing...' : (resetStep === 1 ? 'Send Code' : resetStep === 2 ? 'Verify Code' : 'Update Password')}
                </Button>
                
                <div className="text-center mt-4">
                    <button type="button" onClick={() => { setShowForgotPass(false); setResetStep(1); setError(''); setResetMessage(''); }} className="text-sm text-slate-500 hover:text-slate-800 underline">
                        Cancel
                    </button>
                </div>
            </form>
        ) : is2FA ? (
            <form onSubmit={handle2FAVerify} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">2FA Verification Code</label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" required
                            value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 bg-white tracking-widest"
                            placeholder="000000"
                            maxLength={6}
                            autoFocus
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-center">Code sent to {resetEmail}</p>
                </div>
                <Button type="submit" className="w-full py-3" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify & Login'}
                </Button>
                <div className="text-center mt-4">
                    <button type="button" onClick={() => { setIs2FA(false); setResetMessage(""); }} className="text-sm text-slate-500 hover:text-slate-800 underline">
                        Cancel
                    </button>
                </div>
            </form>
        ) : (
            <form onSubmit={handleLogin} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="email" 
                    required
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 bg-white"
                    placeholder="admin@buzzitech.com"
                />
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <button type="button" onClick={() => { setShowForgotPass(true); setError(''); setResetMessage(''); }} className="text-xs text-primary-600 hover:text-primary-800">
                        Forgot Password?
                    </button>
                </div>
                <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="password" 
                    required
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 bg-white"
                    placeholder="••••••••"
                />
                </div>
            </div>

            <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? 'Authenticating...' : 'Secure Login'}
            </Button>
            </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;