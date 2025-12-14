import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, AlertCircle, Phone, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import Button from '../components/Button';
import { COMPANY_INFO } from '../constants';

const OrderTracking: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState('');
  const [heroImage, setHeroImage] = useState("https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80");

  useEffect(() => {
    // Load dynamic image from settings if available
    api.getSiteImages().then(images => {
        if (images && images.tracking_hero) {
            setHeroImage(images.tracking_hero);
        }
    });
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const result = await api.trackOrder(orderId.trim());
      setOrderData(result);
    } catch (err) {
      setError("Order not found. Please check your ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { status: 'Pending', label: 'Order Placed', icon: Clock, description: 'We have received your order.' },
    { status: 'Processing', label: 'Processing', icon: Package, description: 'Your items are being packed.' },
    { status: 'Out for Delivery', label: 'Out for Delivery', icon: Truck, description: 'Our driver is on the way.' },
    { status: 'Completed', label: 'Delivered', icon: CheckCircle, description: 'Package delivered successfully.' }
  ];

  const getCurrentStepIndex = (status: string) => {
    if (status === 'Cancelled') return -1;
    const index = steps.findIndex(s => s.status === status);
    // Fallback if status doesn't match exactly (e.g. 'Confirmed')
    return index === -1 ? 0 : index;
  };

  const currentStepIndex = orderData ? getCurrentStepIndex(orderData.status) : 0;

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Hero Section with Delivery Branding */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
           {/* High-quality Delivery Van/Person Image */}
           <img 
             src={heroImage}
             alt="Buzzitech Delivery Service" 
             className="w-full h-full object-cover opacity-50"
             onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80") {
                    target.src = "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80";
                }
             }}
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10 mt-10">
          <div className="inline-block bg-brand-yellow/90 backdrop-blur-sm text-slate-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-lg">
            Reliable Logistics
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-white tracking-tight">
            Track Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-white">Shipment</span>
          </h1>
          <p className="text-slate-200 text-lg max-w-xl mx-auto font-medium leading-relaxed">
            From our warehouse to your doorstep. Enter your Order ID to see exactly where your package is.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-20 pb-20 relative z-20">
        <div className="max-w-4xl mx-auto">
          
          {/* Tracking Input Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
            <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Enter Order ID (e.g. ORD-1715623)" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-lg text-slate-900 transition-all font-medium"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading} className="py-4 md:px-10 text-lg shadow-lg">
                {loading ? 'Locating...' : 'Track Order'}
              </Button>
            </form>

            {error && (
              <div className="mt-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                <AlertCircle size={20} />
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>

          {/* Result Card */}
          {orderData && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              {/* Header Status */}
              <div className="bg-slate-50 p-6 md:p-8 border-b border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                       <h3 className="text-2xl font-bold text-slate-900">Order #{orderData.orderId}</h3>
                       {orderData.status === 'Out for Delivery' && (
                         <span className="animate-pulse bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                           <span className="w-2 h-2 bg-green-500 rounded-full"></span> Live
                         </span>
                       )}
                    </div>
                    <p className="text-slate-500 text-sm">Placed on {new Date(orderData.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  
                  <div className="text-right">
                     <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${
                        orderData.status === 'Completed' ? 'bg-green-600 text-white' :
                        orderData.status === 'Cancelled' ? 'bg-red-600 text-white' :
                        'bg-primary-600 text-white'
                      }`}>
                        {orderData.status === 'Completed' && <CheckCircle size={16} className="mr-2" />}
                        {orderData.status === 'Out for Delivery' && <Truck size={16} className="mr-2" />}
                        {orderData.status}
                      </span>
                  </div>
                </div>
              </div>

              {/* Status Visualizer */}
              {orderData.status !== 'Cancelled' ? (
                <div className="p-8 md:p-12">
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-0 left-[19px] md:left-[50px] bottom-0 w-1 bg-gray-100 md:hidden"></div> {/* Vertical Mobile Line */}
                    <div className="absolute top-[24px] left-0 right-0 h-1 bg-gray-100 hidden md:block"></div> {/* Horizontal Desktop Line */}
                    
                    {/* Active Line (Desktop) */}
                    <div 
                      className="absolute top-[24px] left-0 h-1 bg-primary-600 hidden md:block transition-all duration-1000 ease-out"
                      style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                    ></div>

                    <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4 relative z-10">
                      {steps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        
                        return (
                          <div key={index} className="flex md:flex-col items-start md:items-center gap-4 md:gap-0 flex-1">
                            {/* Icon Circle */}
                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 flex-shrink-0 transition-all duration-500 ${
                              isCompleted 
                                ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200' 
                                : 'bg-white border-gray-200 text-gray-300'
                            } ${isCurrent ? 'scale-110 ring-4 ring-primary-100' : ''}`}>
                              <step.icon size={isCurrent ? 24 : 20} />
                            </div>
                            
                            {/* Text */}
                            <div className="md:text-center md:mt-4 pt-1 md:pt-0">
                              <h4 className={`font-bold text-sm md:text-base ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                {step.label}
                              </h4>
                              <p className={`text-xs md:text-sm mt-1 max-w-[150px] md:mx-auto ${isCurrent ? 'text-primary-600 font-medium' : 'text-slate-400'}`}>
                                {step.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-red-50">
                   <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                   <h3 className="text-xl font-bold text-red-800">Order Cancelled</h3>
                   <p className="text-red-600 mt-2">Please contact support for more information.</p>
                </div>
              )}

              {/* Order Details Footer */}
              <div className="bg-slate-50 border-t border-gray-100 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Delivery Address */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-sm border border-gray-200 flex-shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-2">Delivery Destination</h4>
                      <p className="text-slate-600 leading-relaxed font-medium">
                        {orderData.customer.name}
                      </p>
                      <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-line">
                        {orderData.customer.address}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">{orderData.customer.region}</p>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-sm border border-gray-200 flex-shrink-0">
                      <Package size={20} />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-2">Items Ordered</h4>
                      <ul className="space-y-2">
                        {orderData.items.map((item: any, idx: number) => (
                          <li key={idx} className="flex justify-between text-sm text-slate-600 border-b border-gray-200 pb-1 last:border-0 last:pb-0">
                            <span><span className="font-bold text-slate-800">{item.quantity}x</span> {item.name}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                         <span className="text-xs font-bold text-slate-500 uppercase">Total Amount</span>
                         <span className="font-bold text-slate-900 text-lg">GHS {orderData.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support Contact */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                   <p className="text-sm text-slate-500">Need help with this order? Our support team is available 24/7.</p>
                   <a href={`tel:${COMPANY_INFO.phone}`} className="inline-flex items-center text-sm font-bold text-primary-600 hover:text-primary-800 transition-colors">
                      <Phone size={16} className="mr-2" /> Contact Support <ArrowRight size={16} className="ml-1" />
                   </a>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;