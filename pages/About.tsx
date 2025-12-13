import React from 'react';
import { Shield, Target, Users } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div>
       {/* Hero */}
       <section className="bg-slate-900 text-white pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Buzzitech</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Your trusted partner in digital transformation and IT infrastructure.
          </p>
        </div>
      </section>

      {/* Mission Vision Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
              <p className="text-slate-600">
                To empower businesses in Ghana with reliable, cutting-edge IT solutions that enhance productivity and security.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
              <p className="text-slate-600">
                To be the leading IT infrastructure and support provider in West Africa, known for excellence and innovation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Values</h3>
              <p className="text-slate-600">
                Integrity, Customer-Centricity, Innovation, and Reliability are at the core of everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History & Story */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
             <img 
               src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80" 
               alt="Field Engineers Working" 
               className="rounded-2xl shadow-xl"
             />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
            <p className="text-slate-600 mb-4 leading-relaxed">
              Founded to address the growing need for professional, enterprise-grade IT services in the local market, Buzzitech has grown from a small consultancy to a full-service IT solutions provider.
            </p>
            <p className="text-slate-600 mb-4 leading-relaxed">
              We understand the unique challenges businesses face in the digital age. Our team of certified network engineers and systems administrators works tirelessly to ensure your technology is an asset, not a liability. From complex server room cabling to installing remote Starlink internet, we handle it all.
            </p>
            <div className="mt-8 border-l-4 border-primary-500 pl-6">
               <p className="text-lg font-medium text-slate-800 italic">
                 "We don't just fix computers; we build the digital foundation for your success."
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team (Abstract Representation) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Meet Our Experts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="group">
                 <div className="relative overflow-hidden rounded-xl mb-4">
                   <img 
                     src={`https://images.unsplash.com/photo-${i === 1 ? '1560250097-0b93528c311a' : i === 2 ? '1573496359142-b8d87734a5a2' : i === 3 ? '1519085360753-af0119f7cbe7' : '1506794778202-cad84cf45f1d'}?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`}
                     alt="Team Member" 
                     className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                   />
                 </div>
                 <h4 className="text-lg font-bold text-slate-900">Senior Engineer</h4>
                 <p className="text-primary-600 text-sm">Network Specialist</p>
               </div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;