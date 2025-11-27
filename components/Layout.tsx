import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { COMPANY_INFO } from '../constants';
import ChatWidget from './ChatWidget';
import Logo from './Logo';
import NetworkCursor from './NetworkCursor';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Book Appointment', path: '/booking' },
  ];

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Global Background Effects - NetworkBackground removed from here to be placed in Home */}
      <NetworkCursor />

      {/* Header */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
               {/* Pass lightMode true if not scrolled (transparent background on dark hero) */}
               <Logo lightMode={!isScrolled} className="h-12" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-primary-600'
                      : isScrolled 
                        ? 'text-slate-600 hover:text-primary-600' 
                        : 'text-gray-100 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/quote"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isScrolled 
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : 'bg-white text-primary-600 hover:bg-gray-100'
                }`}
              >
                Get Quote
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu className={isScrolled ? "text-slate-900" : "text-slate-900 md:text-white"} />}
            </button>
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
                <li><Link to="/about" className="hover:text-primary-400 transition">About Us</Link></li>
                <li><Link to="/services" className="hover:text-primary-400 transition">Our Services</Link></li>
                <li><Link to="/contact" className="hover:text-primary-400 transition">Contact Support</Link></li>
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
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Buzzitech IT Solutions & Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;