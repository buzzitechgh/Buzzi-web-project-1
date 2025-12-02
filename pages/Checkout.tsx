import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, CreditCard, Smartphone, CheckCircle, ShieldCheck, ArrowLeft, Lock, Truck, MapPin, Banknote, Map, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { api } from '../services/api';
import { Order } from '../types';

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Eastern",
  "Central",
  "Western",
  "Western North",
  "Volta",
  "Oti",
  "Northern",
  "Savannah",
  "North East",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo"
];

const Checkout: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    region: 'Greater Accra',
    gpsCoordinates: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'momo' | 'cod'>('paystack');
  const [transactionId, setTransactionId] = useState('');

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setCustomer(prev => ({
          ...prev,
          gpsCoordinates: coords,
          address: prev.address ? `${prev.address} \n(GPS: ${coords})` : `GPS: ${coords}`
        }));
        setGeoLoading(false);
      },
      (error) => {
        console.error("Geolocation Error Code:", error.code, "Message:", error.message);
        
        let errorMessage = "Unable to retrieve your location.";
        switch(error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = "Location permission denied. Please enable location access in your browser settings.";
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = "Location information is unavailable. Please check your GPS settings.";
            break;
          case 3: // TIMEOUT
            errorMessage = "The request to get your location timed out.";
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
        }
        
        alert(errorMessage);
        setGeoLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 0 
      }
    );
  };

  const handleProcessPayment = async () => {
    setLoading(true);
    const order: Order = {
      id: `ORD-${Date.now()}`,
      items: cart,
      total: cartTotal,
      customer,
      deliveryMode,
      paymentMethod,
      status: 'pending',
      date: new Date()
    };

    try {
      const result = await api.processPayment(order);
      if (result.success) {
        setTransactionId(result.transactionId);
        setStep('success');
        clearCart();
      }
    } catch (error) {
      console.error(error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-slate-500 mb-8">Looks like you haven't added any gear yet.</p>
          <Button to="/store">Browse Store</Button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4 text-center">
        <div className="max-w-lg mx-auto bg-white p-12 rounded-2xl shadow-xl border border-green-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Order Confirmed!</h2>
          <p className="text-slate-600 mb-6">
            Thank you {customer.name}. Your order has been placed successfully.
          </p>
          <div className="bg-slate-50 p-4 rounded-lg text-left mb-8 text-sm text-slate-600">
             <p><strong>Order ID:</strong> {transactionId}</p>
             <p><strong>Amount:</strong> GHS {cartTotal.toLocaleString()}</p>
             <p><strong>Payment:</strong> {paymentMethod === 'cod' ? 'Pay on Delivery' : paymentMethod === 'paystack' ? 'Paystack (Card)' : 'Mobile Money'}</p>
             <p><strong>Delivery:</strong> {deliveryMode === 'pickup' ? 'Store Pickup' : 'Door Delivery'}</p>
          </div>
          <p className="text-sm text-slate-400 mb-8">A confirmation email has been sent to {customer.email}.</p>
          <Button to="/store">Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          
          {/* LEFT COLUMN: Steps */}
          <div className="lg:w-2/3 space-y-6">
            
            {/* Step 1: Cart Review */}
            <div className={`bg-white p-6 rounded-xl shadow-sm border ${step === 'cart' ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">1. Review Cart</h2>
                {step !== 'cart' && <button onClick={() => setStep('cart')} className="text-primary-600 text-sm font-semibold underline">Edit</button>}
              </div>
              
              {(step === 'cart' || step === 'shipping' || step === 'payment') && (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md bg-gray-100" />
                      <div className="flex-grow">
                        <h4 className="font-semibold text-slate-900">{item.name}</h4>
                        <p className="text-sm text-slate-500">{item.category}</p>
                        <div className="flex items-center gap-2 mt-2 md:hidden">
                           <span className="font-bold text-slate-900">GHS {item.price.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {step === 'cart' ? (
                        <div className="flex items-center gap-3">
                          <input 
                            type="number" 
                            min="1" 
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                            className="w-16 px-2 py-1 border rounded text-center text-sm"
                          />
                          <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                          <p className="font-bold text-slate-900">GHS {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {step === 'cart' && (
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => setStep('shipping')}>Proceed to Delivery</Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Shipping & Delivery */}
            <div className={`bg-white p-6 rounded-xl shadow-sm border ${step === 'shipping' ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">2. Delivery & Contact</h2>
                {step === 'payment' && <button onClick={() => setStep('shipping')} className="text-primary-600 text-sm font-semibold underline">Edit</button>}
              </div>

              {step === 'shipping' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  
                  {/* Delivery Mode Toggle */}
                  <div className="flex gap-4">
                     <div 
                       onClick={() => setDeliveryMode('delivery')}
                       className={`flex-1 p-4 border rounded-xl cursor-pointer flex items-center justify-center flex-col gap-2 transition-all ${deliveryMode === 'delivery' ? 'bg-blue-50 border-primary-500 text-primary-700 font-bold' : 'hover:bg-gray-50 border-gray-200'}`}
                     >
                        <Truck size={24} />
                        Door Delivery
                     </div>
                     <div 
                       onClick={() => setDeliveryMode('pickup')}
                       className={`flex-1 p-4 border rounded-xl cursor-pointer flex items-center justify-center flex-col gap-2 transition-all ${deliveryMode === 'pickup' ? 'bg-blue-50 border-primary-500 text-primary-700 font-bold' : 'hover:bg-gray-50 border-gray-200'}`}
                     >
                        <MapPin size={24} />
                        Store Pickup
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                        value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                        value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input type="tel" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                        value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} placeholder="050 000 0000" />
                    </div>

                    {deliveryMode === 'delivery' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
                          <select 
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                            value={customer.region}
                            onChange={(e) => setCustomer({...customer, region: e.target.value})}
                          >
                            {GHANA_REGIONS.map(region => (
                              <option key={region} value={region}>{region}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <div className="flex justify-between items-center mb-1">
                             <label className="block text-sm font-medium text-slate-700">Delivery Address / GPS</label>
                             <button 
                               onClick={handleUseLocation}
                               className="text-xs flex items-center gap-1 text-primary-600 hover:text-primary-800 font-semibold"
                             >
                               {geoLoading ? 'Locating...' : <><Map size={12} /> Use Current Location</>}
                             </button>
                          </div>
                          <div className="relative">
                            <textarea 
                              rows={3} 
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                              value={customer.address} 
                              onChange={e => setCustomer({...customer, address: e.target.value})}
                              placeholder="House Number, Street Name, or Digital Address (GPS)"
                            ></textarea>
                            {customer.gpsCoordinates && (
                               <div className="absolute bottom-2 right-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                                  <CheckCircle size={10} /> GPS Locked
                               </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">We use your GPS to find your exact location for delivery.</p>
                        </div>
                      </>
                    )}

                    {deliveryMode === 'pickup' && (
                       <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <h4 className="font-bold text-slate-800 mb-1">Pickup Location</h4>
                          <p className="text-sm text-slate-600">Buzzitech IT Solutions, Accra Main Office.</p>
                          <p className="text-xs text-slate-500 mt-1">Available Mon-Sat, 8am - 6pm.</p>
                       </div>
                    )}

                    <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                      <button onClick={() => setStep('cart')} className="px-6 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Back</button>
                      <Button onClick={() => {
                          if(customer.name && customer.email && customer.phone && (deliveryMode === 'pickup' || (customer.address && customer.region))) {
                            setStep('payment');
                          } else {
                            alert("Please fill all contact and delivery details");
                          }
                      }}>Proceed to Payment</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Payment */}
            <div className={`bg-white p-6 rounded-xl shadow-sm border ${step === 'payment' ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200'}`}>
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Payment Method</h2>
              
              {step === 'payment' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                   
                   {/* Option 1: Paystack */}
                   <div 
                      onClick={() => setPaymentMethod('paystack')}
                      className={`p-4 border rounded-xl flex items-center gap-4 cursor-pointer transition-colors ${paymentMethod === 'paystack' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'hover:bg-gray-50'}`}
                   >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'paystack' ? 'border-primary-600' : 'border-gray-400'}`}>
                        {paymentMethod === 'paystack' && <div className="w-3 h-3 bg-primary-600 rounded-full"></div>}
                      </div>
                      <div className="bg-blue-100 p-2 rounded text-blue-700">
                         <CreditCard size={24} />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-900">Paystack (Card/MoMo Online)</h4>
                         <p className="text-xs text-slate-500">Secure immediate payment.</p>
                      </div>
                   </div>

                   {/* Option 2: Mobile Money (Manual) */}
                   <div 
                      onClick={() => setPaymentMethod('momo')}
                      className={`p-4 border rounded-xl flex items-center gap-4 cursor-pointer transition-colors ${paymentMethod === 'momo' ? 'bg-yellow-50 border-yellow-200 ring-1 ring-yellow-200' : 'hover:bg-gray-50'}`}
                   >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'momo' ? 'border-yellow-600' : 'border-gray-400'}`}>
                        {paymentMethod === 'momo' && <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>}
                      </div>
                      <div className="bg-yellow-100 p-2 rounded text-yellow-700">
                         <Smartphone size={24} />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-900">Manual Mobile Money</h4>
                         <p className="text-xs text-slate-500">Send to our official number manually.</p>
                      </div>
                   </div>

                   {/* Option 3: Pay on Delivery */}
                   <div 
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 border rounded-xl flex items-center gap-4 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'bg-green-50 border-green-200 ring-1 ring-green-200' : 'hover:bg-gray-50'}`}
                   >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-green-600' : 'border-gray-400'}`}>
                        {paymentMethod === 'cod' && <div className="w-3 h-3 bg-green-600 rounded-full"></div>}
                      </div>
                      <div className="bg-green-100 p-2 rounded text-green-700">
                         <Banknote size={24} />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-900">Pay on Delivery (Cash)</h4>
                         <p className="text-xs text-slate-500">Pay when you receive your items.</p>
                      </div>
                   </div>

                   <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                     <button onClick={() => setStep('shipping')} className="px-6 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Back</button>
                     <Button onClick={handleProcessPayment} disabled={loading}>
                       {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : `Pay GHS ${cartTotal.toLocaleString()}`}
                     </Button>
                   </div>
                   
                   <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
                      <Lock size={12} /> Secure Checkout Guarantee
                   </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Summary & Trust */}
          <div className="lg:w-1/3 space-y-6">
             {/* Order Summary */}
             <div className="bg-slate-900 text-white p-6 rounded-2xl sticky top-24 shadow-xl">
                <h3 className="text-lg font-bold mb-6 border-b border-white/20 pb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <span>GHS {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Delivery</span>
                    <span>{deliveryMode === 'pickup' ? 'Free' : 'Calc at Checkout'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Tax (Est.)</span>
                    <span>GHS 0.00</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xl font-bold pt-4 border-t border-white/20">
                  <span>Total</span>
                  <span className="text-brand-yellow">GHS {cartTotal.toLocaleString()}</span>
                </div>
             </div>

             {/* Trust Signals & Policy */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="text-green-600" size={20} /> Checkout Guarantee
                </h4>
                <div className="space-y-4 text-sm text-slate-600">
                   <div className="flex gap-3">
                      <div className="bg-blue-50 p-2 rounded h-fit text-blue-600"><Lock size={16} /></div>
                      <div>
                        <p className="font-semibold text-slate-800">100% Secure</p>
                        <p className="text-xs">Your data is encrypted and safe.</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <div className="bg-orange-50 p-2 rounded h-fit text-orange-600"><RefreshCw size={16} /></div>
                      <div>
                        <p className="font-semibold text-slate-800">7-Day Returns</p>
                        <p className="text-xs">Easy returns for defective items.</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <div className="bg-purple-50 p-2 rounded h-fit text-purple-600"><MapPin size={16} /></div>
                      <div>
                        <p className="font-semibold text-slate-800">Nationwide Delivery</p>
                        <p className="text-xs">We deliver to all regions in Ghana.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;