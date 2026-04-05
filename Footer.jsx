import React from 'react';
import { BrainCircuit } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#05070A] py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-indigo-500" />
          <span className="font-bold text-xl text-white">ДипломGPT</span>
        </div>
        <div className="flex gap-6 text-slate-500 text-sm">
          <a href="#" className="hover:text-slate-300 transition-colors">Политика конфиденциальности</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Пользовательское соглашение</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Контакты</a>
        </div>
        <div className="text-slate-600 text-sm">
          © 2026 ДипломGPT. Все права защищены.
        </div>
      </div>
    </footer>
  );
};

export default Footer;