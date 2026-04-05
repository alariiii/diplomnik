import React from 'react';
import { GraduationCap } from 'lucide-react';

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">Три простых шага до <br/>идеальной оценки</h2>
            <div className="space-y-8 mt-10">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30">1</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Введите тему и требования</h4>
                  <p className="text-slate-400">Укажите тему, специальность, количество страниц и прикрепите методичку (опционально).</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-500/30">2</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Утвердите план</h4>
                  <p className="text-slate-400">ИИ за 10 секунд предложит детальный план. Вы можете изменить его или попросить сгенерировать новый.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-pink-500/30">3</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Скачайте готовую работу</h4>
                  <p className="text-slate-400">Получите полностью готовый .docx файл, который можно сразу отправлять на проверку.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            {/* Декоративная графика */}
            <div className="relative rounded-3xl bg-gradient-to-tr from-slate-800 to-slate-900 p-2 shadow-2xl border border-slate-700">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-3xl opacity-20 rounded-full"></div>
              <div className="relative bg-[#0B0F19] rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="font-medium text-slate-300">Предпросмотр документа</span>
                </div>
                
                {/* Скелетон документа */}
                <div className="space-y-4">
                  <div className="h-6 bg-slate-800 rounded w-3/4 mx-auto mb-8"></div>
                  <div className="h-4 bg-slate-800 rounded w-full"></div>
                  <div className="h-4 bg-slate-800 rounded w-full"></div>
                  <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                  <div className="py-2"></div>
                  <div className="h-4 bg-slate-800 rounded w-full"></div>
                  <div className="h-4 bg-slate-800 rounded w-4/5"></div>
                  <div className="py-2"></div>
                  <div className="h-32 bg-slate-800/50 rounded w-full border border-slate-700/50 border-dashed flex items-center justify-center">
                    <span className="text-slate-500 text-sm">Таблица 1.1 - Анализ данных</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;