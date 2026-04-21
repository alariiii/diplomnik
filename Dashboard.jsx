import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, FileText, Settings, History, Upload, Play, LogOut, ChevronDown,
  User, Info, Menu, X, ChevronRight, Sparkles, Clock, Zap, CheckCircle2, Download, LogIn, Cloud,
  ChevronLeft, Edit3
} from 'lucide-react';

// Используем относительный путь для продакшена (запросы будут идти на текущий домен)
const API_URL = import.meta.env.VITE_API_URL || '';

// --- Компоненты отдельных страниц ---

const WelcomePage = ({ navigate }) => (
  <div className="space-y-8 animate-in fade-in duration-500 relative">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
    
    <section className="text-center py-16 md:py-24 px-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl relative z-10 shadow-2xl">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-6">
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">Продвинутый алгоритм активен</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
        Добро пожаловать в <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">ДипломGPT</span>
      </h1>
      <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Ваш умный ассистент для написания академических работ. Выбирайте тему, задавайте параметры, и система подготовит структуру, текст и оформит всё по ГОСТу.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button onClick={() => navigate('generator')} className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
          <FileText className="w-5 h-5" /> Написать работу
        </button>
        <button onClick={() => navigate('history')} className="px-8 py-4 bg-[#0F1423] text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-colors border border-slate-700 flex items-center justify-center gap-2">
          <History className="w-5 h-5" /> Мои документы
        </button>
      </div>
    </section>

    <section className="grid md:grid-cols-3 gap-6 relative z-10">
      {[
        { title: 'Оформление по ГОСТ', desc: 'Автоматическое форматирование абзацев, отступов и шрифтов в .docx файле.', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        { title: 'Мгновенная генерация', desc: 'Написание полноценной курсовой или ВКР занимает считанные минуты.', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        { title: 'Высокая уникальность', desc: 'Алгоритм генерирует оригинальный текст, проходящий системы Антиплагиата.', icon: BrainCircuit, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
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

const HistoryPage = ({ documents, token, navigate, onOpenProject }) => {
  const workTypeLabels = {
    'coursework': 'Курсовая',
    'vkr': 'ВКР / Диплом',
    'essay': 'Эссе'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {!token && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-300 text-sm flex items-center gap-3">
          <Info className="w-5 h-5 shrink-0" />
          <span>
            Вы используете гостевой режим. История сохраняется только в этом браузере. <button onClick={() => navigate('profile')} className="font-bold underline hover:text-indigo-200">Войдите в аккаунт</button>, чтобы сохранить работы в облако навсегда.
          </span>
        </div>
      )}

      <h2 className="text-2xl font-bold text-slate-100">История генераций</h2>

      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-200">Сгенерированные документы</h3>
        </div>
        <div className="overflow-x-auto">
          {documents.length === 0 ? (
            <div className="p-12 text-center text-slate-500">У вас пока нет созданных работ.</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#0F1423] text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Тема работы</th>
                  <th className="px-6 py-4 font-medium">Тип</th>
                  <th className="px-6 py-4 font-medium">Дата создания</th>
                  <th className="px-6 py-4 font-medium">Статус</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {documents.map((doc) => (
                  <tr key={doc.id} onClick={() => onOpenProject(doc)} className="hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-medium text-slate-200 max-w-xs truncate" title={doc.topic}>{doc.topic}</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 bg-slate-800 rounded-md text-xs">{workTypeLabels[doc.workType] || doc.workType}</span></td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(doc.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        doc.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                        doc.status === 'generating' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                      }`}>
                        {doc.status === 'completed' ? 'Готово' : doc.status === 'generating' ? 'Генерация...' : 'Ошибка'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfilePage = ({ token, userEmail, authMode, setAuthMode, email, setEmail, password, setPassword, handleAuth, authError }) => {
  if (!token) {
    return (
      <div className="max-w-md mx-auto w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl mt-10 animate-in fade-in">
        <div className="flex items-center justify-center gap-3 mb-6">
          <BrainCircuit className="w-8 h-8 text-indigo-500" />
          <span className="font-bold text-2xl text-white">ДипломGPT</span>
        </div>
        <h2 className="text-xl font-semibold mb-4 text-center text-slate-200">
          {authMode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
        </h2>
        <p className="text-sm text-slate-400 text-center mb-8 leading-relaxed">
          Создайте аккаунт, чтобы история ваших работ сохранялась в облаке и была доступна с любого устройства.
        </p>
        
        {authError && (
          <div className={`mb-6 p-4 border rounded-xl text-sm ${authError.includes('успешна') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {authError}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#0F1423] border border-slate-700 rounded-xl px-5 py-3.5 text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="ваша@почта.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-[#0F1423] border border-slate-700 rounded-xl px-5 py-3.5 text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/25 mt-2">
            {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
        <div className="mt-8 text-center text-slate-400">
          {authMode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-indigo-400 hover:text-indigo-300 font-medium">
            {authMode === 'login' ? 'Создать сейчас' : 'Войти'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-800 relative opacity-80"></div>
        <div className="px-8 pb-8 relative">
          <div className="w-24 h-24 bg-[#0B0F19] rounded-full p-1.5 absolute -top-12 border border-slate-700 shadow-xl">
            <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-slate-400" />
            </div>
          </div>
          <div className="mt-16 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Пользователь</h2>
              <p className="text-slate-400">{userEmail}</p>
            </div>
          </div>
          <div className="mt-10 space-y-6">
            <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-3">Информация об аккаунте</h3>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="bg-[#0F1423] p-4 rounded-xl border border-slate-800/50">
                <p className="text-slate-500 mb-1">Статус аккаунта</p>
                <p className="font-medium text-emerald-400">Активен</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AboutPage = () => (
  <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl p-8">
      <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
        <Info className="w-7 h-7" />
      </div>
      <h2 className="text-3xl font-bold text-slate-100 mb-6">О проекте ДипломGPT</h2>
      <div className="space-y-5 text-slate-300 leading-relaxed text-base">
        <p>
          <strong className="text-white">ДипломGPT</strong> — это инновационный инструмент для студентов, позволяющий автоматизировать процесс создания академических текстов.
        </p>
        <div className="p-5 bg-[#0F1423] rounded-xl border border-slate-800 mt-8">
          <h4 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> Стек технологий:
          </h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Frontend: React, Tailwind CSS</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Backend: Node.js, Express, SSE</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> База данных: SQLite + Prisma ORM</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const ProjectView = ({ project, token, navigate, onContinueGeneration }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState({ type: '', text: '' });

  if (!project) {
    return (
      <div className="text-center py-20 animate-in fade-in">
        <p className="text-slate-400 mb-4">Проект не найден или сессия обновлена.</p>
        <button onClick={() => navigate('history')} className="text-indigo-400 hover:text-indigo-300">Вернуться к истории</button>
      </div>
    );
  }

  let parsedOutline = null;
  try { parsedOutline = typeof project.outline === 'string' ? JSON.parse(project.outline) : project.outline; } catch(e) {}

  const handleDownload = async () => {
    if (!token) return alert('Для скачивания необходимо войти в аккаунт');
    try {
      const res = await fetch(`${API_URL}/api/documents/${project.id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Ошибка при скачивании документа');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.topic.substring(0, 30)}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = async () => {
    if (!editPrompt.trim()) return;
    setIsEditing(true);
    setEditMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${API_URL}/api/edit-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ documentId: project.id, editPrompt })
      });
      const data = await res.json();
      if (res.ok) {
        setEditMessage({ type: 'success', text: data.message });
        setEditPrompt('');
      } else {
        setEditMessage({ type: 'error', text: data.error + (data.reason ? `: ${data.reason}` : '') });
      }
    } catch (err) {
      setEditMessage({ type: 'error', text: 'Ошибка соединения с сервером' });
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <button onClick={() => navigate('history')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
        <ChevronLeft className="w-5 h-5" /> Назад к истории
      </button>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{project.topic}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg font-medium">{project.workType}</span>
              <span className="text-slate-500 flex items-center gap-1"><Clock className="w-4 h-4"/> {new Date(project.createdAt).toLocaleDateString('ru-RU')}</span>
              <span className={`px-3 py-1 rounded-lg border font-medium ${
                project.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                'bg-slate-500/10 border-slate-500/20 text-slate-400'
              }`}>
                {project.status === 'completed' ? 'Готово' : 'В процессе / Ошибка'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto shrink-0">
            {project.status === 'completed' && (
              <button onClick={handleDownload} className="flex-1 md:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Скачать .docx
              </button>
            )}
            {project.yandexDiskUrl && (
              <a href={project.yandexDiskUrl} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none px-5 py-2.5 bg-[#FFCC00] hover:bg-[#F2C200] text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                <Cloud className="w-4 h-4" /> Яндекс Диск
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {project.content ? (
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-400"/> Текст работы</h3>
                <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap text-sm leading-relaxed bg-[#0F1423] p-6 rounded-2xl border border-slate-800 max-h-[600px] overflow-y-auto">
                  {project.content}
                </div>
              </div>
            ) : parsedOutline ? (
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-400"/> План работы</h3>
                <div className="bg-[#0F1423] p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-200">Введение</h4>
                    <p className="text-slate-400 text-sm mt-1">{parsedOutline.introduction}</p>
                  </div>
                  {parsedOutline.chapters && parsedOutline.chapters.map((ch, i) => (
                    <div key={i} className="pt-4 border-t border-slate-800/50">
                      <h4 className="font-bold text-indigo-300">Глава {i + 1}. {ch.title}</h4>
                      <ul className="list-disc list-inside text-slate-400 text-sm mt-2 space-y-1">
                        {ch.subsections && ch.subsections.map((sub, j) => <li key={j}>{sub}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
                {project.status !== 'completed' && (
                  <button onClick={() => onContinueGeneration(project)} className="mt-6 px-6 py-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 font-bold rounded-xl transition-all flex items-center gap-2 w-full justify-center">
                    <Play className="w-5 h-5" /> Продолжить генерацию текста
                  </button>
                )}
              </div>
            ) : (
              <p className="text-slate-500 bg-[#0F1423] p-6 rounded-2xl border border-slate-800 text-center">Содержимое отсутствует.</p>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-[#0F1423] p-6 rounded-2xl border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Edit3 className="w-5 h-5 text-amber-400"/> Внести правки (ИИ)</h3>
              <p className="text-xs text-slate-400 mb-4">Опишите, что нужно изменить в работе, и ИИ перепишет нужные части.</p>
              
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="Например: Добавь больше статистики в главу 2..."
                className="w-full bg-[#05070A] border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 h-28 resize-none mb-3"
              />
              
              {editMessage.text && (
                <div className={`p-3 rounded-xl text-xs font-medium mb-3 ${editMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {editMessage.text}
                </div>
              )}

              <button
                onClick={handleEdit}
                disabled={isEditing || !editPrompt.trim() || project.status !== 'completed'}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2 border border-slate-700"
              >
                {isEditing ? <BrainCircuit className="w-4 h-4 animate-pulse" /> : <Sparkles className="w-4 h-4" />}
                {isEditing ? 'Обработка...' : 'Применить правки'}
              </button>
              {project.status !== 'completed' && (
                 <p className="text-[10px] text-slate-500 mt-3 text-center">Доступно только для готовых работ.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Основной компонент ---

const Dashboard = () => {
  // Состояния для авторизации
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [authMode, setAuthMode] = useState('login'); // 'login' или 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [topic, setTopic] = useState('');
  const [workType, setWorkType] = useState('vkr');
  const [file, setFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');

  // Состояния для плана работы
  const [generatedOutline, setGeneratedOutline] = useState(null);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  
  // Состояния для навигации
  const [currentRoute, setCurrentRoute] = useState('welcome');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  const navigate = (route) => {
    setCurrentRoute(route);
    setIsMobileMenuOpen(false);
  };

  const handleOpenProject = (doc) => {
    setActiveProject(doc);
    navigate('project');
  };

  // Декодируем email из токена для профиля
  let userEmail = email;
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.email) userEmail = payload.email;
    }
  } catch (e) {}

  // Загрузка истории при переходе на вкладку 'history'
  useEffect(() => {
    if (token && currentRoute === 'history') {
      fetch(`${API_URL}/api/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          handleLogout();
          throw new Error('Сессия истекла. Пожалуйста, войдите заново.');
        }
        return res.json();
      })
      .then(data => setDocuments(Array.isArray(data) ? data : []))
      .catch(err => console.error("Ошибка загрузки истории:", err));
    } else if (!token && currentRoute === 'history') {
      // Гостевой режим: загружаем данные из LocalStorage
      const localDocs = JSON.parse(localStorage.getItem('guestDocuments') || '[]');
      setDocuments(localDocs);
    }
  }, [token, currentRoute]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Функция авторизации (Вход и Регистрация)
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }) // Авто-удаление случайных пробелов
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка авторизации');

      if (authMode === 'login') {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        setAuthMode('login');
        setAuthError('Регистрация успешна! Теперь войдите в аккаунт.');
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // ЭТАП 1: Получение плана работы
  const handleGenerateOutline = async (e) => {
    e.preventDefault();
    setIsGeneratingOutline(true);
    setGeneratedText('');
    setGeneratedOutline(null);
    
    try {
      const formData = new FormData();
      formData.append('topic', topic);
      formData.append('workType', workType);

      const res = await fetch(`${API_URL}/api/generate-outline`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        throw new Error('Сессия истекла. Пожалуйста, войдите заново.');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка генерации плана');

      setGeneratedOutline(data.outline);
      setCurrentDocId(data.documentId);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  // ЭТАП 2: Подтверждение плана и асинхронная генерация (Поллинг)
  const handleConfirmGeneration = async () => {
    setIsGenerating(true);
    setGeneratedText('');

    try {
      const formData = new FormData();
      formData.append('topic', topic);
      formData.append('workType', workType);
      formData.append('outline', JSON.stringify(generatedOutline));
      if (currentDocId) formData.append('documentId', currentDocId);
    
      // 1. Отправляем быстрый запрос на запуск
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        setIsGenerating(false);
        return alert('Сессия истекла. Пожалуйста, войдите заново.');
      }
      
      if (!response.ok) {
        setIsGenerating(false);
        return alert('Ошибка сервера при запуске генерации.');
      }

      const { jobId } = await response.json();

      // 2. Начинаем поллинг (опрос статуса) каждые 3 секунды
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${API_URL}/api/generation-status/${jobId}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          
          if (!statusRes.ok) return; // Игнорируем случайные сбои сети

          const data = await statusRes.json();
          setGeneratedText(data.content); // Обновляем текст на экране

          if (data.status === 'completed') {
            clearInterval(pollInterval);
            setIsGenerating(false);

            // Скачивание готового файла
            if (data.file) {
              const byteCharacters = atob(data.file);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { 
                  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
              });
              const blobUrl = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = data.fileName || 'Работа.docx';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(blobUrl);
              
              setGeneratedText((prev) => prev + '\n\n✅ Документ успешно сгенерирован и автоматически скачан!');
            }

            // Сохранение для гостя
            if (!token) {
              const newDoc = {
                id: 'guest_' + Date.now(),
                topic,
                workType,
                yandexDiskUrl: data.yandexDiskUrl,
                createdAt: new Date().toISOString(),
                status: 'completed'
              };
              const savedDocs = JSON.parse(localStorage.getItem('guestDocuments') || '[]');
              localStorage.setItem('guestDocuments', JSON.stringify([newDoc, ...savedDocs]));
            }
          } else if (data.status === 'error') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setGeneratedText((prev) => prev + '\n\n❌ Ошибка генерации.');
          }
        } catch (pollErr) {
          console.error('Ошибка при поллинге:', pollErr);
        }
      }, 3000);

    } catch (error) {
      console.error('Ошибка генерации:', error);
      setGeneratedText((prev) => prev + '\n\n[Произошла ошибка при соединении с сервером]');
      setIsGenerating(false);
    }
  };

  // Рендер компонента генерации (Вкладка "Новая работа")
  const renderGenerator = () => {
    // Если план получен, но генерация текста еще не началась, показываем окно утверждения
    if (generatedOutline && !isGenerating && !generatedText) {
      const updateOutline = (updates) => setGeneratedOutline(prev => ({ ...prev, ...updates }));
      const updateChapter = (index, updates) => setGeneratedOutline(prev => {
        const newChapters = [...prev.chapters];
        newChapters[index] = { ...newChapters[index], ...updates };
        return { ...prev, chapters: newChapters };
      });
      const updateSubsection = (chapterIndex, subIndex, text) => setGeneratedOutline(prev => {
        const newChapters = [...prev.chapters];
        const newSubsections = [...newChapters[chapterIndex].subsections];
        newSubsections[subIndex] = text;
        newChapters[chapterIndex] = { ...newChapters[chapterIndex], subsections: newSubsections };
        return { ...prev, chapters: newChapters };
      });

      return (
        <div className="max-w-3xl mx-auto relative z-10 animate-in fade-in duration-500">
          <h1 className="text-3xl font-bold mb-2">Утверждение плана работы</h1>
          <p className="text-slate-400 mb-8">Внимательно ознакомьтесь с предложенной структурой. <strong>Вы можете отредактировать любой пункт вручную.</strong> Если план вас устраивает, подтвердите его для начала генерации текста.</p>
          
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">Введение</h2>
            <textarea
              value={generatedOutline.introduction || ''}
              onChange={(e) => updateOutline({ introduction: e.target.value })}
              className="w-full bg-[#05070A] border border-slate-700 rounded-xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-indigo-500 min-h-[100px] mb-8 resize-y"
            />

            {generatedOutline.chapters && generatedOutline.chapters.map((ch, i) => (
              <div key={i} className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-indigo-400 whitespace-nowrap">Глава {i + 1}.</span>
                  <input
                    type="text"
                    value={ch.title || ''}
                    onChange={(e) => updateChapter(i, { title: e.target.value })}
                    className="flex-1 bg-[#05070A] border border-slate-700 rounded-lg px-3 py-1.5 text-indigo-400 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-3 pl-2">
                  {ch.subsections && ch.subsections.map((sub, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="text-slate-500 mt-2">•</span>
                      <textarea
                        value={sub || ''}
                        onChange={(e) => updateSubsection(i, j, e.target.value)}
                        className="flex-1 bg-[#05070A] border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-indigo-500 min-h-[60px] resize-y"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <h2 className="text-xl font-bold mb-4 mt-8 text-white">Заключение</h2>
            <textarea
              value={generatedOutline.conclusion || ''}
              onChange={(e) => updateOutline({ conclusion: e.target.value })}
              className="w-full bg-[#05070A] border border-slate-700 rounded-xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-indigo-500 min-h-[100px] mb-10 resize-y"
            />

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-800">
              <button onClick={handleConfirmGeneration} className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] text-lg">
                Утвердить и написать работу
              </button>
              <button onClick={() => setGeneratedOutline(null)} className="px-6 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-xl transition-colors">
                Изменить тему
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Иначе показываем стартовую форму ввода темы
    return (
    <div className="max-w-3xl mx-auto relative z-10 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-2">Создать новый документ</h1>
      <p className="text-slate-400 mb-10">Заполните параметры ниже, и алгоритм подготовит для вас структуру и первый черновик работы.</p>

        <form onSubmit={handleGenerateOutline} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl">
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Тема работы</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              placeholder="Например: Влияние нейросетей на глобальную экономику..."
              className="w-full bg-[#0F1423] border border-slate-700 rounded-xl px-5 py-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-600 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Тип работы</label>
            <div className="relative">
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="w-full bg-[#0F1423] border border-slate-700 rounded-xl px-5 py-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none shadow-inner cursor-pointer"
              >
                <option value="coursework">Курсовая работа</option>
                <option value="vkr">Дипломная работа (ВКР)</option>
                <option value="essay">Реферат / Эссе</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="opacity-70">
            <label className="block text-sm font-medium text-slate-400 mb-2">Методичка вуза (PDF) — <span className="text-slate-500">Опционально</span></label>
            <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-slate-800 border-dashed rounded-2xl relative bg-slate-900/30 cursor-not-allowed">
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B0F19]/60 backdrop-blur-[2px] rounded-2xl">
                <span className="bg-slate-800 text-indigo-300 text-sm font-bold px-4 py-1.5 rounded-full border border-indigo-500/30 shadow-lg">
                  В разработке
                </span>
              </div>
              <div className="space-y-2 text-center">
                <Upload className="mx-auto h-10 w-10 text-slate-600" />
                <div className="flex text-sm text-slate-500 justify-center gap-1">
                  <label className="relative cursor-not-allowed rounded-md font-semibold text-slate-500">
                    <span>Выберите файл</span>
                    <input type="file" className="sr-only" disabled accept=".pdf" />
                  </label>
                  <p>или перетащите его сюда</p>
                </div>
                <p className="text-xs text-slate-600">Допускаются файлы PDF до 10 МБ</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <button 
              type="submit" 
                disabled={isGeneratingOutline}
                className={`w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-3 text-lg ${isGeneratingOutline ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]'}`}
            >
                {isGeneratingOutline ? <BrainCircuit className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5 fill-current" />}
                {isGeneratingOutline ? 'Составление плана...' : 'Составить структуру'}
            </button>
          </div>
        </div>
      </form>

      {(isGenerating || generatedText) && (
        <div className="mt-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4 relative z-10">
            <BrainCircuit className={`w-6 h-6 ${isGenerating ? 'text-indigo-400 animate-pulse' : 'text-green-400'}`} />
            <h2 className="text-xl font-bold">
              {isGenerating ? 'Система формирует текст...' : 'Генерация завершена'}
            </h2>
          </div>
          <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap text-base leading-relaxed relative z-10">
            {generatedText || 'Подключение к потоку...'}
            {isGenerating && <span className="inline-block w-2 h-5 ml-1 bg-indigo-400 animate-pulse align-middle"></span>}
          </div>
        </div>
      )}
    </div>
    );
  };

  const handleContinueGeneration = (doc) => {
    setTopic(doc.topic);
    setWorkType(doc.workType);
    setGeneratedOutline(JSON.parse(doc.outline));
    setCurrentDocId(doc.id);
    setCurrentRoute('generator');
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
      case 'generator': return renderGenerator();
      case 'history': return <HistoryPage documents={documents} token={token} navigate={navigate} onOpenProject={handleOpenProject} />;
      case 'project': return <ProjectView project={activeProject} token={token} navigate={navigate} onContinueGeneration={handleContinueGeneration} />;
      case 'profile': return <ProfilePage token={token} userEmail={userEmail} authMode={authMode} setAuthMode={setAuthMode} email={email} setEmail={setEmail} password={password} setPassword={setPassword} handleAuth={handleAuth} authError={authError} />;
      case 'about': return <AboutPage />;
      default: return <WelcomePage navigate={navigate} />;
    }
  };

  // Главный интерфейс дашборда после авторизации
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
          {token ? (
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
              Выйти
            </button>
          ) : (
            <button onClick={() => navigate('profile')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-indigo-400 hover:bg-indigo-500/10 transition-colors">
              <LogIn className="w-5 h-5" />
              Войти
            </button>
          )}
        </div>
      </aside>

      {/* Мобильная шапка (Header) */}
      <header className="md:hidden bg-[#05070A]/90 backdrop-blur-md border-b border-slate-800 px-4 py-4 flex items-center justify-between fixed top-0 w-full z-30">
        <div className="flex items-center gap-2 font-bold text-lg text-white">
          <BrainCircuit className="w-6 h-6 text-indigo-500" />
          ДипломGPT
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[65px] z-20 bg-[#0B0F19] border-b border-slate-800 animate-in slide-in-from-top-2">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => navigate(item.id)} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium transition-colors ${currentRoute === item.id ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                <item.icon className={`w-5 h-5 ${currentRoute === item.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            ))}
            {token ? (
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-4">
                <LogOut className="w-5 h-5" /> Выйти
              </button>
            ) : (
              <button onClick={() => { setIsMobileMenuOpen(false); navigate('profile'); }} className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-indigo-400 hover:bg-indigo-500/10 transition-colors mt-4">
                <LogIn className="w-5 h-5" /> Войти
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Основной контент */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto w-full max-w-7xl mx-auto pt-24 md:pt-8 relative z-10">
        {renderPage()}
      </main>

    </div>
  );
};

export default Dashboard;