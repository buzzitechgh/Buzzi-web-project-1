import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, Facebook, Twitter, Linkedin, Instagram, ShoppingCart, Lock, User, LayoutDashboard } from 'lucide-react';
import { COMPANY_INFO } from '../constants';
import ChatWidget from './ChatWidget';
import Logo from './Logo';
import NetworkCursor from './NetworkCursor';
import { useCart } from '../context/CartContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Auth State
  const [userSession, setUserSession] = useState<{ type: 'admin' | 'tech' | 'customer', name: string } | null>(null);

  const location = useLocation();
  const { totalItems, lastAdded } = useCart();
  
  // Animation states
  const [isBumping, setIsBumping] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Define pages that have a light background at the top
  const isLightPage = ['/store', '/checkout', '/login'].includes(location.pathname);
  
  // Check if we are on an admin route or dashboard
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/technician');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check Auth State on Route Change
  useEffect(() => {
    setIsMenuOpen(false);
    
    const adminToken = localStorage.getItem('adminToken');
    const techToken = localStorage.getItem('techToken');
    const custToken = localStorage.getItem('customerToken');

    if (adminToken) {
        setUserSession({ type: 'admin', name: 'Admin' });
    } else if (techToken) {
        setUserSession({ type: 'tech', name: 'Technician' });
    } else if (custToken) {
        const user = JSON.parse(localStorage.getItem('customerUser') || '{}');
        setUserSession({ type: 'customer', name: user.name || 'Account' });
    } else {
        setUserSession(null);
    }

  }, [location]);

  // Trigger "Bump" animation when an item is added
  useEffect(() => {
    if (lastAdded > 0) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 300);
      return () => clearTimeout(timer);
    }
  }, [lastAdded]);

  // Trigger periodic "Shake/Vibrate" if items exist to encourage checkout
  useEffect(() => {
    if (totalItems > 0) {
      const interval = setInterval(() => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 1000);
      }, 5000); // Shake every 5 seconds
      return () => clearInterval(interval);
    }
  }, [totalItems]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Store', path: '/store' },
    { name: 'Track Order', path: '/tracking' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Book Appointment', path: '/booking' },
  ];

  // Determine text color based on scroll state or page type
  const headerTextColorClass = isScrolled || isLightPage 
    ? 'text-slate-600 hover:text-primary-600' 
    : 'text-gray-100 hover:text-white';

  const iconColorClass = isScrolled || isLightPage 
    ? 'text-slate-800' 
    : 'text-white';

  // If Admin/Dashboard Route, render a simplified layout
  if (isAdminRoute) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <NetworkCursor />
        {children}
      </div>
    );
  }

  const getDashboardLink = () => {
      switch(userSession?.type) {
          case 'admin': return '/admin/dashboard';
          case 'tech': return '/technician';
          case 'customer': return '/dashboard';
          default: return '/login';
      }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Global Background Effects */}
      <NetworkCursor />

      {/* Styles for Cart Animations */}
      <style>{`
        @keyframes cart-bump {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes cart-shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        .animate-cart-bump {
          animation: cart-bump 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .animate-cart-shake {
          animation: cart-shake 0.5s ease-in-out;
        }
      `}</style>

      {/* Header */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
               {/* Pass lightMode true if NOT scrolled AND NOT a light page */}
               <Logo lightMode={!isScrolled && !isLightPage} className="h-12" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-6 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-primary-600'
                      : headerTextColorClass
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Cart Icon */}
              <Link 
                to="/checkout" 
                className={`relative p-2 rounded-full transition-colors ${
                  isScrolled || isLightPage ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                } ${iconColorClass} ${isBumping ? 'animate-cart-bump text-brand-yellow' : ''} ${isShaking ? 'animate-cart-shake' : ''}`}
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>

              {userSession ? (
                  <Link
                    to={getDashboardLink()}
                    className={`flex items-center gap-1 text-sm font-bold transition-colors ${
                        isScrolled || isLightPage ? 'text-primary-600 hover:text-primary-800' : 'text-brand-yellow hover:text-white'
                    }`}
                  >
                    <LayoutDashboard size={18} /> {userSession.type === 'customer' ? 'My Dashboard' : 'Portal'}
                  </Link>
              ) : (
                  <Link
                    to="/login"
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${headerTextColorClass}`}
                  >
                    <User size={18} /> Login
                  </Link>
              )}

              <Link
                to="/quote"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isScrolled || isLightPage
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : 'bg-white text-primary-600 hover:bg-gray-100'
                }`}
              >
                Get Quote
              </Link>
            </nav>

            {/* Mobile Menu Button & Cart */}
            <div className="flex items-center gap-4 md:hidden">
              <Link 
                to="/checkout" 
                className={`relative p-2 rounded-full ${iconColorClass} ${isBumping ? 'animate-cart-bump text-brand-yellow' : ''} ${isShaking ? 'animate-cart-shake' : ''}`}
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button
                className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X /> : <Menu className={iconColorClass} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-3 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {userSession ? (
                  <Link
                    to={getDashboardLink()}
                    className="block px-3 py-3 rounded-md text-base font-bold text-primary-600 bg-primary-50 hover:bg-primary-100"
                  >
                    Go to {userSession.type === 'customer' ? 'Dashboard' : 'Portal'}
                  </Link>
              ) : (
                  <Link
                    to="/login"
                    className="block px-3 py-3 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Login
                  </Link>
              )}

              <Link
                to="/quote"
                className="block w-full text-center mt-4 px-4 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700"
              >
                Get Service Quotation
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Chat Widget (AI Assistant) */}
      <ChatWidget />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-start -ml-2">
                 <Logo lightMode={true} className="h-10 scale-90 origin-left" />
              </div>
              <p className="text-sm leading-relaxed max-w-xs mt-2">
                Professional Tech Support & Digital Solutions. Providing top-tier IT services for businesses in Ghana.
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="hover:text-primary-400 transition"><Facebook size={20} /></a>
                <a href="#" className="hover:text-primary-400 transition"><Twitter size={20} /></a>
                <a href="#" className="hover:text-primary-400 transition"><Linkedin size={20} /></a>
                <a href="#" className="hover:text-primary-400 transition"><Instagram size={20} /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/store" className="hover:text-primary-400 transition">Shop Devices</Link></li>
                <li><Link to="/services" className="hover:text-primary-400 transition">Our Services</Link></li>
                <li><Link to="/tracking" className="hover:text-primary-400 transition">Track Order</Link></li>
                <li><Link to="/booking" className="hover:text-primary-400 transition">Book Appointment</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-semibold mb-4">Top Services</h3>
              <ul className="space-y-2">
                <li><Link to="/services" className="hover:text-primary-400 transition">Network Installation</Link></li>
                <li><Link to="/services" className="hover:text-primary-400 transition">CCTV Security</Link></li>
                <li><Link to="/services" className="hover:text-primary-400 transition">POS Systems</Link></li>
                <li><Link to="/services" className="hover:text-primary-400 transition">Starlink Internet</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Phone size={18} className="text-primary-400" />
                  <span>{COMPANY_INFO.phone}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail size={18} className="text-primary-400" />
                  <span>{COMPANY_INFO.email}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Buzzitech IT Solutions & Services. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
               {userSession ? (
                   <span className="text-slate-400">Logged in as {userSession.name}</span>
               ) : (
                   <>
                       <Link to="/login" className="hover:text-white transition">Staff Login</Link>
                       <Link to="/admin" className="hover:text-white transition">Admin Portal</Link>
                   </>
               )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;