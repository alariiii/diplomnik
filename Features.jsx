import React from 'react';
import { ShieldCheck, FileText, Zap } from 'lucide-react';

const Features = () => {
  return (
    <section id="features" className="py-24 bg-[#0F1423] border-y border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Почему мы <span className="text-indigo-400">лучше других</span></h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Забудьте о долгих ночах за ноутбуком и правках от научрука. Наш ИИ делает работу за вас, качественно и академично.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.2)]">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">100% Антиплагиат</h3>
            <p className="text-slate-400 leading-relaxed">
              Текст генерируется с нуля на основе смысла, а не копируется. Работа легко проходит любые проверки (ВУЗ, Руконтекст).
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.2)]">
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Оформление по ГОСТ</h3>
            <p className="text-slate-400 leading-relaxed">
              Заголовки, отступы, шрифты, таблицы и, главное, список литературы — всё автоматически форматируется по стандартам.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_10px_40px_-10px_rgba(236,72,153,0.2)]">
            <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Моментальные правки</h3>
            <p className="text-slate-400 leading-relaxed">
              Научный руководитель просит переделать главу? Просто выделите текст и попросите ИИ переписать его с учетом замечаний.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;