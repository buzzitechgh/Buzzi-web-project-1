import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, CreditCard, Smartphone, CheckCircle, ShieldCheck, Truck, MapPin, Banknote, Map, ExternalLink, Wrench, Info, Loader2, Search, Navigation, Lock } from 'lucide-react';
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

// Costs Configuration
const DELIVERY_FEE_ACCRA = 50;
const DELIVERY_FEE_OUTSIDE = 150;
const INSTALL_FEE_ACCRA = 500;
const INSTALL_FEE_OUTSIDE = 1500;

interface LocationSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const Checkout: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [loading, setLoading] = useState(false);
  
  // Location States
  const [geoLoading, setGeoLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [installationType, setInstallationType] = useState<'none' | 'standard' | 'estimate'>('none');
  
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

  // 1. Calculate Delivery Cost
  const deliveryCost = deliveryMode === 'delivery'
    ? (customer.region === 'Greater Accra' ? DELIVERY_FEE_ACCRA : DELIVERY_FEE_OUTSIDE)
    : 0;

  // 2. Calculate Installation Cost
  const installationCost = installationType === 'standard'
    ? (customer.region === 'Greater Accra' ? INSTALL_FEE_ACCRA : INSTALL_FEE_OUTSIDE)
    : 0;

  // 3. Grand Total
  const grandTotal = cartTotal + deliveryCost + installationCost;

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Debounce Search Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2 && isSearching) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, isSearching]);

  const fetchSuggestions = async (query: string) => {
    try {
      // Using Nominatim (OpenStreetMap) for free geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=gh&limit=5&addressdetails=1`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleSelectLocation = (place: LocationSuggestion) => {
    const coords = `${parseFloat(place.lat).toFixed(6)}, ${parseFloat(place.lon).toFixed(6)}`;
    
    // Update fields
    setSearchQuery(place.display_name.split(',')[0]); // Just the main name in search bar
    setCustomer(prev => ({
      ...prev,
      address: `${place.display_name}\n(GPS: ${coords})`,
      gpsCoordinates: coords
    }));
    
    setShowSuggestions(false);
    setIsSearching(false);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);

    const successCallback = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      
      let detectedAddress = '';

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        if (response.ok) {
           const data = await response.json();
           if (data.display_name) {
             detectedAddress = data.display_name;
           }
        }
      } catch (error) {
        console.warn("Could not reverse geocode address", error);
      }

      setCustomer(prev => ({
        ...prev,
        gpsCoordinates: coords,
        address: detectedAddress 
           ? `${detectedAddress}\n(GPS: ${coords})` 
           : `GPS Location: ${coords}`
      }));
      
      // Update the search bar visual to show "Current Location"
      setSearchQuery(detectedAddress ? detectedAddress.split(',')[0] : `GPS: ${coords}`);
      
      setGeoLoading(false);
    };

    const errorCallback = (error: any) => {
      console.error(`Geolocation Error: Code ${error?.code} - ${error?.message}`);
      let errorMessage = "Unable to retrieve your location.";
      
      if (error?.code === 1) errorMessage = "Location permission denied. Please allow access.";
      else if (error?.code === 2) errorMessage = "Location unavailable. Ensure GPS is on or try manually typing your address.";
      else if (error?.code === 3) errorMessage = "Request timed out. Please try again.";

      alert(errorMessage);
      setGeoLoading(false);
    };

    // Attempt 1: High Accuracy (GPS)
    navigator.geolocation.getCurrentPosition(
      successCallback,
      (error) => {
        // Fallback Mechanism
        if (error.code === 2 || error.code === 3) {
            console.warn("High accuracy GPS failed, retrying with low accuracy...");
            // Attempt 2: Low Accuracy (WiFi/Cell Towers)
            navigator.geolocation.getCurrentPosition(
                successCallback,
                errorCallback, 
                { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
            );
        } else {
            // Permission denied (Code 1) or other errors - fail immediately
            errorCallback(error);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleProcessPayment = async () => {
    setLoading(true);
    const order: Order = {
      id: `ORD-${Date.now()}`,
      items: cart,
      total: grandTotal,
      customer,
      deliveryMode,
      deliveryCost,
      paymentMethod,
      status: 'pending',
      date: new Date(),
      installationType,
      installationCost
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
             <p><strong>Total Amount:</strong> GHS {grandTotal.toLocaleString()}</p>
             <div className="my-2 border-t border-slate-200"></div>
             <p><strong>Delivery:</strong> {deliveryMode === 'pickup' ? 'Store Pickup' : `Door Delivery (${customer.region})`}</p>
             <p><strong>Installation:</strong> {
                installationType === 'none' ? 'Self-Install' : 
                installationType === 'standard' ? 'Standard Setup' : 
                'On-Site Estimate Requested'
             }</p>
          </div>
          <Button to="/store">Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          
          {/* LEFT COLUMN */}
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
                        <div className="flex justify-between items-center">
                           <p className="text-sm text-slate-500">{item.category}</p>
                           <p className="font-bold text-slate-900 md:hidden">GHS {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {step === 'cart' ? (
                        <div className="flex items-center gap-3">
                          <input 
                            type="number" 
                            min="1" 
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                            className="w-16 px-2 py-1 border rounded text-center text-sm bg-white text-slate-900"
                          />
                          <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-right hidden md:block">
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

            {/* Step 2: Delivery & Contact */}
            <div className={`bg-white p-6 rounded-xl shadow-sm border ${step === 'shipping' ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">2. Delivery & Installation</h2>
                {step === 'payment' && <button onClick={() => setStep('shipping')} className="text-primary-600 text-sm font-semibold underline">Edit</button>}
              </div>

              {step === 'shipping' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900" 
                        value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900" 
                        value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input type="tel" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900" 
                        value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} placeholder="050 000 0000" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-800 mb-1">Region (Affects Delivery & Install Fees)</label>
                      <select 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                        value={customer.region}
                        onChange={(e) => setCustomer({...customer, region: e.target.value})}
                      >
                        {GHANA_REGIONS.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>

                    {/* Delivery Mode */}
                    <div className="md:col-span-2 space-y-3 mt-2">
                        <p className="text-sm font-medium text-slate-700">Choose Delivery Method:</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <label className={`flex-1 p-4 border rounded-xl cursor-pointer flex items-center gap-4 transition-all ${deliveryMode === 'delivery' ? 'bg-blue-50 border-primary-500 ring-1 ring-primary-500' : 'hover:bg-gray-50 border-gray-200'}`}>
                              <input type="radio" name="deliveryMode" value="delivery" checked={deliveryMode === 'delivery'} onChange={() => setDeliveryMode('delivery')} className="w-5 h-5 text-primary-600" />
                              <div className="flex-grow">
                                <div className="font-bold text-slate-900 flex justify-between">
                                   <span className="flex items-center gap-2"><Truck size={18} /> Door Delivery</span>
                                   <span>GHS {customer.region === 'Greater Accra' ? DELIVERY_FEE_ACCRA : DELIVERY_FEE_OUTSIDE}</span>
                                </div>
                                <p className="text-xs text-slate-500">We deliver to your provided address.</p>
                              </div>
                          </label>

                          <label className={`flex-1 p-4 border rounded-xl cursor-pointer flex items-center gap-4 transition-all ${deliveryMode === 'pickup' ? 'bg-blue-50 border-primary-500 ring-1 ring-primary-500' : 'hover:bg-gray-50 border-gray-200'}`}>
                              <input type="radio" name="deliveryMode" value="pickup" checked={deliveryMode === 'pickup'} onChange={() => setDeliveryMode('pickup')} className="w-5 h-5 text-primary-600" />
                              <div className="flex-grow">
                                <div className="font-bold text-slate-900 flex justify-between">
                                   <span className="flex items-center gap-2"><MapPin size={18} /> Store Pickup</span>
                                   <span className="text-green-600">FREE</span>
                                </div>
                                <p className="text-xs text-slate-500">Collect from Accra Main Office.</p>
                              </div>
                          </label>
                        </div>
                    </div>

                    {deliveryMode === 'delivery' && (
                      <div className="md:col-span-2 space-y-4">
                        
                        {/* 1. Location Search / Auto Grab */}
                        <div>
                           <div className="flex justify-between items-end mb-1">
                              <label className="block text-sm font-medium text-slate-700">Find Your Location</label>
                              <a 
                                  href="https://www.ghanapostgps.com/map/" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-slate-400 hover:text-brand-yellow flex items-center gap-1 font-medium transition-colors"
                              >
                                  <ExternalLink size={10} /> GhanaPost Map
                              </a>
                           </div>
                           
                           <div className="relative" ref={wrapperRef}>
                              <div className="relative">
                                <input 
                                  type="text"
                                  value={searchQuery}
                                  onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsSearching(true);
                                  }}
                                  placeholder="Search landmark, area, or street..."
                                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 shadow-sm transition-all"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                
                                {/* GPS Auto-Grab Button */}
                                <button
                                  type="button"
                                  onClick={handleUseLocation}
                                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${geoLoading ? 'text-primary-600 bg-primary-50' : 'text-slate-500 hover:text-primary-600 hover:bg-slate-100'}`}
                                  title="Auto-detect my location"
                                >
                                  {geoLoading ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                                </button>
                              </div>

                              {/* Autocomplete Dropdown */}
                              {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                  {suggestions.map((place) => (
                                    <li 
                                      key={place.place_id}
                                      onClick={() => handleSelectLocation(place)}
                                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-start gap-3 transition-colors"
                                    >
                                      <MapPin size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-slate-700 leading-snug">{place.display_name}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                           </div>
                        </div>

                        {/* 2. Detailed Address Textarea */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Address / Digital Address</label>
                          <textarea 
                              rows={2} 
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm" 
                              value={customer.address} 
                              onChange={e => setCustomer({...customer, address: e.target.value})}
                              placeholder="e.g., House No. 5, Near Shell Filling Station, GA-123-4567"
                          ></textarea>
                          {customer.gpsCoordinates && (
                            <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1 font-medium">
                              <CheckCircle size={10} /> GPS Coordinates attached: {customer.gpsCoordinates}
                            </p>
                          )}
                        </div>

                      </div>
                    )}
                  </div>

                  {/* INSTALLATION SECTION - MODIFIED */}
                  <div className="border-t pt-6 mt-4">
                     <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Wrench className="text-brand-yellow" size={20} /> Professional Installation
                     </h3>
                     
                     <div className="space-y-3">
                        {/* Option 1: No Installation */}
                        <label className={`block p-4 border rounded-xl cursor-pointer transition-all ${installationType === 'none' ? 'bg-gray-100 border-gray-400' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>
                           <div className="flex items-center gap-3">
                              <input type="radio" name="installType" checked={installationType === 'none'} onChange={() => setInstallationType('none')} className="w-5 h-5 text-slate-600" />
                              <div>
                                 <span className="font-bold text-slate-800">No Installation (Self-Setup)</span>
                                 <p className="text-xs text-slate-500">I will handle the installation myself.</p>
                              </div>
                           </div>
                        </label>

                        {/* Option 2: Standard Installation */}
                        <label className={`block p-4 border rounded-xl cursor-pointer transition-all ${installationType === 'standard' ? 'bg-blue-50 border-primary-500 ring-1 ring-primary-500' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>
                           <div className="flex items-center gap-3">
                              <input type="radio" name="installType" checked={installationType === 'standard'} onChange={() => setInstallationType('standard')} className="w-5 h-5 text-primary-600" />
                              <div className="flex-grow flex justify-between items-center">
                                 <div>
                                    <span className="font-bold text-slate-900">Standard Installation</span>
                                    <p className="text-xs text-slate-500">
                                       Professional setup. {customer.region === 'Greater Accra' ? 'Local Rate.' : 'Includes outstation logistics.'}
                                    </p>
                                 </div>
                                 <div className="text-right">
                                    <span className="block font-bold text-primary-700">GHS {(customer.region === 'Greater Accra' ? INSTALL_FEE_ACCRA : INSTALL_FEE_OUTSIDE).toLocaleString()}</span>
                                 </div>
                              </div>
                           </div>
                        </label>

                        {/* Option 3: On-Site Estimate */}
                        <label className={`block p-4 border rounded-xl cursor-pointer transition-all ${installationType === 'estimate' ? 'bg-yellow-50 border-yellow-500 ring-1 ring-yellow-500' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>
                           <div className="flex items-center gap-3">
                              <input type="radio" name="installType" checked={installationType === 'estimate'} onChange={() => setInstallationType('estimate')} className="w-5 h-5 text-yellow-600" />
                              <div className="flex-grow flex justify-between items-center">
                                 <div>
                                    <span className="font-bold text-slate-900">Request On-Site Estimate</span>
                                    <p className="text-xs text-slate-500">For complex setups. Our team will visit to assess and quote.</p>
                                 </div>
                                 <div className="text-right">
                                    <span className="block font-bold text-slate-600">GHS 0.00</span>
                                    <span className="text-[10px] uppercase text-slate-400 font-bold">Pay Later</span>
                                 </div>
                              </div>
                           </div>
                        </label>
                     </div>
                  </div>

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
              )}
            </div>

            {/* Step 3: Payment */}
            <div className={`bg-white p-6 rounded-xl shadow-sm border ${step === 'payment' ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200'}`}>
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Payment Method</h2>
              
              {step === 'payment' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                   {/* Payment Options (Same as before) */}
                   <div onClick={() => setPaymentMethod('paystack')} className={`p-4 border rounded-xl flex items-center gap-4 cursor-pointer transition-colors ${paymentMethod === 'paystack' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'hover:bg-gray-50'}`}>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'paystack' ? 'border-primary-600' : 'border-gray-400'}`}>
                        {paymentMethod === 'paystack' && <div className="w-3 h-3 bg-primary-600 rounded-full"></div>}
                      </div>
                      <div className="bg-blue-100 p-2 rounded text-blue-700"><CreditCard size={24} /></div>
                      <div>
                         <h4 className="font-bold text-slate-900">Paystack (Card/MoMo Online)</h4>
                         <p className="text-xs text-slate-500">Secure immediate payment.</p>
                      </div>
                   </div>

                   <div onClick={() => setPaymentMethod('momo')} className={`p-4 border rounded-xl flex items-center gap-4 cursor-pointer transition-colors ${paymentMethod === 'momo' ? 'bg-yellow-50 border-yellow-200 ring-1 ring-yellow-200' : 'hover:bg-gray-50'}`}>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'momo' ? 'border-yellow-600' : 'border-gray-400'}`}>
                        {paymentMethod === 'momo' && <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>}
                      </div>
                      <div className="bg-yellow-100 p-2 rounded text-yellow-700"><Smartphone size={24} /></div>
                      <div>
                         <h4 className="font-bold text-slate-900">Manual Mobile Money</h4>
                         <p className="text-xs text-slate-500">Send to our official number manually.</p>
                      </div>
                   </div>

                   <div onClick={() => setPaymentMethod('cod')} className={`p-4 border rounded-xl flex items-center gap-4 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'bg-green-50 border-green-200 ring-1 ring-green-200' : 'hover:bg-gray-50'}`}>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-green-600' : 'border-gray-400'}`}>
                        {paymentMethod === 'cod' && <div className="w-3 h-3 bg-green-600 rounded-full"></div>}
                      </div>
                      <div className="bg-green-100 p-2 rounded text-green-700"><Banknote size={24} /></div>
                      <div>
                         <h4 className="font-bold text-slate-900">Pay on Delivery (Cash)</h4>
                         <p className="text-xs text-slate-500">Pay when you receive your items.</p>
                      </div>
                   </div>

                   <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                     <button onClick={() => setStep('shipping')} className="px-6 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Back</button>
                     <Button onClick={handleProcessPayment} disabled={loading}>
                       {loading ? 'Processing...' : `Pay GHS ${grandTotal.toLocaleString()}`}
                     </Button>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Summary */}
          <div className="lg:w-1/3 space-y-6">
             <div className="bg-slate-900 text-white p-6 rounded-2xl sticky top-24 shadow-xl">
                <h3 className="text-lg font-bold mb-6 border-b border-white/20 pb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <span>GHS {cartTotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-slate-300">
                    <span>Delivery ({deliveryMode === 'pickup' ? 'Pickup' : 'Door'})</span>
                    <span className={deliveryCost > 0 ? 'text-white font-semibold' : ''}>
                       {deliveryMode === 'pickup' ? 'Free' : `GHS ${deliveryCost.toLocaleString()}`}
                    </span>
                  </div>
                  
                  {/* Install Line */}
                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center gap-1">
                       Installation 
                       {installationType === 'estimate' && <Info size={12} className="text-brand-yellow" />}
                    </span>
                    <span className={installationType !== 'none' ? 'text-brand-yellow font-medium' : ''}>
                       {installationType === 'none' ? '--' : 
                        installationType === 'estimate' ? 'On-Site Est.' : 
                        `GHS ${installationCost.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-300 pt-2 border-t border-white/10">
                    <span>Tax (Est.)</span>
                    <span>GHS 0.00</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xl font-bold pt-4 border-t border-white/20">
                  <span>Total</span>
                  <span className="text-brand-yellow">GHS {grandTotal.toLocaleString()}</span>
                </div>
             </div>
             
             {/* Trust Signals (Reused) */}
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
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;