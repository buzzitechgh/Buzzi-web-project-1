import React, { useState } from 'react';
import { FileText, Download, CheckCircle, ChevronDown, DollarSign } from 'lucide-react';
import Button from '../components/Button';
import { SERVICES } from '../constants';
import { api } from '../services/api';
import { QuoteFormData } from '../types';
import { generateInvoice } from '../services/invoiceGenerator';

const Quote: React.FC = () => {
  const [formData, setFormData] = useState<QuoteFormData>({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    description: '',
    budget: '',
    timeline: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.requestQuotation(formData);
      // Generate PDF Invoice client-side
      generateInvoice(formData);
      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (success) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4 text-center">
        <div className="max-w-xl mx-auto bg-white p-12 rounded-2xl shadow-xl border border-primary-100">
           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle size={40} />
           </div>
           <h2 className="text-3xl font-bold text-slate-900 mb-4">Request Received!</h2>
           <p className="text-slate-600 mb-6">
             Thank you, <strong>{formData.name}</strong>. We have received your request for <strong>{formData.serviceType}</strong>. 
           </p>
           
           <div className="bg-blue-50 p-4 rounded-lg mb-8 text-left border border-blue-100">
             <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
               <FileText size={18} /> Next Steps:
             </h4>
             <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
               <li>A confirmation email has been sent to <strong>{formData.email}</strong>.</li>
               <li>Our team has been notified at <strong>buzzitechgh@gmail.com</strong>.</li>
               <li>Your preliminary <strong>Estimate Invoice</strong> has been downloaded automatically.</li>
             </ul>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button onClick={() => generateInvoice(formData)} variant="outline">
               <Download size={18} className="mr-2" /> Download Invoice Again
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Get a Service Quotation</h1>
          <p className="text-slate-300">Tell us about your project needs.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-xl">
             <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Contact Details */}
                <div>
                   <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">1. Your Details</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input type="text" name="name" required placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none hover:border-primary-400 transition-colors" />
                      <input type="email" name="email" required placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none hover:border-primary-400 transition-colors" />
                      <input type="tel" name="phone" required placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none hover:border-primary-400 transition-colors" />
                   </div>
                </div>

                {/* Project Details */}
                <div>
                   <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">2. Project Requirements</h3>
                   <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
                        <div className="relative">
                          <select 
                            name="serviceType" 
                            required 
                            value={formData.serviceType} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-700 appearance-none hover:border-primary-400 transition-colors cursor-pointer"
                          >
                            <option value="">Select Service...</option>
                            {SERVICES.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                            <option value="Custom Project">Custom Project</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Project Description</label>
                        <textarea name="description" required rows={5} value={formData.description} onChange={handleChange} placeholder="Describe your requirements in detail..." className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none hover:border-primary-400 transition-colors"></textarea>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Budget</label>
                            <div className="relative">
                               <span className="absolute left-3 top-3.5 text-gray-500 text-sm font-bold">GHS</span>
                               <input type="text" name="budget" value={formData.budget} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none hover:border-primary-400 transition-colors" placeholder="e.g. 5000" />
                            </div>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Timeline</label>
                            <div className="relative">
                              <select 
                                name="timeline" 
                                value={formData.timeline} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-700 appearance-none hover:border-primary-400 transition-colors cursor-pointer"
                              >
                                 <option value="">Select Timeline...</option>
                                 <option value="Urgent (ASAP)">Urgent (ASAP)</option>
                                 <option value="Within 1 week">Within 1 week</option>
                                 <option value="Within 1 month">Within 1 month</option>
                                 <option value="Flexible">Flexible</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full py-4 text-lg" disabled={loading}>
                    {loading ? 'Submitting Request...' : 'Submit Quote Request'}
                  </Button>
                  <p className="text-center text-xs text-gray-500 mt-3">
                    By submitting, an invoice estimate will be automatically generated and a copy sent to your email.
                  </p>
                </div>
             </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Quote;