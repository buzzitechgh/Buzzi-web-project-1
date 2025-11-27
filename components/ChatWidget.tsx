import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Phone, Bot, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! 👋 Welcome to Buzzitech.\n\nI can help you with:\n• Starlink & CCTV Prices 💰\n• Booking an Installation 📅\n• Requesting a Call Back 📞\n\nHow can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Initial Auto-Open, Welcome Sequence & Auto-Close
  useEffect(() => {
    let openTimeout: ReturnType<typeof setTimeout>;
    let closeTimeout: ReturnType<typeof setTimeout>;

    // 1. Wait 2.5 seconds after page load (let user see the hero section first)
    const startSequenceTimer = setTimeout(() => {
      // 2. Start Vibrate to grab attention
      setIsVibrating(true);
      
      // 3. Open the chat window after vibrating for 1 second
      openTimeout = setTimeout(() => {
        setIsVibrating(false);
        setIsOpen(true);

        // 4. Auto-minimize after 30 seconds
        closeTimeout = setTimeout(() => {
          setIsOpen((prev) => {
            // Only close if user hasn't already closed it (though setting false is safe)
            return false;
          });
        }, 30000);

      }, 1000);
    }, 2500);

    return () => {
      clearTimeout(startSequenceTimer);
      clearTimeout(openTimeout);
      clearTimeout(closeTimeout);
    };
  }, []);

  // Periodic Reminder Vibration (only if closed)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setIsVibrating(true);
        setTimeout(() => setIsVibrating(false), 1000);
      }
    }, 15000); // Remind every 15 seconds if closed
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;

    // Add user message
    const newMessage: Message = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // API call to N8N wrapper
      const response = await api.sendChatMessage(text);
      
      const botResponse: Message = {
        id: Date.now() + 1,
        text: response.text,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting to the server. Please try again later or call us directly.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

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
        <div className="bg-white w-[350px] md:w-[400px] h-[500px] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center border-2 border-slate-700">
                  <Bot size={24} />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-slate-900 rounded-full animate-pulse"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm">Buzzitech AI Agent</h3>
                <p className="text-xs text-slate-300">Online | Powered by N8N</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow bg-slate-50 p-4 overflow-y-auto space-y-4">
             {messages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                   msg.sender === 'user' 
                     ? 'bg-primary-600 text-white rounded-br-none' 
                     : 'bg-white text-slate-800 border border-gray-100 rounded-bl-none'
                 }`}>
                   <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                   <span className={`text-[10px] mt-1 block text-right opacity-70`}>
                     {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                 </div>
               </div>
             ))}
             
             {isTyping && (
               <div className="flex justify-start">
                 <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-1">
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                 </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (Only show if messages length is low to prompt user) */}
          {messages.length < 4 && (
             <div className="bg-slate-50 px-4 pb-2 flex gap-2 overflow-x-auto">
                <button onClick={() => handleSendMessage("How much is Starlink?")} className="flex-shrink-0 text-xs bg-white border border-primary-200 text-primary-700 px-3 py-1.5 rounded-full hover:bg-primary-50 transition">
                  💰 Starlink Price
                </button>
                <button onClick={() => handleSendMessage("Call me")} className="flex-shrink-0 text-xs bg-white border border-primary-200 text-primary-700 px-3 py-1.5 rounded-full hover:bg-primary-50 transition">
                  📞 Call Me
                </button>
                <button onClick={() => handleSendMessage("CCTV Camera Prices")} className="flex-shrink-0 text-xs bg-white border border-primary-200 text-primary-700 px-3 py-1.5 rounded-full hover:bg-primary-50 transition">
                  📹 CCTV Cost
                </button>
             </div>
          )}

          {/* Input Area */}
          <div className="bg-white p-3 border-t border-gray-100 flex items-center space-x-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about prices or request a call..." 
              className="flex-grow bg-slate-100 text-slate-900 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400"
            />
            <button 
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              className="bg-primary-600 text-white p-2.5 rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-brand-yellow hover:bg-yellow-500 text-slate-900 ${isVibrating && !isOpen ? 'animate-wiggle' : ''} p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center relative border-2 border-white/20`}
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <div className="relative">
            <MessageSquare size={28} fill="currentColor" className="text-slate-900" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-brand-yellow animate-pulse"></span>
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;