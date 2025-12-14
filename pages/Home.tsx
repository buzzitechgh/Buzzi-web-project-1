import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Shield, Cpu, Network, Zap, Satellite, Video, Server, Star, Wifi, ShoppingCart, Globe, PhoneCall, X, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import { SERVICES } from '../constants';
import { Link } from 'react-router-dom';
import NetworkBackground from '../components/NetworkBackground';
import { api } from '../services/api';

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Lead Form State (Bottom Section)
  const [leadContact, setLeadContact] = useState("");
  const [leadSent, setLeadSent] = useState(false);
  
  // Modal State (Hero Section)
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [modalContact, setModalContact] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);

  const [slideImages, setSlideImages] = useState<string[]>([
      "https://images.unsplash.com/photo-1551703606-2ad43d5b24c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1599256872237-5dcc0fbe9668?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1544652478-6653e09f1826?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1621905251189-08b95d6c2a81?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2060&q=80"
  ]);

  useEffect(() => {
      api.getSiteImages().then(images => {
          if (images) {
              const newSlides = [...slideImages];
              if (images.slide_1) newSlides[0] = images.slide_1;
              if (images.slide_2) newSlides[1] = images.slide_2;
              if (images.slide_3) newSlides[2] = images.slide_3;
              if (images.slide_4) newSlides[3] = images.slide_4;
              if (images.slide_5) newSlides[4] = images.slide_5;
              setSlideImages(newSlides);
          }
      });
  }, []);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneRegex = /^[0-9\-\+\s]{9,}$/;
    if (!phoneRegex.test(leadContact)) {
        alert("Please enter a valid phone number.");
        return;
    }
    await api.submitLead(leadContact);
    setLeadSent(true);
    setTimeout(() => setLeadSent(false), 3000);
    setLeadContact("");
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneRegex = /^[0-9\-\+\s]{9,}$/;
    if (!phoneRegex.test(modalContact)) {
        alert("Please enter a valid phone number.");
        return;
    }
    
    setModalLoading(true);
    try {
        await api.submitLead(modalContact);
        setModalSuccess(true);
        setModalContact("");
        setTimeout(() => {
            setShowCallbackModal(false);
            setModalSuccess(false);
        }, 3000);
    } catch (e) {
        alert("Failed to submit request. Please try again.");
    } finally {
        setModalLoading(false);
    }
  };

  // 5 Specific Slides with Professional Imagery
  const slides = [
    {
      id: 1,
      image: slideImages[0],
      title: "Network Engineering",
      subtitle: "Enterprise Structured Cabling & Server Racks",
      icon: Network,
      color: "text-blue-400"
    },
    {
      id: 2,
      image: slideImages[1],
      title: "CCTV Security Systems",
      subtitle: "Advanced Surveillance & Remote Monitoring",
      icon: Video,
      color: "text-red-400"
    },
    {
      id: 3,
      image: slideImages[2],
      title: "Starlink Setup",
      subtitle: "High-Speed Satellite Internet Installation",
      icon: Satellite,
      color: "text-brand-yellow"
    },
    {
      id: 4,
      image: slideImages[3],
      title: "Hotspot WiFi Deployment",
      subtitle: "Long-Range Connectivity Solutions",
      icon: Wifi,
      color: "text-green-400"
    },
    {
      id: 5,
      image: slideImages[4],
      title: "POS & Digital Solutions",
      subtitle: "Point of Sale, Web Design & Cloud Computing",
      icon: ShoppingCart,
      color: "text-purple-400"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Change slide every 6 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="overflow-hidden bg-slate-50">
      {/* High-Tech Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-primary-900 overflow-hidden">
        
        {/* Network Background - Positioned Absolute over the Hero, High Z-Index to blend in foreground */}
        <NetworkBackground className="absolute inset-0 z-30" />

        {/* Technological Background Overlay (Behind network nodes) */}
        <div className="absolute inset-0 z-0">
          {/* Base Dark Blue Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900"></div>
          
          {/* Circuit Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 bg-circuit"></div>
          
          {/* Tech Image Overlay (Satellite/Connectivity Vibe for Starlink hint) */}
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80"
            alt="Global Connectivity" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
          
          {/* Animated Glows */}
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-yellow rounded-full blur-[100px] opacity-10"></div>
        </div>

        <div className="container mx-auto px-4 relative z-40 pt-24 pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-md">
                <span className="flex h-2.5 w-2.5 rounded-full bg-brand-yellow shadow-[0_0_10px_#FFB800]"></span>
                <span className="text-white text-sm font-medium tracking-wide">Infrastructure. Security. Digital.</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
                Expert <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-brand-yellow text-glow">
                  IT Engineering
                </span>
              </h1>
              
              <p className="text-lg text-blue-100 mb-8 max-w-xl leading-relaxed border-l-4 border-brand-yellow pl-4">
                Specializing in Network Engineering, CCTV Security, Starlink Installation, Hotspot WiFi, and POS Systems for modern businesses.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <Button to="/booking" variant="primary" className="bg-brand-yellow hover:bg-yellow-500 text-slate-900 border-none font-bold">
                  Book Service
                </Button>
                <Button to="/quote" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                  Get Quote
                </Button>
                <button 
                  onClick={() => setShowCallbackModal(true)}
                  className="px-6 py-3 rounded-md border border-white/30 text-white font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <PhoneCall size={18} /> Request Callback
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 flex items-center space-x-6 text-white/60 text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-brand-yellow" />
                  <span>Expert Engineers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-brand-yellow" />
                  <span>Certified Installers</span>
                </div>
              </div>
            </motion.div>

            {/* Right Visuals (Image Carousel) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2 relative"
            >
              {/* Main Image Frame - Carousel */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800 aspect-[4/3] group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={slides[currentSlide].image}
                      alt={slides[currentSlide].title}
                      className="w-full h-full object-cover opacity-90 transition-transform duration-[6000ms] ease-linear transform scale-100 group-hover:scale-105"
                    />
                    
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Dynamic Overlay Badge */}
                <div className="absolute bottom-6 left-6 right-6">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentSlide}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-lg flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                         <div className={`p-2.5 rounded-lg bg-slate-900/50 ${slides[currentSlide].color}`}>
                           {React.createElement(slides[currentSlide].icon, { size: 24 })}
                         </div>
                         <div>
                           <p className="text-white font-bold text-lg leading-tight">{slides[currentSlide].title}</p>
                           <p className="text-xs text-slate-300 uppercase tracking-wider">{slides[currentSlide].subtitle}</p>
                         </div>
                      </div>
                      
                      {/* Progress/Navigation Dots */}
                      <div className="flex space-x-1.5">
                        {slides.map((_, idx) => (
                          <div 
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              idx === currentSlide ? 'w-6 bg-brand-yellow' : 'w-1.5 bg-white/30 hover:bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Top Badge (Static) */}
                <div className="absolute top-6 right-6 bg-brand-yellow text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-20">
                  <span className="flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Premium Service
                  </span>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 border-t-4 border-r-4 border-brand-yellow rounded-tr-3xl z-0 opacity-60"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-b-4 border-l-4 border-blue-500 rounded-bl-3xl z-0 opacity-60"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid (Aligned with Image) */}
      <section className="py-24 relative bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-brand-yellow uppercase tracking-widest mb-2">Our Capabilities</h2>
            <h3 className="text-4xl font-extrabold text-primary-900">Comprehensive IT Services</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.slice(0, 6).map((service, index) => (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-slate-50 rounded-xl p-8 hover:bg-primary-900 transition-all duration-300 shadow-sm hover:shadow-2xl border border-slate-200 hover:border-primary-700"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity"></div>

                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center text-primary-600 mb-6 shadow-md group-hover:scale-110 transition-transform">
                    <service.icon size={28} strokeWidth={2} />
                  </div>
                  
                  <h4 className="text-xl font-bold text-slate-900 group-hover:text-white mb-3 transition-colors">
                    {service.title}
                  </h4>
                  
                  <p className="text-slate-600 group-hover:text-blue-100 text-sm leading-relaxed mb-6 transition-colors">
                    {service.description}
                  </p>
                  
                  <Link to="/services" className="inline-flex items-center text-sm font-bold text-primary-600 group-hover:text-brand-yellow uppercase tracking-wide">
                    Details <ArrowRight size={14} className="ml-2" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Strip - "Circuit" Theme */}
      <section className="bg-primary-950 py-16 border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { icon: Network, label: "Network Design" },
              { icon: Wifi, label: "Hotspot WiFi" },
              { icon: Satellite, label: "Starlink Setup" },
              { icon: ShoppingCart, label: "POS Systems" },
              { icon: Globe, label: "Web & Cloud" }
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-4 text-white/80">
                <item.icon className="text-brand-yellow" size={32} />
                <span className="text-lg font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Lead Form */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-circuit opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-900 mb-6">Upgrade Your Infrastructure Today</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-10 text-lg">
            From CCTV and Starlink to POS and Cloud solutions, we power your business.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button to="/contact" className="bg-primary-800 text-white hover:bg-primary-900 shadow-xl">Contact Us</Button>
            <Button to="/quote" variant="outline" className="border-primary-800 text-primary-800 hover:bg-primary-50">Request Quote</Button>
          </div>

          {/* Quick Lead Generation Form */}
          <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
             <h4 className="text-lg font-bold text-slate-900 mb-2">Request a Quick Callback</h4>
             <p className="text-sm text-slate-500 mb-4">Enter your number, and we'll call you ASAP.</p>
             {leadSent ? (
               <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center justify-center gap-2">
                 <CheckCircle size={18} /> Request Sent!
               </div>
             ) : (
               <form onSubmit={handleLeadSubmit} className="flex gap-2">
                 <input 
                   type="tel" 
                   required
                   pattern="[0-9\-\+\s]{9,}"
                   placeholder="Your Phone Number" 
                   value={leadContact}
                   onChange={(e) => setLeadContact(e.target.value)}
                   className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 bg-white"
                 />
                 <button type="submit" className="bg-brand-yellow text-slate-900 font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors">
                   <PhoneCall size={20} />
                 </button>
               </form>
             )}
          </div>
        </div>
      </section>

      {/* CALLBACK MODAL */}
      {showCallbackModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => setShowCallbackModal(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>
                
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-yellow">
                        <PhoneCall size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Request a Callback</h3>
                    <p className="text-slate-500 text-sm mt-1">Leave your number and our engineering team will call you shortly.</p>
                </div>

                {modalSuccess ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                        <CheckCircle size={32} className="mb-2" />
                        <span className="font-bold">Request Received!</span>
                        <span className="text-xs mt-1">We will be in touch soon.</span>
                    </div>
                ) : (
                    <form onSubmit={handleModalSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Phone Number</label>
                            <input 
                                type="tel" 
                                required
                                pattern="[0-9\-\+\s]{9,}"
                                autoFocus
                                placeholder="050 000 0000" 
                                value={modalContact}
                                onChange={(e) => setModalContact(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 bg-slate-50 text-lg font-medium text-center tracking-wide"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={modalLoading}
                            className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                        >
                            {modalLoading ? <Loader2 size={20} className="animate-spin" /> : "Call Me Back"}
                        </button>
                    </form>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;