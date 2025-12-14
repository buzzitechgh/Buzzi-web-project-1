import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, ChevronDown, Ticket, CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import { SERVICES, COMPANY_INFO } from '../constants';
import { api } from '../services/api';
import { ContactFormData } from '../types';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.submitContactForm(formData);
      if (response.success) {
          setSuccess(true);
          if (response.ticketId) setTicketId(response.ticketId);
          setFormData({ name: '', email: '', phone: '', service: '', message: '' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div>
      <section className="bg-slate-900 text-white pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-slate-300">Get in touch with our team for sales or technical support.</p>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Info */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-slate-900">Get In Touch</h2>
              <p className="text-slate-600 text-lg">
                Whether you have a question about our services, need technical support, or want to discuss a new project, our team is ready to help.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 p-3 rounded-lg text-primary-600">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Phone</h3>
                    <p className="text-slate-600">{COMPANY_INFO.phone}</p>
                    <p className="text-slate-500 text-sm">Mon-Sat 8am to 6pm</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 p-3 rounded-lg text-primary-600">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Email</h3>
                    <p className="text-slate-600">{COMPANY_INFO.email}</p>
                    <p className="text-slate-500 text-sm">Online support 24/7</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 p-3 rounded-lg text-primary-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Office Location</h3>
                    <p className="text-slate-600">Accra, Ghana</p>
                  </div>
                </div>
              </div>

              {/* Map Embed (Placeholder) */}
              <div className="w-full h-64 bg-gray-200 rounded-xl overflow-hidden shadow-inner">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d254147.2844577884!2d-0.28581005!3d5.591238499999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9084b2b7a773%3A0xbed14ed8650e2dd3!2sAccra%2C%20Ghana!5e0!3m2!1sen!2sus!4v1714589200000!5m2!1sen!2sus" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h3>
              
              {success ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl text-center">
                  <div className="flex justify-center mb-4"><CheckCircle size={48} className="text-green-600" /></div>
                  <h4 className="text-xl font-bold mb-4">Message Received!</h4>
                  <p className="mb-4">Thank you for contacting Buzzitech. We have received your details.</p>
                  
                  {ticketId && (
                      <div className="bg-white border border-green-300 rounded-lg p-4 mb-4 inline-block">
                          <p className="text-xs uppercase text-slate-500 font-bold mb-1">Support Ticket ID</p>
                          <p className="text-2xl font-mono font-bold text-slate-900 tracking-wider">{ticketId}</p>
                          <p className="text-xs text-slate-400 mt-1">Keep this ID for reference</p>
                      </div>
                  )}

                  <p className="text-sm text-slate-500 mb-6">
                    We usually respond within 2 hours during business hours.
                  </p>
                  <button onClick={() => { setSuccess(false); setTicketId(null); }} className="text-sm font-semibold underline text-primary-600 hover:text-primary-800">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition hover:border-primary-400 bg-white text-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition hover:border-primary-400 bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition hover:border-primary-400 bg-white text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Service Needed / Inquiry Type</label>
                    <div className="relative">
                      <select 
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white text-slate-900 appearance-none hover:border-primary-400 cursor-pointer"
                      >
                        <option value="">Select a Service...</option>
                        <option value="Technical Support">Technical Support (Create Ticket)</option>
                        <option value="Sales Inquiry">Sales Inquiry</option>
                        {SERVICES.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                        <option value="Other">Other / General</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    </div>
                    {formData.service === 'Technical Support' && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <Ticket size={12} /> A Support Ticket ID will be generated for tracking.
                        </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                    <textarea 
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition hover:border-primary-400 bg-white text-slate-900"
                    ></textarea>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending...' : <><span className="mr-2">Send Message</span> <Send size={18} /></>}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;