import React from 'react';
import { motion } from 'framer-motion';
import { SERVICES } from '../constants';
import Button from '../components/Button';

const Services: React.FC = () => {
  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Comprehensive IT solutions designed to secure, optimize, and grow your business.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="p-8">
                  <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                    <service.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{service.title}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="border-t border-gray-100 pt-6">
                    <Button to={`/booking?service=${service.title}`} variant="outline" className="w-full text-sm">
                      Request Service
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Block */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
           <div className="bg-primary-600 rounded-3xl p-8 md:p-16 text-center text-white">
             <h2 className="text-3xl font-bold mb-6">Need a Custom Solution?</h2>
             <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
               Not seeing exactly what you need? We provide tailored IT consultancy and bespoke infrastructure setups.
             </p>
             <Button to="/contact" variant="white">Talk to an Expert</Button>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Services;