import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Bot, Loader2, ChevronDown, Mic, MicOff } from 'lucide-react';
import { api } from '../services/api';
import { SERVICES } from '../constants';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Interface for Web Speech API support
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

// Sound Utility using Web Audio API to avoid external asset dependencies
const playSound = (type: 'popup' | 'message' | 'sent' | 'close') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'popup') {
      // Pop Sound (Open): Quick upward frequency sweep
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, now);
      oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      
      oscillator.start(now);
      oscillator.stop(now + 0.1);

    } else if (type === 'close') {
      // Close Sound: Quick downward frequency sweep
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, now);
      oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.15);
      
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
      
      oscillator.start(now);
      oscillator.stop(now + 0.15);

    } else if (type === 'message') {
      // Dropdown/Incoming Message Sound: Soft "bubble" or "blip"
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, now);
      oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.15);
      
      gainNode.gain.setValueAtTime(0.03, now); // Lower volume for messages
      gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
      
      oscillator.start(now);
      oscillator.stop(now + 0.15);

    } else if (type === 'sent') {
      // Sent Message Sound: Crisp high-pitch "tick"
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(1200, now);
      oscillator.frequency.exponentialRampToValueAtTime(1800, now + 0.05);
      
      gainNode.gain.setValueAtTime(0.02, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      oscillator.start(now);
      oscillator.stop(now + 0.05);
    }
  } catch (error) {
    console.error("Audio play failed", error);
  }
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! 👋 Welcome to Buzzitech.\n\nI can help you with:\n• Starlink & CCTV Prices 💰\n• Business Automation 🛍️\n• Booking an Installation 📅\n• Getting an Instant Quote 📝\n\nHow can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedService, setSelectedService] = useState(""); // Controlled state for select
  
  // Interactive Quote Flow State
  const [quoteFlow, setQuoteFlow] = useState<{
    active: boolean;
    step: 'NAME' | 'EMAIL' | 'PHONE' | 'SERVICE' | 'DETAILS';
    data: {
      name: string;
      email: string;
      phone: string;
      service: string;
      details: string;
    }
  }>({
    active: false,
    step: 'NAME',
    data: { name: '', email: '', phone: '', service: '', details: '' }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Common Services List for Quick Actions
  const QUICK_TOPICS = [
    "Get Quote",
    "CCTV Security",
    "Starlink Internet",
    "Networking",
    "Web Design",
    "Call Me"
  ];

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Sound Effects for Opening
  useEffect(() => {
    if (isOpen) {
      playSound('popup');
    }
  }, [isOpen]);

  // Sound Effects for Incoming Messages
  useEffect(() => {
    // Only play sound for new messages (skip initial load)
    if (messages.length > 1) {
      const lastMessage = messages[messages.length - 1];
      // Only play if it's the bot sending (user sent sound is handled in handleSendMessage)
      if (lastMessage.sender === 'bot') {
        playSound('message');
      }
    }
  }, [messages]);

  // Initial Auto-Open, Welcome Sequence & Auto-Close
  useEffect(() => {
    let openTimeout: ReturnType<typeof setTimeout>;
    let closeTimeout: ReturnType<typeof setTimeout>;

    // 1. Wait 1 second after page load (let user see the hero section first)
    const startSequenceTimer = setTimeout(() => {
      // 2. Start Vibrate to grab attention
      setIsVibrating(true);
      
      // 3. Open the chat window after vibrating for 1 second
      openTimeout = setTimeout(() => {
        setIsVibrating(false);
        setIsOpen(true); // Triggers 'popup' sound via useEffect

        // 4. Auto-minimize after 30 seconds
        closeTimeout = setTimeout(() => {
          setIsOpen((prev) => {
            if(prev) playSound('close');
            return false;
          });
        }, 30000);

      }, 1000);
    }, 1000);

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

  // Process Interactive Quote Steps
  const processQuoteStep = async (inputText: string) => {
    // 1. Update Data based on current step
    let newData = { ...quoteFlow.data };
    let nextStep = quoteFlow.step;
    let botResponseText = "";

    switch (quoteFlow.step) {
        case 'NAME':
            newData.name = inputText;
            nextStep = 'EMAIL';
            botResponseText = `Thanks ${inputText}! What is your **Email Address** so we can send the estimate?`;
            break;
        case 'EMAIL':
            if (!inputText.includes('@') || !inputText.includes('.')) {
                 setMessages(prev => [...prev, { id: Date.now(), text: "That doesn't look like a valid email. Please try again.", sender: 'bot', timestamp: new Date() }]);
                 return;
            }
            newData.email = inputText;
            nextStep = 'PHONE';
            botResponseText = "Got it. What is your **Phone Number**?";
            break;
        case 'PHONE':
            newData.phone = inputText;
            nextStep = 'SERVICE';
            botResponseText = "Which **Service** are you interested in? (e.g., CCTV, Starlink, Networking, POS)";
            break;
        case 'SERVICE':
            newData.service = inputText;
            nextStep = 'DETAILS';
            botResponseText = "Please provide specific **details or requirements** (e.g., number of cameras, location, specific hardware).";
            break;
        case 'DETAILS':
            newData.details = inputText;
            // No next step, we submit
            botResponseText = "Perfect! Generating your estimate now...";
            break;
    }

    setQuoteFlow({ active: true, step: nextStep as any, data: newData });

    // Add Bot Response
    setMessages(prev => [...prev, {
        id: Date.now(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
    }]);

    // If we just finished DETAILS, submit immediately
    if (quoteFlow.step === 'DETAILS') {
        const payload: any = {
             name: newData.name,
             email: newData.email,
             phone: newData.phone,
             serviceType: newData.service,
             items: [{
                 id: 'chat-gen-' + Date.now(),
                 category: 'Chat Request',
                 name: newData.service,
                 description: newData.details,
                 price: 0, // Indicative
                 quantity: 1
             }],
             grandTotal: 0,
             description: `[Generated via Chatbot]\nUser Requirements: ${newData.details}`,
             timeline: 'Flexible'
        };

        try {
            await api.requestQuotation(payload);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "✅ **Quote Request Sent!**\n\nI've forwarded your details to our team and emailed a confirmation to " + newData.email + ". We will review your requirements and send a formal estimate shortly.",
                sender: 'bot',
                timestamp: new Date()
            }]);
        } catch (e) {
             setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "⚠️ Something went wrong connecting to the server. Please try the Quote page from the menu instead.",
                sender: 'bot',
                timestamp: new Date()
            }]);
        }
        
        // Reset Flow
        setQuoteFlow({ active: false, step: 'NAME', data: { name: '', email: '', phone: '', service: '', details: '' } });
    }
  };

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
    playSound('sent'); // Play sent sound
    
    setInputValue("");
    setIsTyping(true);

    // INTERCEPT IF QUOTE FLOW IS ACTIVE
    if (quoteFlow.active) {
        setTimeout(() => {
             processQuoteStep(text);
             setIsTyping(false);
        }, 800);
        return;
    }

    try {
      // API call to N8N wrapper
      const response = await api.sendChatMessage(text);
      
      // CHECK FOR ACTION TRIGGERS
      if (response.action === 'start_quote_flow') {
           setQuoteFlow({ ...quoteFlow, active: true, step: 'NAME' });
           // The text from response will trigger the start of the flow visually
      }

      const botResponse: Message = {
        id: Date.now() + 1,
        text: response.text,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]); // Triggers 'message' sound via useEffect
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

  const handleServiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const service = e.target.value;
    if (service) {
      // Reset logic: Update state first, then send message
      setSelectedService(""); // Reset to default immediately
      handleSendMessage(`Tell me more about ${service}`);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Error stopping recognition", e);
        }
      }
      setIsListening(false);
      return;
    }

    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionConstructor = SpeechRecognition || webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.",
        sender: 'bot',
        timestamp: new Date()
      }]);
      return;
    }

    try {
      const recognition = new SpeechRecognitionConstructor();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false; // Stop after one sentence

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          // Instead of alert, show a helpful message in chat
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: "🎤 Permission Denied.\nTo use voice chat, please allow microphone access in your browser settings (click the lock icon in the URL bar).",
            sender: 'bot',
            timestamp: new Date()
          }]);
        } else if (event.error === 'no-speech') {
            // Ignore no-speech errors, just reset state
            return;
        }
      };

      recognition.start();
    } catch (e) {
      console.error("Failed to initialize speech recognition", e);
      setIsListening(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Unable to start voice input. Please ensure your microphone is connected.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
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
        /* Hide scrollbar for cleaner look */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
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
            <button 
              onClick={() => {
                playSound('close');
                setIsOpen(false);
              }} 
              className="text-slate-400 hover:text-white transition-colors"
            >
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

          {/* Quick Actions (Expanded List) */}
          {!quoteFlow.active && messages.length < 5 && (
             <div className="bg-slate-50 px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                {QUICK_TOPICS.map((topic) => (
                   <button 
                     key={topic}
                     onClick={() => handleSendMessage(topic === "Call Me" ? "Call Me" : (topic === "Get Quote" ? "Generate Quote" : `Tell me about ${topic}`))} 
                     className="flex-shrink-0 text-xs bg-white border border-primary-200 text-primary-700 px-3 py-1.5 rounded-full hover:bg-primary-50 transition shadow-sm whitespace-nowrap"
                   >
                     {topic === "Call Me" ? "📞 Call Me" : (topic === "Get Quote" ? "📝 Get Quote" : topic)}
                   </button>
                ))}
             </div>
          )}

          {/* Input Area */}
          <div className="bg-white p-3 border-t border-gray-100 flex flex-col gap-2">
            
            {/* Service Selection Dropdown */}
            {!quoteFlow.active && (
              <div className="relative">
                <select 
                  className="w-full text-xs bg-slate-50 border border-gray-200 text-slate-600 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors cursor-pointer appearance-none"
                  onChange={handleServiceSelect}
                  value={selectedService} // Controlled value
                >
                  <option value="" disabled>Select a topic to inquire...</option>
                  {SERVICES.map((service) => (
                    <option key={service.id} value={service.title}>
                      {service.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={quoteFlow.active ? "Type your answer..." : "Ask a question..."} 
                className="flex-grow bg-slate-100 text-slate-900 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400"
              />
              
              {/* Voice Input Button */}
              <button
                onClick={handleVoiceInput}
                className={`p-2.5 rounded-full transition-colors shadow-md flex-shrink-0 ${
                  isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse border border-red-200' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                title={isListening ? "Listening..." : "Voice Input"}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button 
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="bg-primary-600 text-white p-2.5 rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex-shrink-0"
              >
                {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => {
          if (isOpen) playSound('close');
          setIsOpen(!isOpen);
        }}
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