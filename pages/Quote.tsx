import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, ChevronDown, ChevronUp, Plus, Trash2, ShoppingCart, Info, MessageSquare, Send } from 'lucide-react';
import Button from '../components/Button';
import { api } from '../services/api';
import { QuoteFormData, QuoteItem } from '../types';
import { generateInvoice } from '../services/invoiceGenerator';
import { SERVICES } from '../constants';

// --- PRODUCT CATALOG (Updated to specific requirements) ---
const PRODUCT_CATALOG = [
  {
    category: "CCTV Devices",
    items: [
      { id: 'cctv-ip-out', name: 'IP Camera Outdoor – Hikvision', price: 650 },
      { id: 'cctv-ip-in', name: 'IP Camera Indoor – Hikvision', price: 550 },
      { id: 'cctv-nvr', name: 'NVR 8-Channel POE', price: 1450 },
      { id: 'cctv-cat6-out', name: 'Cat6 Cable Outdoor (per meter)', price: 12 },
      { id: 'cctv-cat6-in', name: 'Cat6 Cable Indoor (per meter)', price: 8 },
    ]
  },
  {
    category: "Starlink Options",
    items: [
      { id: 'sl-std', name: 'Starlink Standard Kit', price: 7000 },
      { id: 'sl-mini', name: 'Starlink Mini Kit', price: 5000 },
      { id: 'sl-install', name: 'Starlink Installation', price: 800 },
    ]
  },
  {
    category: "Labour Cost",
    items: [
      { id: 'lab-basic', name: 'Basic Labour', price: 300 },
      { id: 'lab-adv', name: 'Advanced Labour', price: 600 },
      { id: 'lab-full', name: 'Full Project Labour', price: 1200 },
    ]
  }
];

