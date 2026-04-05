import React, { useState } from 'react';
import { BrainCircuit, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">
              Диплом<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">GPT</span>
            </span>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Преимущества</a>
            <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">Как это работает</a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Тарифы</a>
            <button className="text-slate-300 hover:text-white font-medium transition-colors">Войти</button>
            <button className="bg-white text-indigo-950 px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-50 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Начать бесплатно
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300">
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0B0F19] border-b border-slate-800 absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-4 shadow-xl">
            <a href="#features" className="block text-slate-300 hover:text-white py-2">Преимущества</a>
            <a href="#how-it-works" className="block text-slate-300 hover:text-white py-2">Как это работает</a>
            <a href="#pricing" className="block text-slate-300 hover:text-white py-2">Тарифы</a>
            <div className="pt-4 flex flex-col gap-3 border-t border-slate-800">
              <button className="w-full py-3 text-slate-300 font-medium border border-slate-700 rounded-xl">Войти</button>
              <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl">
                Начать бесплатно
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;