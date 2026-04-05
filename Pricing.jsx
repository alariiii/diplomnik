import React from 'react';
import { CheckCircle2, Zap } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Реферат / Эссе',
      description: 'Короткие работы для промежуточных оценок.',
      price: '290',
      period: ' / проект',
      features: ['До 15 страниц', 'Уникальность 80%+', 'Бесплатные правки по теме', 'Доступ навсегда'],
      buttonText: 'Начать проект',
      buttonVariant: 'outline',
      isPopular: false
    },
    {
      name: 'Курсовая работа',
      description: 'Глубокое исследование с аналитикой.',
      price: '490',
      period: ' / проект',
      features: ['До 35 страниц', 'Уникальность 85%+', 'Базовое оформление', 'Бесплатные правки по теме'],
      buttonText: 'Начать курсовую',
      buttonVariant: 'solid',
      isPopular: true
    },
    {
      name: 'Диплом (ВКР)',
      description: 'Полный цикл работы под ключ.',
      price: '1 490',
      period: ' / проект',
      features: ['До 80 страниц', 'Уникальность 90-95%+', 'Строгий ГОСТ', 'Безлимитные правки по теме', 'Авто-защита от смены темы'],
      buttonText: 'Создать диплом',
      buttonVariant: 'outline',
      isPopular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-[#0F1423] border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Оплата только за результат</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Никаких скрытых подписок. Вы платите один раз за проект и получаете доступ к его бесплатным доработкам в рамках выбранной темы.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-3xl p-8 flex flex-col relative transition-all duration-300 ${
                plan.isPopular 
                  ? 'bg-gradient-to-b from-indigo-900/50 to-[#0B0F19] border border-indigo-500/50 transform md:-translate-y-4 shadow-2xl shadow-indigo-500/20' 
                  : 'bg-[#0B0F19] border border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                  <Zap className="w-4 h-4 fill-current" /> Хит продаж
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className={plan.isPopular ? 'text-indigo-300 mb-6' : 'text-slate-400 mb-6'}>{plan.description}</div>
              
              <div className="mb-8">
                <span className="text-4xl font-extrabold">{plan.price} ₽</span>
                <span className="text-slate-500">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.isPopular ? 'text-indigo-400' : 'text-slate-600'}`} /> 
                    <span className={plan.isPopular ? 'text-slate-100 font-medium' : 'text-slate-300'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-xl font-bold transition-all ${
                plan.buttonVariant === 'solid'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                  : 'border border-slate-700 hover:bg-slate-800 text-white'
              }`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;