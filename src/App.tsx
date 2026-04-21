import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus,
  ArrowRight,
  RefreshCw,
  Globe,
  X,
  Sparkles,
  Loader2,
  Maximize2,
  Settings,
  Pin,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutGrid,
  Flower2,
  TrendingUp,
  Calendar,
  PiggyBank
} from 'lucide-react';
import { cn } from './lib/utils';
import { AppId, AppConfig } from './types';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let aiInstance: GoogleGenAI | null = null;
const getAI = () => {
  if (!aiInstance && GEMINI_API_KEY && GEMINI_API_KEY !== 'undefined') {
    aiInstance = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return aiInstance;
};

function RefreshingLogo3D({ size = 18, className }: { size?: number, className?: string }) {
  return (
    <div className={cn("relative perspective-1000 group", className)}>
      <motion.div 
        animate={{ 
          rotateY: [0, 20, 0, -20, 0],
          rotateX: [0, -10, 0, 10, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="w-full h-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 rounded-xl flex items-center justify-center shadow-[0_10px_30px_rgba(79,70,229,0.4),_inset_0_2px_4px_rgba(255,255,255,0.3)] border border-white/20 transform-gpu preserve-3d"
      >
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
           className="relative z-10"
        >
          <RefreshCw size={size} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
        </motion.div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/5 rounded-xl"></div>
        
        {/* Floating Sparks */}
        <Sparkles size={size/1.5} className="absolute -top-1 -right-1 text-indigo-200 animate-pulse drop-shadow-[0_0_5px_rgba(199,210,254,0.8)]" />
        
        {/* 3D Depth layers */}
        <div className="absolute inset-0 translate-z-[-2px] bg-indigo-900/50 rounded-xl blur-[1px]"></div>
      </motion.div>
    </div>
  );
}

function getAppIcon(name: string, size: number = 20) {
  const n = name.toLowerCase();
  if (n.includes('habitrac') || n.includes('meditation')) return <Flower2 size={size} />;
  if (n.includes('yield bridge') || n.includes('investment') || n.includes('yeild')) return <TrendingUp size={size} />;
  if (n.includes('timetable') || n.includes('schedule') || n.includes('timetabel')) return <Calendar size={size} />;
  if (n.includes('retire wise') || n.includes('retirement') || n.includes('retire')) return <PiggyBank size={size} />;
  return null;
}

export default function App() {
  const [activeAppId, setActiveAppId] = useState<AppId>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userApps, setUserApps] = useState<AppConfig[]>(() => {
    const saved = localStorage.getItem('namma_app_kadai_apps') || localStorage.getItem('livesmart_apps');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse apps", e);
      }
    }
    
    // Default apps if none found
    return [
      {
        id: '1',
        name: 'Gemini AI',
        url: 'https://gemini.google.com',
        description: 'Google AI companion for enhanced productivity and creative assistance.',
        color: 'bg-indigo-600',
        pinned: true
      },
      {
        id: '2',
        name: 'YouTube',
        url: 'https://www.youtube.com',
        description: 'Access the global collection of video content and educational resources.',
        color: 'bg-rose-600',
        pinned: true
      },
      {
        id: '3',
        name: 'ChatGPT',
        url: 'https://chatgpt.com',
        description: 'Advanced conversational AI by OpenAI for diverse text-based tasks.',
        color: 'bg-emerald-600',
        pinned: true
      },
      {
        id: '4',
        name: 'Google',
        url: 'https://www.google.com',
        description: 'The primary gateway for information retrieval and digital exploration.',
        color: 'bg-blue-600',
        pinned: true
      }
    ];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [appToEdit, setAppToEdit] = useState<AppConfig | null>(null);

  useEffect(() => {
    localStorage.setItem('namma_app_kadai_apps', JSON.stringify(userApps));
  }, [userApps]);

  const addApp = (newApp: Omit<AppConfig, 'id'>) => {
    const app: AppConfig = {
      ...newApp,
      id: Date.now().toString()
    };
    setUserApps([...userApps, app]);
    setShowAddModal(false);
  };

  const updateApp = (updatedApp: AppConfig) => {
    setUserApps(userApps.map(a => a.id === updatedApp.id ? updatedApp : a));
    setAppToEdit(null);
  };

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserApps(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
  };

  const sortedApps = useMemo(() => {
    return [...userApps].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [userApps]);

  const activeApp = userApps.find(a => a.id === activeAppId);

  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-slate-200 selection:bg-indigo-500 selection:text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "border-r border-slate-800 flex flex-col transition-all duration-300 shrink-0 glass z-20",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <RefreshingLogo3D size={18} className="w-9 h-9" />
          {sidebarOpen && <h1 className="font-bold tracking-tight text-lg text-white">Namma App Kadai</h1>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className={cn("text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 px-2", !sidebarOpen && "hidden")}>Navigation</div>
          <NavItem 
            id="home" 
            label="My Library" 
            icon={<LayoutGrid size={20} />} 
            active={activeAppId === 'home'} 
            onClick={() => setActiveAppId('home')} 
            collapsed={!sidebarOpen}
          />
          
          <div className="pt-8">
            <div className="flex items-center justify-between px-2 mb-4">
              {sidebarOpen && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Apps</p>}
              {sidebarOpen && (
                <button onClick={() => setShowAddModal(true)} className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-white">
                  <Plus size={14} />
                </button>
              )}
            </div>
            <div className="space-y-1">
              {sortedApps.map(app => {
                const navIcon = getAppIcon(app.name, 20);
                return (
                  <NavItem 
                    key={app.id}
                    id={app.id} 
                    label={app.name} 
                    icon={navIcon || <Globe size={20} />} 
                    active={activeAppId === app.id} 
                    onClick={() => setActiveAppId(app.id)} 
                    collapsed={!sidebarOpen}
                  />
                );
              })}
              {userApps.length === 0 && sidebarOpen && (
                <div className="px-2 py-4 border border-dashed border-slate-800 rounded-lg text-center">
                  <p className="text-[10px] text-slate-600 uppercase font-mono italic">No links stored</p>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button 
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-slate-800/30"
           >
             {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
             {sidebarOpen && <span className="text-xs font-medium uppercase tracking-widest">Collapse</span>}
           </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <div className="text-sm font-bold text-white tracking-widest uppercase opacity-70">
              Namma App Kadai <span className="text-slate-500 font-normal ml-2 lowercase">/ {activeAppId === 'home' ? 'my_applications' : activeApp?.name.toLowerCase()}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[10px] font-black shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all uppercase tracking-[0.2em] hover:-translate-y-0.5 active:translate-y-0"
            >
              Add App
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAppId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full w-full"
            >
              {activeAppId === 'home' ? (
                <HomeDashboard 
                  apps={sortedApps} 
                  onLaunch={setActiveAppId} 
                  onAdd={() => setShowAddModal(true)} 
                  onEdit={(app) => setAppToEdit(app)}
                  onTogglePin={togglePin}
                />
              ) : (
                <div className="w-full h-full bg-slate-900">
                  {activeApp ? (
                    <iframe 
                      src={activeApp.url} 
                      className="w-full h-full border-none"
                      title={activeApp.name}
                      referrerPolicy="no-referrer"
                      sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-scripts allow-top-navigation-by-user-activation allow-same-origin"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-700 font-mono text-xs italic">RESOURCE_NOT_FOUND</div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modal Overlay Components */}
        {(showAddModal || appToEdit) && (
          <AppFormModal 
            editApp={appToEdit || undefined}
            onClose={() => {
              setShowAddModal(false);
              setAppToEdit(null);
            }}
            onSave={(appData) => {
              if (appToEdit) {
                updateApp({ ...appToEdit, ...appData });
              } else {
                addApp(appData);
              }
            }}
          />
        )}
      </main>
    </div>
  );
}

function NavItem({ id, label, icon, active, onClick, collapsed }: { id: string, label: string, icon: React.ReactNode, active?: boolean, onClick: () => void, collapsed: boolean }) {
  return (
    <div className="relative group px-1">
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 relative overflow-hidden",
          active 
            ? "bg-slate-800 shadow-lg border border-slate-700/50 text-white" 
            : "text-slate-400 hover:text-white hover:bg-slate-800/40"
        )}
      >
        {active && (
          <motion.div 
            layoutId="nav-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-indigo-500 rounded-r-full"
          />
        )}
        <div className={cn("shrink-0", active ? "text-indigo-400 animate-pulse" : "group-hover:scale-110 group-hover:text-slate-300 transition-all")}>
          {icon}
        </div>
        {!collapsed && <span className="text-[13px] font-medium whitespace-nowrap truncate pr-6">{label}</span>}
      </button>
    </div>
  );
}

function HomeDashboard({ apps, onLaunch, onAdd, onEdit, onTogglePin }: { apps: AppConfig[], onLaunch: (id: string) => void, onAdd: () => void, onEdit: (app: AppConfig) => void, onTogglePin: (id: string, e: React.MouseEvent) => void }) {
  return (
    <div className="h-full p-8 md:p-12 overflow-y-auto custom-scrollbar space-y-16 bg-[#0f172a] relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[120px] rounded-full translate-y-1/3 -translate-x-1/3"></div>
      
      <header className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4 leading-tight uppercase">
            Namma App<br/>Kadai
          </h2>
          <div className="h-1 w-20 bg-indigo-600 rounded-full mb-6"></div>
          <p className="text-slate-400 text-base max-w-lg">
            Manage all your favorite web applications in a single, beautiful workspace.
          </p>
        </motion.div>
      </header>

      <section className="relative z-10">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
          <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Integrations</h3>
          <p className="text-[10px] font-mono text-slate-500">{apps.length} Total</p>
        </div>
        
        <LayoutGroup>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.08 } }
            }}
          >
            <motion.button
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 }
              }}
              onClick={onAdd}
              className="group border-dashed border-2 border-slate-800 hover:border-indigo-500/50 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all bg-slate-900/20 aspect-[1/1] relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-full border border-slate-800 flex items-center justify-center text-slate-700 group-hover:text-white group-hover:border-indigo-500 group-hover:bg-indigo-600 transition-all">
                <Plus size={28} />
              </div>
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Add App</div>
            </motion.button>

            {apps.map(app => {
              const domainFavicon = `https://www.google.com/s2/favicons?domain=${new URL(app.url).hostname}&sz=64`;
              const appIcon = getAppIcon(app.name, 32);

              return (
                <motion.div
                  layout
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  key={app.id}
                  className="group relative"
                >
                  <motion.div 
                    className="h-[320px] w-full relative overflow-hidden flex flex-col rounded-[28px] border border-white/5 bg-slate-900/40 backdrop-blur-xl group-hover:border-white/10 transition-all shadow-xl"
                    whileHover={{ y: -5 }}
                  >
                    <div className="p-5 flex-1 flex flex-col relative z-20">
                      <div className="flex justify-between items-start mb-4">
                        <div className={cn("w-14 h-14 rounded-[20px] flex items-center justify-center text-white font-bold p-2.5 relative shadow-lg transform-gpu preserve-3d group-hover:rotate-y-12 transition-transform", app.color)}>
                          <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          {app.faviconUrl ? (
                            <img src={app.faviconUrl} alt="" className="w-full h-full object-contain relative z-10 drop-shadow-md" referrerPolicy="no-referrer" />
                          ) : appIcon ? (
                            <div className="relative z-10 scale-110 drop-shadow-md">
                              {appIcon}
                            </div>
                          ) : (
                            <img src={domainFavicon} alt="" className="w-full h-full object-contain relative z-10 opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                          )}
                        </div>
                        <div className="flex gap-1.5 translate-x-1">
                          <button 
                            onClick={(e) => onTogglePin(app.id, e)}
                            className={cn(
                              "p-2 rounded-xl transition-all border border-white/5",
                              app.pinned 
                                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" 
                                : "bg-white/5 text-slate-500 hover:text-indigo-400 hover:bg-white/10"
                            )}
                            title={app.pinned ? "Unpin icon" : "Pin icon"}
                          >
                            <Pin size={12} className={cn(app.pinned && "fill-current")} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(app); }}
                            className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-indigo-400 transition-all hover:bg-white/10 border border-white/5"
                          >
                            <Settings size={12} className="group-hover:rotate-45 transition-transform" />
                          </button>
                        </div>
                      </div>
                      
                      <h4 className="font-black text-white text-xl tracking-tight truncate mb-0.5">
                        {app.name}
                      </h4>
                      <p className="text-[9px] text-slate-500 font-mono mb-3 opacity-60">{new URL(app.url).hostname}</p>
                      
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-3 font-medium italic opacity-80 group-hover:opacity-100 italic">
                        "{app.description || 'No description provided.'}"
                      </p>
                    </div>

                    <div className="p-5 relative z-20">
                      <button 
                        onClick={() => onLaunch(app.id)}
                        className={cn(
                          "w-full text-white text-[10px] font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider",
                          app.color.replace('bg-', 'hover:bg-').includes('indigo') ? 'bg-indigo-600 hover:bg-indigo-500' : app.color
                        )}
                      >
                        Launch
                        <div className="opacity-80">
                          {getAppIcon(app.name, 12) || <ArrowRight size={12} />}
                        </div>
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </LayoutGroup>
      </section>

      {/* Overview Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-20 relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] p-10 flex flex-col border border-white/5 hover:border-white/10 transition-colors group">
           <div className="text-[12px] text-indigo-400 uppercase font-black tracking-[0.3em] mb-8 group-hover:translate-x-2 transition-transform">Library_Insights</div>
           <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Connected Assets</span>
                <span className="text-5xl font-black text-white italic">{apps.length}</span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((apps.length / 12) * 100, 100)}%` }}
                  className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-600 font-black">
                <span>00_APPS</span>
                <span>MAX_SLOTS: 12</span>
              </div>
           </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] p-10 flex flex-col border border-white/5 justify-center items-center text-center">
           <RefreshingLogo3D size={48} className="w-24 h-24 mb-6" />
           <p className="text-xl text-slate-300 font-black uppercase tracking-tighter leading-tight italic">
             "Centralized Access.<br/>Seamless Integration."
           </p>
        </div>
      </section>
    </div>
  );
}

function AppFormModal({ editApp, onClose, onSave }: { editApp?: AppConfig, onClose: () => void, onSave: (app: Omit<AppConfig, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    name: editApp?.name || '',
    url: editApp?.url || '',
    faviconUrl: editApp?.faviconUrl || '',
    description: editApp?.description || '',
    color: editApp?.color || 'bg-indigo-500'
  });
  const [generating, setGenerating] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const colors = [
    'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 
    'bg-cyan-500', 'bg-zinc-500', 'bg-violet-600', 'bg-fuchsia-500', 
    'bg-orange-500', 'bg-lime-500'
  ];

  const getPreviewFavicon = () => {
    if (formData.faviconUrl) return formData.faviconUrl;
    if (!formData.url) return null;
    try {
      const urlToParse = formData.url.startsWith('http') ? formData.url : `https://${formData.url}`;
      const hostname = new URL(urlToParse).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch {
      return null;
    }
  };

  const previewFavicon = getPreviewFavicon();

  useEffect(() => {
    setFaviconError(false);
  }, [formData.url, formData.faviconUrl]);

  const generateDescription = async () => {
    if (!formData.name || !formData.url) return;
    const ai = getAI();
    if (!ai) {
      console.warn("AI integration skipped: GEMINI_API_KEY is not configured.");
      return;
    }
    setGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a professional 1-sentence description for a web application named "${formData.name}". Tone: high-end, clean, concise. Do not use quotes.`,
      });
      if (response.text) {
        setFormData(prev => ({ ...prev, description: response.text.trim() }));
      }
    } catch (err) {
      console.error("AI Generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.url) return;
    
    let url = formData.url;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    
    onSave({ ...formData, url });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-white/5 relative w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-base font-black text-white uppercase tracking-widest">{editApp ? 'Edit Application' : 'Add Application'}</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-full">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-lg transition-colors transform-gpu preserve-3d animate-float", formData.color)}>
              {formData.faviconUrl && !faviconError ? (
                <img 
                  src={formData.faviconUrl} 
                  alt="" 
                  className="w-full h-full object-contain p-2 drop-shadow-md" 
                  onError={() => setFaviconError(true)}
                  referrerPolicy="no-referrer"
                />
              ) : getAppIcon(formData.name) ? (
                <div className="scale-125 drop-shadow-md">
                  {getAppIcon(formData.name, 32)}
                </div>
              ) : previewFavicon && !faviconError ? (
                <img 
                  src={previewFavicon} 
                  alt="" 
                  className="w-full h-full object-contain p-2 opacity-80" 
                  onError={() => setFaviconError(true)}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Globe size={32} />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] text-white font-black uppercase tracking-widest leading-none mb-1">Visual Icon</h4>
              <p className="text-[9px] text-slate-500 font-mono">Auto-generated from your URL.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">App Name</label>
              <input 
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="My App"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">URL</label>
              <input 
                type="text"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="app.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Favicon URL (Optional)</label>
            <input 
              type="text"
              value={formData.faviconUrl}
              onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5 text-right">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
              <button 
                type="button"
                disabled={generating || !formData.name}
                onClick={generateDescription}
                className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1 disabled:opacity-30"
              >
                {generating ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Auto-Magic
              </button>
            </div>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all resize-none h-20"
              placeholder="A brief text about your app..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Visual Marker</label>
            <div className="flex flex-wrap gap-2.5 ml-1">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all",
                    c,
                    formData.color === c ? "ring-2 ring-indigo-500 scale-110 shadow-lg" : "opacity-40 hover:opacity-100"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl hover:bg-indigo-500 transition-all uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-600/20"
            >
              {editApp ? 'Save Changes' : 'Add to Collection'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
