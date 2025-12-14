import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowLeft, Key } from 'lucide-react';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { api } from '../services/api';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot Password State
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: Request Email, 2: New Password
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email, password);
      
      // Store Auth Data
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify({ name: data.name, email: data.email }));
      
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassRequest = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await api.requestPasswordReset(resetEmail);
          setResetStep(2);
          setResetMessage("Verification code sent to your email.");
      } catch (e) {
          setError("Failed to send verification code.");
      } finally {
          setLoading(false);
      }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await api.resetPassword(resetEmail, newPassword);
          setResetMessage("Password reset successfully! Please login.");
          setTimeout(() => {
              setShowForgotPass(false);
              setResetStep(1);
              setResetMessage("");
          }, 2000);
      } catch (e) {
          setError("Failed to reset password.");
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
            {showForgotPass ? "Reset Password" : "Admin Portal"}
        </h2>
        <p className="text-center text-slate-500 mb-6">
            {showForgotPass ? "Secure account recovery" : "Sign in to manage orders & inventory"}
        </p>
        
        {(error || resetMessage) && (
          <div className={`p-3 rounded-lg flex items-center gap-2 mb-6 text-sm ${error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            <AlertCircle size={16} />
            {error || resetMessage}
          </div>
        )}

        {showForgotPass ? (
            <form onSubmit={resetStep === 1 ? handleForgotPassRequest : handlePasswordReset} className="space-y-5">
                {resetStep === 1 ? (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Enter Admin Email</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="email" required
                                value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 bg-white"
                                placeholder="admin@buzzitech.com"
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="password" required
                                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 bg-white"
                                placeholder="Create new password"
                            />
                        </div>
                    </div>
                )}
                
                <Button type="submit" className="w-full py-3" disabled={loading}>
                    {loading ? 'Processing...' : (resetStep === 1 ? 'Send Verification' : 'Update Password')}
                </Button>
                
                <div className="text-center mt-4">
                    <button type="button" onClick={() => setShowForgotPass(false)} className="text-sm text-slate-500 hover:text-slate-800 underline">
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
                    <button type="button" onClick={() => { setShowForgotPass(true); setError(''); }} className="text-xs text-primary-600 hover:text-primary-800">
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