import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Filter, Search, Plus, ArrowUpDown } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface FlyingItem {
  id: number;
  x: number;
  y: number;
  image: string;
}

const Store: React.FC = () => {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // State for flying animation particles
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  const categories = ['All', ...Array.from(new Set(PRODUCTS.map(p => p.category)))];

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortOrder === 'asc') return a.price - b.price;
    return b.price - a.price;
  });

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Calculate Start Position (Button Center)
    const button = e.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const newItem: FlyingItem = {
      id: Date.now(),
      x: startX,
      y: startY,
      image: product.image
    };

    setFlyingItems(prev => [...prev, newItem]);

    // 2. Delay Context Update to sync with Animation Arrival
    // Animation duration is set to 0.8s below
    setTimeout(() => {
        addToCart(product); // This triggers the Layout cart bump/shake
        
        // Remove particle after it "hits" the cart
        setFlyingItems(prev => prev.filter(item => item.id !== newItem.id));
    }, 700);
  };

  // Calculate approximate cart position based on viewport
  // On Desktop: Cart is roughly 200px from right (inside container)
  // On Mobile: Cart is roughly 60px from right
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const targetX = typeof window !== 'undefined' ? window.innerWidth - (isMobile ? 80 : 150) : 0;
  const targetY = 30; // Approx header height center

  return (
    <div className="pt-20 bg-gray-50 min-h-screen relative overflow-x-hidden">
      
      {/* Flying Items Animation Overlay */}
      <AnimatePresence>
        {flyingItems.map(item => (
          <motion.img
            key={item.id}
            src={item.image}
            initial={{ 
              position: 'fixed', 
              left: item.x, 
              top: item.y, 
              width: 60, 
              height: 60, 
              opacity: 0.8, 
              zIndex: 9999, // High z-index to fly over everything
              borderRadius: '50%',
              objectFit: 'cover',
              pointerEvents: 'none',
              translateX: '-50%', // Center on coordinates
              translateY: '-50%',
            }}
            animate={{ 
              left: targetX,
              top: targetY,
              width: 20, 
              height: 20, 
              opacity: 0.5,
              scale: 0.2
            }}
            transition={{ 
              duration: 0.8, 
              ease: [0.16, 1, 0.3, 1] // Bezier for "toss" effect
            }}
            className="shadow-2xl border-2 border-white rounded-full"
          />
        ))}
      </AnimatePresence>

      {/* Header / Hero */}
      <section className="bg-white border-b border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Buzzitech Store</h1>
              <p className="text-slate-500 mt-2">Premium IT Hardware: Starlink, CCTV, & Networking</p>
            </div>
            
            <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow md:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search devices..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 w-full md:w-64 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <ArrowUpDown size={16} />
                </div>
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="pl-10 pr-8 py-2.5 rounded-lg border border-gray-300 bg-white text-slate-700 focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer w-full md:w-auto"
                >
                  <option value="asc">Price: Low to High</option>
                  <option value="desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-20 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm py-4">
        <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex space-x-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section className="py-12 container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 group flex flex-col"
              >
                <div className="relative h-64 overflow-hidden bg-gray-100 p-4 flex items-center justify-center">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" 
                  />
                  {product.stock < 10 && (
                    <span className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded border border-orange-200">
                      Only {product.stock} Left
                    </span>
                  )}
                  {product.category === 'Starlink' && (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                      High Speed
                    </span>
                  )}
                </div>

                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide bg-primary-50 px-2 py-0.5 rounded">
                      {product.category}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-slate-900 text-lg mb-2 leading-tight group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-grow">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400">Price</span>
                        <span className="text-xl font-bold text-slate-900">
                          GHS {product.price.toLocaleString()}
                        </span>
                    </div>
                    
                    {/* Add to Cart Button with Press Animation */}
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => handleAddToCart(e, product)}
                      className="bg-slate-900 hover:bg-primary-600 text-white p-3 rounded-xl transition-colors shadow-lg active:shadow-inner flex items-center justify-center relative overflow-hidden"
                      title="Add to Cart"
                    >
                      <Plus size={20} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-slate-400">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">No products found matching your criteria.</p>
              <button 
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="text-primary-600 hover:underline mt-2"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Store;