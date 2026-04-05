import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Pricing from './Pricing';
import Footer from './Footer';

const App = () => {

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-50 font-sans selection:bg-indigo-500/30">
      
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />

      {/* CTA Секция */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Хватит откладывать на потом</h2>
          <p className="text-xl text-slate-300 mb-10">Сгенерируйте первую главу прямо сейчас абсолютно бесплатно и убедитесь в качестве.</p>
          <button className="px-10 py-5 bg-white text-indigo-950 rounded-2xl font-extrabold text-xl hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.4)]">
            Попробовать бесплатно
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default App;