const Quote: React.FC = () => {
  const inputClass = "w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition placeholder-gray-400";
  const contactInputClass = "w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-slate-900 outline-none transition placeholder-gray-400"; // No focus highlight
  const selectClass = "w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer";

  // State for Form
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '', 
    timeline: '',
    description: ''
  });

  const [serviceDetails, setServiceDetails] = useState('');

  // State for Quote Builder
  const [selectedCategory, setSelectedCategory] = useState(PRODUCT_CATALOG[0].category);
  const [selectedItemId, setSelectedItemId] = useState(PRODUCT_CATALOG[0].items[0].id);
  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<QuoteItem[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);

  // Submission States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverMessage, setServerMessage] = useState<string>('');
  
  // Feedback State
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Recalculate total whenever cart changes
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setGrandTotal(total);
  }, [cart]);

  // Handle Adding Items
  const handleAddItem = () => {
    const categoryGroup = PRODUCT_CATALOG.find(c => c.category === selectedCategory);
    const product = categoryGroup?.items.find(i => i.id === selectedItemId);

    if (!product) return;

    const newItem: QuoteItem = {
      id: `${product.id}-${Date.now()}`,
      category: selectedCategory,
      name: product.name,
      description: itemDescription,
      price: product.price,
      quantity: quantity
    };

    setCart([...cart, newItem]);
    setQuantity(1); 
    setItemDescription('');
  };

  const handleRemoveItem = (cartId: string) => {
    setCart(cart.filter(item => item.id !== cartId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Please add at least one item to the quote.");
      return;
    }

    setLoading(true);
    
    const mergedDescription = serviceDetails 
      ? `[Service Specifics: ${serviceDetails}]\n\n${contactInfo.description}`
      : contactInfo.description;

    const fullQuoteData: QuoteFormData = {
      ...contactInfo,
      serviceType: contactInfo.serviceType || "General Quote",
      items: cart,
      grandTotal: grandTotal,
      description: mergedDescription || "Generated via Online Quote Builder"
    };

    try {
      // 1. Send Data to N8N Webhook FIRST
      const response = await api.requestQuotation(fullQuoteData);
      
      // 2. Generate PDF only if API didn't hard fail
      generateInvoice(fullQuoteData);
      
      setServerMessage(JSON.stringify(response.data) || response.message);
      setSuccess(true);
    } catch (error) {
      console.error("Submission failed:", error);
      alert("There was an error connecting to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) return;
    await api.submitFeedback({
      name: contactInfo.name,
      email: contactInfo.email,
      message: feedback
    });
    setFeedbackSent(true);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setContactInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const currentItems = PRODUCT_CATALOG.find(c => c.category === selectedCategory)?.items || [];
  const selectedServiceObj = SERVICES.find(s => s.title === contactInfo.serviceType);

  if (success) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-primary-100">
           
           {/* Success Header */}
           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle size={40} />
           </div>
           <h2 className="text-3xl font-bold text-slate-900 mb-4">Quote Sent Successfully!</h2>
           <p className="text-slate-600 mb-6">
             Your PDF invoice has been downloaded. Our team is reviewing your request.
           </p>

           {/* Admin/Server Summary */}
           <div className="bg-slate-50 p-6 rounded-lg mb-8 text-left border border-slate-200">
             <h4 className="font-bold text-slate-800 mb-4 border-b pb-2">Internal Admin Summary</h4>
             <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
                <div><strong>Client:</strong> {contactInfo.name}</div>
                <div><strong>Total:</strong> GHS {grandTotal.toLocaleString()}</div>
                <div><strong>Email:</strong> {contactInfo.email}</div>
                <div><strong>Items:</strong> {cart.length}</div>
                <div><strong>Status:</strong> <span className="text-green-600 font-semibold">Quote Generated & Invoice Requested</span></div>
             </div>
             {/* Optional: Show raw server response if useful, or keep it clean */}
             {/* <div className="text-xs text-slate-400 font-mono mt-2 p-2 bg-slate-100 rounded overflow-x-auto">
                Server Response: {serverMessage}
             </div> */}
           </div>

           {/* Feedback Section */}
           {!feedbackSent ? (
             <div className="mb-8 animate-in fade-in slide-in-from-bottom-4">
               <h4 className="text-lg font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
                 <MessageSquare size={18} className="text-primary-600" /> 
                 How was your experience?
               </h4>
               <p className="text-sm text-slate-500 mb-4">Leave a quick note for our team.</p>
               <div className="flex flex-col gap-3">
                 <textarea 
                   className={inputClass} 
                   rows={2} 
                   placeholder="Type your feedback here..."
                   value={feedback}
                   onChange={(e) => setFeedback(e.target.value)}
                 ></textarea>
                 <Button onClick={handleFeedbackSubmit} disabled={!feedback.trim()}>
                   Send Feedback
                 </Button>
               </div>
             </div>
           ) : (
             <div className="mb-8 bg-blue-50 text-blue-800 p-4 rounded-lg">
               <p className="font-semibold">Thank you for your feedback!</p>
             </div>
           )}

           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button onClick={() => {
                const fullQuoteData: QuoteFormData = {
                  ...contactInfo,
                  serviceType: contactInfo.serviceType || "General Quote",
                  items: cart,
                  grandTotal: grandTotal,
                  description: contactInfo.description || ""
                };
                generateInvoice(fullQuoteData);
             }} variant="outline">
               <Download size={18} className="mr-2" /> Download PDF Again
             </Button>
             <Button to="/">Return Home</Button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      <section className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Create Your Quote</h1>
          <p className="text-slate-300">Select devices and services to generate an instant estimate.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Inputs */}
            <div className="lg:col-span-2 space-y-8">
               
               {/* 1. Contact Details */}
               <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                 <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                   <span className="bg-primary-100 text-primary-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                   Your Details & Service Type
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Full Name</label>
                        <input type="text" name="name" required placeholder="John Doe" value={contactInfo.name} onChange={handleContactChange} className={contactInputClass} />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Address</label>
                        <input type="email" name="email" required placeholder="john@example.com" value={contactInfo.email} onChange={handleContactChange} className={contactInputClass} />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Phone Number</label>
                        <input type="tel" name="phone" required placeholder="xxxxxxxxxx" value={contactInfo.phone} onChange={handleContactChange} className={contactInputClass} />
                    </div>
                    <div className="relative col-span-1">
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Project Timeline</label>
                      <select name="timeline" value={contactInfo.timeline} onChange={handleContactChange} className={selectClass}>
                         <option value="">Select Timeline...</option>
                         <option value="Urgent (ASAP)">Urgent (ASAP)</option>
                         <option value="Within 1 week">Within 1 week</option>
                         <option value="Flexible">Flexible</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-[2.2rem] text-gray-500 pointer-events-none" size={18} />
                    </div>
                    
                    {/* Service Type Dropdown & Description */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                      <div className="relative">
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Service Needed</label>
                        <select name="serviceType" value={contactInfo.serviceType} onChange={handleContactChange} className={selectClass}>
                           <option value="">Select Service Category...</option>
                           {SERVICES.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                           <option value="General IT Support">General IT Support</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-[2.2rem] text-gray-500 pointer-events-none" size={18} />
                      </div>

                      {selectedServiceObj && (
                        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg animate-in fade-in slide-in-from-top-1">
                           <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
                           <div>
                             <p className="text-sm font-semibold text-blue-900">{selectedServiceObj.title}</p>
                             <p className="text-xs text-blue-700 mt-1">{selectedServiceObj.description}</p>
                           </div>
                        </div>
                      )}

                      {contactInfo.serviceType && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                             Specific Requirements for {contactInfo.serviceType}
                           </label>
                           <input 
                              type="text" 
                              value={serviceDetails}
                              onChange={(e) => setServiceDetails(e.target.value)}
                              placeholder={`E.g., Number of points, building type, special conditions...`}
                              className={inputClass}
                           />
                        </div>
                      )}
                    </div>
                 </div>
               </div>

               {/* 2. Item Selection */}
               <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                 <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                   <span className="bg-primary-100 text-primary-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                   Select Products & Services
                 </h3>
                 
                 <div className="bg-slate-50 p-6 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        
                        {/* Category Select */}
                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Category</label>
                          <div className="relative">
                            <select 
                              value={selectedCategory}
                              onChange={(e) => {
                                const newCat = e.target.value;
                                setSelectedCategory(newCat);
                                const firstItem = PRODUCT_CATALOG.find(c => c.category === newCat)?.items[0];
                                if (firstItem) setSelectedItemId(firstItem.id);
                              }}
                              className={selectClass}
                            >
                              {PRODUCT_CATALOG.map(cat => (
                                <option key={cat.category} value={cat.category}>{cat.category}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                          </div>
                        </div>

                        {/* Item Select */}
                        <div className="md:col-span-5">
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Item</label>
                          <div className="relative">
                            <select 
                              value={selectedItemId}
                              onChange={(e) => setSelectedItemId(e.target.value)}
                              className={selectClass}
                            >
                              {currentItems.map(item => (
                                <option key={item.id} value={item.id}>
                                  {item.name} — GHS {item.price.toLocaleString()}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-2">
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Qty</label>
                           <div className="relative">
                             <input 
                               type="number" 
                               min="1" 
                               value={quantity} 
                               onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                               className={`${inputClass} pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                             />
                             <div className="absolute inset-y-0 right-0 flex flex-col border-l border-gray-300 w-8">
                                <button 
                                  type="button"
                                  onClick={() => setQuantity(q => q + 1)}
                                  className="flex-1 hover:bg-gray-50 text-slate-600 flex items-center justify-center rounded-tr-lg border-b border-gray-300 focus:outline-none"
                                >
                                  <ChevronUp size={12} />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                  className="flex-1 hover:bg-gray-50 text-slate-600 flex items-center justify-center rounded-br-lg focus:outline-none"
                                >
                                  <ChevronDown size={12} />
                                </button>
                             </div>
                           </div>
                        </div>

                        {/* Add Button */}
                        <div className="md:col-span-2">
                            <button 
                              type="button"
                              onClick={handleAddItem}
                              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center shadow-sm"
                            >
                              <Plus size={20} /> <span className="ml-2 font-medium">Add</span>
                            </button>
                        </div>

                        {/* Description Input */}
                        <div className="md:col-span-12">
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Item Description / Details (Optional)</label>
                            <input 
                              type="text"
                              value={itemDescription}
                              onChange={(e) => setItemDescription(e.target.value)}
                              placeholder="e.g., Mounting location, specific color, or cable length..."
                              className={inputClass}
                            />
                        </div>
                    </div>
                 </div>
               </div>

               {/* 3. Additional Notes */}
               <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                 <h3 className="text-lg font-bold text-slate-900 mb-4">General Notes / Instructions</h3>
                 <textarea 
                   name="description" 
                   rows={3} 
                   value={contactInfo.description} 
                   onChange={handleContactChange} 
                   placeholder="Any specific overall instructions?" 
                   className={inputClass}
                 ></textarea>
               </div>
            </div>

            {/* RIGHT COLUMN: Summary / Cart */}
            <div className="lg:col-span-1">
               <div className="bg-white rounded-2xl shadow-xl border border-primary-100 overflow-hidden sticky top-24">
                  <div className="bg-primary-900 p-6 text-white flex items-center justify-between">
                     <h3 className="font-bold text-lg flex items-center gap-2">
                       <ShoppingCart size={20} className="text-brand-yellow" /> Quote Summary
                     </h3>
                     <span className="bg-primary-800 px-3 py-1 rounded-full text-xs">{cart.length} Items</span>
                  </div>

                  <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {cart.length === 0 ? (
                      <div className="text-center py-10 text-slate-400">
                        <p>No items added yet.</p>
                        <p className="text-xs mt-2">Use the selection tool to build your estimate.</p>
                      </div>
                    ) : (
                      <ul className="space-y-4">
                        {cart.map((item) => (
                          <li key={item.id} className="flex justify-between items-start group border-b border-gray-50 pb-4 last:border-0">
                             <div className="flex-1 pr-2">
                               <p className="text-sm font-semibold text-slate-800 leading-tight">{item.name}</p>
                               {item.description && (
                                   <p className="text-xs text-slate-400 italic mt-0.5">Note: {item.description}</p>
                               )}
                               <p className="text-xs text-slate-500 mt-1">
                                 {item.quantity} x GHS {item.price.toLocaleString()}
                               </p>
                             </div>
                             <div className="flex flex-col items-end gap-2">
                               <span className="text-sm font-bold text-primary-600">
                                 {(item.price * item.quantity).toLocaleString()}
                               </span>
                               <button 
                                 type="button" 
                                 onClick={() => handleRemoveItem(item.id)}
                                 className="text-red-400 hover:text-red-600 p-1"
                               >
                                 <Trash2 size={14} />
                               </button>
                             </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="bg-gray-50 p-6 border-t border-gray-100">
                     <div className="flex justify-between items-center mb-6">
                       <span className="text-slate-600 font-medium">Grand Total (GHS)</span>
                       <span className="text-2xl font-bold text-slate-900">{grandTotal.toLocaleString()}</span>
                     </div>
                     
                     <Button type="submit" className="w-full py-3" disabled={loading || cart.length === 0}>
                       {loading ? 'Submitting...' : 'Submit & Download Quote'}
                     </Button>
                     <p className="text-xs text-center text-slate-400 mt-4">
                       Prices are subject to final site survey.
                     </p>
                  </div>
               </div>
            </div>

          </form>
        </div>
      </section>
    </div>
  );
};

export default Quote;