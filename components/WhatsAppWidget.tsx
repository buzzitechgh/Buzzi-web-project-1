import React, { useState, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { COMPANY_INFO } from '../constants';

const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);

  // Trigger vibration effect periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setIsVibrating(true);
        // Stop vibrating after animation completes (1s)
        setTimeout(() => setIsVibrating(false), 1000);
      }
    }, 8000); // Vibrate every 8 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  const whatsappUrl = `https://wa.me/${COMPANY_INFO.whatsapp}?text=${encodeURIComponent("Hello Buzzitech, I need assistance with your IT services.")}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          15% { transform: rotate(-5deg) scale(1.1); }
          30% { transform: rotate(5deg) scale(1.1); }
          45% { transform: rotate(-5deg) scale(1.1); }
          60% { transform: rotate(5deg) scale(1.1); }
          75% { transform: rotate(0deg) scale(1); }
        }
        .animate-wiggle {
          animation: wiggle 1s ease-in-out;
        }
      `}</style>

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 origin-bottom-right border border-gray-100">
          {/* Header */}
          <div className="bg-[#075e54] p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle size={20} />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#075e54] rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm">Buzzitech Support</h3>
                <p className="text-xs text-green-100">Typically replies instantly</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="bg-[#e5ddd5] p-4 h-64 overflow-y-auto flex flex-col space-y-4 bg-opacity-50">
             <div className="bg-white p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm text-sm text-slate-800 self-start max-w-[90%]">
               Hello! 👋 Welcome to Buzzitech IT Solutions.
             </div>
             <div className="bg-white p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm text-sm text-slate-800 self-start max-w-[90%]">
               Connect with our AI Chatbot on WhatsApp for instant quotes, support, or booking.
             </div>
          </div>

          {/* Footer */}
          <div className="bg-white p-3 border-t border-gray-100">
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 rounded-full font-semibold transition-colors shadow-sm"
            >
              <span>Start Chat on WhatsApp</span>
              <Send size={16} />
            </a>
            <div className="text-center mt-2">
               <p className="text-[10px] text-gray-400">Powered by Buzzitech & n8n</p>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-slate-700' : 'bg-[#25D366] hover:bg-[#20bd5a]'} ${isVibrating && !isOpen ? 'animate-wiggle' : ''} text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center relative`}
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <div className="relative">
            {/* WhatsApp Icon SVG */}
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" className="fill-current">
               <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </div>
        )}
      </button>
    </div>
  );
};

export default WhatsAppWidget;