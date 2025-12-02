import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Clock, ChevronDown } from 'lucide-react';
import Button from '../components/Button';
import { SERVICES } from '../constants';
import { api } from '../services/api';
import { AppointmentFormData } from '../types';

const Booking: React.FC = () => {
  const location = useLocation();
  const [formData, setFormData] = useState<AppointmentFormData>({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    serviceType: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const serviceParam = params.get('service');
    if (serviceParam) {
      setFormData(prev => ({ ...prev, serviceType: serviceParam }));
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.bookAppointment(formData);
      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (success) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4 text-center">
        <div className="max-w-xl mx-auto bg-white p-12 rounded-2xl shadow-xl border border-green-100">
           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <Calendar size={40} />
           </div>
           <h2 className="text-3xl font-bold text-slate-900 mb-4">Appointment Confirmed!</h2>
           <p className="text-slate-600 mb-8">
             Thank you {formData.name}. We have received your booking request for <strong>{formData.serviceType}</strong> on <strong>{formData.date}</strong> at <strong>{formData.time}</strong>. We will call you at {formData.phone} to finalize the details.
           </p>
           <Button to="/">Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      <section className="bg-primary-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Book a Consultation</h1>
          <p className="text-primary-200">Schedule a time with our expert engineers.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                     <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none hover:border-primary-400 transition-colors bg-white text-slate-900" placeholder="Your Name" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                     <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none hover:border-primary-400 transition-colors bg-white text-slate-900" placeholder="050..." />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                   <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none hover:border-primary-400 transition-colors bg-white text-slate-900" placeholder="you@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type of Service</label>
                  <div className="relative">
                    <select 
                      name="serviceType" 
                      required 
                      value={formData.serviceType} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 appearance-none hover:border-primary-400 transition-colors cursor-pointer"
                    >
                      <option value="">Select Service...</option>
                      {SERVICES.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                      <option value="Consultation">General Consultation</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date</label>
                    <div className="relative">
                      <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none hover:border-primary-400 transition-colors bg-white text-slate-900" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Time</label>
                    <div className="relative">
                       <input type="time" name="time" required value={formData.time} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none hover:border-primary-400 transition-colors bg-white text-slate-900" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full py-4 text-lg" disabled={loading}>
                    {loading ? 'Booking...' : 'Confirm Appointment'}
                  </Button>
                </div>
             </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Booking;