import React, { useState } from 'react';
import { 
  BrainCircuit, 
  FileText, 
  User, 
  Info, 
  Menu, 
  X, 
  History, 
  Settings, 
  LogOut,
  ChevronRight,
  Sparkles,
  Clock,
  Zap,
  CheckCircle2,
  Download
} from 'lucide-react';

// --- Компоненты страниц ---

const WelcomePage = ({ navigate }) => (
  <div className="space-y-8 animate-in fade-in duration-500 relative">
    {/* Декоративное свечение */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
    
    <section className="text-center py-20 px-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl relative z-10 shadow-2xl">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-6">
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">Продвинутый алгоритм активен</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
        Добро пожаловать в <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">ДипломGPT</span>
      </h1>
      <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Ваш умный ассистент для написания академических работ. Выбирайте тему, задавайте параметры, и система подготовит структуру, текст и оформит всё по ГОСТу.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button 
          onClick={() => navigate('generator')}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" /> Написать работу
        </button>
        <button 
          onClick={() => navigate('history')}
          className="px-8 py-4 bg-[#0F1423] text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-colors border border-slate-700 flex items-center justify-center gap-2"
        >
          <History className="w-5 h-5" /> Мои документы
        </button>
      </div>
    </section>

    <section className="grid md:grid-cols-3 gap-6 relative z-10">
      {[
        { title: 'Оформление по ГОСТ', desc: 'Автоматическое форматирование абзацев, отступов и шрифтов в итоговом .docx файле.', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        { title: 'Мгновенная генерация', desc: 'Написание полноценной курсовой или ВКР занимает считанные минуты.', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        { title: 'Уникальность', desc: 'Алгоритм генерирует оригинальный текст, успешно проходящий системы Антиплагиата.', icon: BrainCircuit, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
      ].map((feature, i) => (
        <div key={i} className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl hover:bg-slate-800/60 transition-colors">
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${feature.bg}`}>
            <feature.icon className={`w-6 h-6 ${feature.color}`} />
          </div>
          <h3 className="text-xl font-bold text-slate-200 mb-2">{feature.title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
        </div>
      ))}
    </section>
  </div>
);

const HistoryPage = () => {
  // Статистика использования сервиса
  const stats = [
    { title: 'Сгенерировано работ', value: '12', icon: FileText, trend: '+2 на этой неделе', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Сэкономлено времени', value: '~48 ч', icon: Clock, trend: 'Вместо ручного написания', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Написано слов', value: '45,200', icon: BrainCircuit, trend: 'Высокая уникальность', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-100">История генераций</h2>
      </div>

      {/* Карточки статистики */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-slate-100">{stat.value}</h3>
              <p className="text-xs font-medium text-slate-500 mt-2">{stat.trend}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} border border-slate-700/50`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Таблица документов */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-200">Последние документы</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#0F1423] text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Тема работы</th>
                <th className="px-6 py-4 font-medium">Тип</th>
                <th className="px-6 py-4 font-medium">Дата создания</th>
                <th className="px-6 py-4 font-medium">Статус</th>
                <th className="px-6 py-4 font-medium text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                { topic: 'Влияние нейросетей на экономику...', type: 'Курсовая', date: 'Сегодня, 14:30', status: 'Готово' },
                { topic: 'Разработка веб-приложения на React...', type: 'ВКР', date: 'Вчера, 18:15', status: 'Готово' },
                { topic: 'Этика искусственного интеллекта...', type: 'Эссе', date: '12 Окт 2023', status: 'Ошибка' },
              ].map((doc, i) => (
                <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200">{doc.topic}</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-slate-800 rounded-md text-xs">{doc.type}</span></td>
                  <td className="px-6 py-4 text-slate-400">{doc.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      doc.status === 'Готово' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Скачать .docx">
                      <Download className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => (
  <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-800 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
      </div>
      <div className="px-8 pb-8 relative">
        <div className="w-24 h-24 bg-[#0B0F19] rounded-full p-1.5 absolute -top-12 border border-slate-700 shadow-xl">
          <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-slate-400" />
          </div>
        </div>
        <div className="mt-16 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Студент Pro</h2>
            <p className="text-slate-400">student@university.edu</p>
          </div>
          <button className="px-4 py-2 bg-[#0F1423] border border-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" /> Настройки
          </button>
        </div>
        
        <div className="mt-10 space-y-6">
          <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-3">Информация об аккаунте</h3>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="bg-[#0F1423] p-4 rounded-xl border border-slate-800/50">
              <p className="text-slate-500 mb-1">Тарифный план</p>
              <p className="font-bold text-indigo-400">Безлимит (Бета)</p>
            </div>
            <div className="bg-[#0F1423] p-4 rounded-xl border border-slate-800/50">
              <p className="text-slate-500 mb-1">Дата регистрации</p>
              <p className="font-medium text-slate-200">24 Окт 2023</p>
            </div>
            <div className="bg-[#0F1423] p-4 rounded-xl border border-slate-800/50">
              <p className="text-slate-500 mb-1">Статус аккаунта</p>
              <p className="font-medium text-emerald-400">Активен</p>
            </div>
            <div className="bg-[#0F1423] p-4 rounded-xl border border-slate-800/50">
              <p className="text-slate-500 mb-1">Лимит запросов</p>
              <p className="font-medium text-emerald-400">Не ограничен</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AboutPage = () => (
  <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl p-8">
      <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
        <Info className="w-7 h-7" />
      </div>
      <h2 className="text-3xl font-bold text-slate-100 mb-6">О проекте ДипломGPT</h2>
      
      <div className="space-y-5 text-slate-300 leading-relaxed text-base">
        <p>
          <strong className="text-white">ДипломGPT</strong> — это инновационный инструмент для студентов и научных сотрудников, позволяющий автоматизировать процесс создания академических текстов.
        </p>
        <p>
          Наш сервис использует передовые алгоритмы генерации для построения логичной структуры и написания научного текста, который не отличим от написанного человеком.
        </p>
        
        <div className="p-5 bg-[#0F1423] rounded-xl border border-slate-800 mt-8">
          <h4 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> Под капотом сервиса:
          </h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Frontend: React, Tailwind CSS, Lucide Icons</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Backend: Express.js, SSE (Server-Sent Events)</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> База данных: SQLite + Prisma ORM</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Интеграции: docx.js (Форматирование по ГОСТ)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

// --- Основной компонент приложения ---

export default function ExtendedDashboard() {
  const [currentRoute, setCurrentRoute] = useState('welcome');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = (route) => {
    setCurrentRoute(route);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'welcome', label: 'Главная', icon: BrainCircuit },
    { id: 'generator', label: 'Новая работа', icon: FileText },
    { id: 'history', label: 'Мои работы', icon: History },
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'about', label: 'О проекте', icon: Info },
  ];

  const renderPage = () => {
    switch (currentRoute) {
      case 'welcome': return <WelcomePage navigate={navigate} />;
      // Заглушка для генератора. Сюда можно вставить твою текущую форму из Dashboard.jsx
      case 'generator': return <div className="text-center text-slate-400 py-20 animate-pulse">Здесь будет форма генерации (из старого файла)</div>; 
      case 'history': return <HistoryPage />;
      case 'profile': return <ProfilePage />;
      case 'about': return <AboutPage />;
      default: return <WelcomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-50 font-sans flex overflow-hidden">
      
      {/* Боковая панель (Sidebar) - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#05070A] border-r border-slate-800 h-screen sticky top-0 relative z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 font-bold text-xl text-white">
            <BrainCircuit className="w-8 h-8 text-indigo-500" />
            ДипломGPT
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                currentRoute === item.id 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentRoute === item.id ? 'text-indigo-400' : 'text-slate-500'}`} />
              {item.label}
              {currentRoute === item.id && <ChevronRight className="w-4 h-4 ml-auto text-indigo-500/50" />}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Мобильная шапка (Header) */}
      <header className="md:hidden bg-[#05070A]/90 backdrop-blur-md border-b border-slate-800 px-4 py-4 flex items-center justify-between fixed top-0 w-full z-30">
        <div className="flex items-center gap-2 font-bold text-lg text-white">
          <BrainCircuit className="w-6 h-6 text-indigo-500" />
          ДипломGPT
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[65px] z-20 bg-[#0B0F19] border-b border-slate-800 animate-in slide-in-from-top-2">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium transition-colors ${
                  currentRoute === item.id 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${currentRoute === item.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Основной контент */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto w-full max-w-7xl mx-auto pt-24 md:pt-8 relative z-10">
        {renderPage()}
      </main>

    </div>
  );
}