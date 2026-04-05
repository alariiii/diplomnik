import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';

const Hero = () => {
  const [demoStep, setDemoStep] = useState(0);

  // Имитация процесса генерации для демо-блока
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoStep((prev) => (prev < 3 ? prev + 1 : 0));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const demoTexts = [
    "Анализ темы: 'Влияние нейросетей на экономику'...",
    "Сбор научных источников (проанализировано 142 статьи)...",
    "Генерация структуры и первой главы (уникальность 98%)...",
    "Форматирование по ГОСТу завершено. Файл готов!"
  ];

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Фоновые эффекты */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-8 backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Продвинутый алгоритм: Теперь с оформлением по ГОСТ</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Идеальная дипломная <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            за 5 минут автоматически
          </span>
        </h1>
        
        <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Система, обученная на миллионах научных статей. Генерирует уникальный текст, строит структуру, проходит Антиплагиат и оформляет список литературы.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 bg-white text-indigo-950 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2">
            Написать диплом <ArrowRight className="w-5 h-5" />
          </button>
          <button className="px-8 py-4 bg-slate-800/50 border border-slate-700 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
            Смотреть примеры
          </button>
        </div>

        {/* Интерактивный демо-блок */}
        <div className="mt-20 max-w-3xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl text-left">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-sm text-slate-500 font-mono">generation_process.exe</div>
          </div>
          
          <div className="space-y-4 font-mono">
            <div className="flex items-center gap-3 text-indigo-400">
              <span className="text-slate-500">~</span>
              <span className="text-white">Тема:</span> Разработка веб-приложения на React
            </div>
            
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mt-6 mb-4">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${(demoStep + 1) * 25}%` }}
              ></div>
            </div>
            
            <div className="flex items-start gap-3 min-h-[3rem]">
              <Clock className={`w-5 h-5 mt-0.5 ${demoStep === 3 ? 'text-green-400' : 'text-indigo-400 animate-pulse'}`} />
              <span className={demoStep === 3 ? 'text-green-400' : 'text-slate-300'}>
                {demoTexts[demoStep]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;