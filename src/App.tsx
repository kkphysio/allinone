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
  PiggyBank,
  Search,
  Filter,
  Tag,
  Trash2
} from 'lucide-react';
import { cn } from './lib/utils';
import { AppId, AppConfig } from './types';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

function getSafeHostname(url: string) {
  try {
    const u = url.startsWith('http') ? url : `https://${url}`;
    return new URL(u).hostname;
  } catch {
    return url;
  }
}

export default function App() {
  const [activeAppId, setActiveAppId] = useState<AppId>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userApps, setUserApps] = useState<AppConfig[]>(() => {
    const saved = localStorage.getItem('namma_app_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse apps", e);
      }
    }
    
    return [
      {
        id: '1',
        name: 'Habitrac',
        url: 'https://habitrac.example.com',
        description: 'Guided meditation and habit tracking for mindfulness and consistency.',
        color: 'bg-indigo-600',
        pinned: true,
        category: 'health'
      },
      {
        id: '2',
        name: 'Yield Bridge',
        url: 'https://yield-bridge.example.com',
        description: 'Advanced financial monitoring and smart investment bridge.',
        color: 'bg-emerald-600',
        pinned: true,
        category: 'finance'
      },
      {
        id: '3',
        name: 'Timetabel Chart',
        url: 'https://timeline.example.com',
        description: 'Optimized scheduling and timetable management interface.',
        color: 'bg-amber-600',
        pinned: true,
        category: 'productivity'
      },
      {
        id: '4',
        name: 'Retire Wise Tool',
        url: 'https://retirewise.example.com',
        description: 'Comprehensive retirement planning and wealth security companion.',
        color: 'bg-rose-600',
        pinned: true,
        category: 'finance'
      }
    ];
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [appToEdit, setAppToEdit] = useState<AppConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | AppConfig['category']>('all');

  useEffect(() => {
    localStorage.setItem('namma_app_v2', JSON.stringify(userApps));
  }, [userApps]);

  const appsToShow = useMemo(() => {
    let filtered = userApps;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(a => a.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(q) || 
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }
    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [userApps, searchQuery, activeCategory]);

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
    setShowAddModal(false);
  };

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserApps(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
  };

  const deleteApp = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}"?`)) {
      setUserApps(prev => prev.filter(a => a.id !== id));
    }
  };

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
            label="App Library" 
            icon={<LayoutGrid size={20} />} 
            active={activeAppId === 'home'} 
            onClick={() => setActiveAppId('home')} 
            collapsed={!sidebarOpen}
          />
          
          <div className="pt-8">
            <div className="flex items-center justify-between px-2 mb-4">
              {sidebarOpen && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Saved Apps</p>}
              {sidebarOpen && (
                <button onClick={() => setShowAddModal(true)} className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-white">
                  <Plus size={14} />
                </button>
              )}
            </div>
            <div className="space-y-1">
              {userApps.map(app => {
                const navIcon = getAppIcon(app.name, 20);
                return (
                  <NavItem 
                    key={app.id}
                    id={app.id} 
                    label={app.name} 
                    icon={navIcon || <Globe size={20} />} 
                    active={false} 
                    onClick={() => window.open(app.url, '_blank')} 
                    collapsed={!sidebarOpen}
                  />
                );
              })}
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
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <div className="hidden md:block text-sm font-bold text-white tracking-widest uppercase opacity-70 shrink-0">
              HUB / <span className="text-slate-500 font-normal lowercase">library</span>
            </div>
            
            <div className="relative max-w-md w-full group">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text"
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700 font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 ml-6">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all uppercase tracking-[0.2em] hover:-translate-y-0.5"
            >
              Add App
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <motion.div
            key="home"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full overflow-y-auto px-8 py-8 custom-scrollbar bg-[#0f172a]"
          >
            {/* Visual Header */}
            <div className="mb-12">
               <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Centralized HUB</h2>
               <p className="text-slate-500 text-sm font-medium">Manage and access all your internal tools from a single interface.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-10 pb-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest mr-4">
                <Filter size={12} /> Filter:
              </div>
              {(['all', 'tools', 'productivity', 'health', 'finance', 'other'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all whitespace-nowrap border shrink-0",
                    activeCategory === cat 
                      ? "bg-indigo-500 text-white border-indigo-400 shadow-[0_5px_15px_rgba(79,70,229,0.4)]" 
                      : "bg-slate-900/50 text-slate-500 border-white/5 hover:border-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* App Grid */}
            <LayoutGroup>
              <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 mb-20">
                <motion.button
                  layout
                  onClick={() => setShowAddModal(true)}
                  className="group border-dashed border-2 border-slate-800 hover:border-indigo-500/50 rounded-[32px] flex flex-col items-center justify-center gap-4 transition-all bg-slate-900/10 min-h-[320px] relative overflow-hidden"
                >
                  <div className="w-16 h-16 rounded-full border border-slate-800 flex items-center justify-center text-slate-700 group-hover:text-white group-hover:border-indigo-500 group-hover:bg-indigo-600 transition-all shadow-xl">
                    <Plus size={32} />
                  </div>
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Connect New Project</div>
                </motion.button>

                {appsToShow.map(app => {
                  const hostname = getSafeHostname(app.url);
                  const domainFavicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
                  const appIcon = getAppIcon(app.name, 32);

                  return (
                    <motion.div layout key={app.id} className="group relative">
                      <div className="h-[320px] w-full relative overflow-hidden flex flex-col rounded-[32px] border border-white/5 bg-slate-900/40 backdrop-blur-xl group-hover:border-indigo-500/20 transition-all shadow-xl hover:-translate-y-2 duration-300 cursor-pointer" onClick={() => window.open(app.url.startsWith('http') ? app.url : `https://${app.url}`, '_blank')}>
                        {/* Category Badge */}
                        <div className="absolute top-6 left-6 z-30">
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                            <Tag size={8} /> {app.category}
                          </div>
                        </div>

                        <div className="p-7 flex-1 flex flex-col relative z-20 mt-2">
                           <div className="flex justify-between items-start mb-6">
                             <div className={cn("w-14 h-14 rounded-[22px] flex items-center justify-center text-white font-bold p-2.5 relative shadow-lg transform-gpu preserve-3d group-hover:rotate-y-12 transition-transform", app.color)}>
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
                             <div className="flex gap-2">
                               <button 
                                 onClick={(e) => togglePin(app.id, e)}
                                 className={cn(
                                   "p-2.5 rounded-xl transition-all border z-30",
                                   app.pinned 
                                     ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" 
                                     : "bg-white/5 text-slate-500 hover:text-indigo-400 hover:bg-white/10 border-white/5"
                                 )}
                               >
                                 <Pin size={12} className={cn(app.pinned && "fill-current")} />
                               </button>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setAppToEdit(app); setShowAddModal(true); }}
                                 className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-indigo-400 transition-all hover:bg-white/10 border border-white/5 z-30"
                               >
                                 <Settings size={12} />
                               </button>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); deleteApp(app.id, app.name); }}
                                 className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-rose-400 transition-all hover:bg-rose-500/10 border border-white/5 z-30"
                               >
                                 <Trash2 size={12} />
                               </button>
                             </div>
                           </div>
                           
                           <h4 className="font-black text-white text-xl tracking-tight truncate mb-1">
                             {app.name}
                           </h4>
                           <p className="text-[10px] text-slate-500 font-mono mb-4 flex items-center gap-2">
                             <Globe size={10} /> {hostname}
                           </p>
                           
                           <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 font-medium opacity-80 group-hover:opacity-100 italic">
                             "{app.description || 'Seamless integration for your digital workflow.'}"
                           </p>
                        </div>

                        <div className="p-7 relative z-20">
                          <div
                            className={cn(
                              "w-full text-white text-[10px] font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-[0.15em] shadow-lg",
                              app.color.replace('bg-', 'hover:bg-').includes('indigo') ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-800 hover:bg-slate-700'
                            )}
                          >
                            Launch Tool
                            {getAppIcon(app.name, 14) || <ArrowRight size={14} />}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </LayoutGroup>

            {/* Footer Insight Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20 border-t border-white/5 pt-16">
              <div className="bg-slate-900/40 backdrop-blur-xl rounded-[40px] p-10 flex flex-col border border-white/5 hover:border-white/10 transition-all group">
                 <div className="text-[12px] text-indigo-400 uppercase font-black tracking-[0.3em] mb-10 group-hover:translate-x-2 transition-transform flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,1)]"></div>
                    Library_Metrics
                 </div>
                 <div className="space-y-8">
                    <div className="flex justify-between items-end">
                      <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Active Connections</span>
                      <span className="text-6xl font-black text-white italic">{userApps.length}</span>
                    </div>
                    <div className="h-3 bg-black/40 rounded-full overflow-hidden p-1 border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((userApps.length / 12) * 100, 100)}%` }}
                        className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.6)]" 
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-slate-600 font-black">
                      <span>USED: {userApps.length}</span>
                      <span>HARD_LIM: 12</span>
                    </div>
                 </div>
              </div>
              <div className="bg-slate-900/40 backdrop-blur-xl rounded-[40px] p-10 flex flex-col border border-white/5 justify-center items-center text-center group">
                 <div className="relative">
                    <RefreshingLogo3D size={48} className="w-24 h-24 mb-10 group-hover:scale-110 transition-transform duration-500" />
                 </div>
                 <p className="text-xl text-slate-300 font-black uppercase tracking-tighter leading-tight italic">
                   "Organize Your Digital Universe."
                 </p>
              </div>
            </section>
          </motion.div>
        </div>
      </main>

      {/* Modal Overlay */}
      {(showAddModal || appToEdit) && (
        <AppFormModal 
          editApp={appToEdit || undefined}
          onClose={() => { setShowAddModal(false); setAppToEdit(null); }}
          onSave={(data) => appToEdit ? updateApp({ ...appToEdit, ...data }) : addApp(data)}
        />
      )}
    </div>
  );
}

function NavItem({ id, label, icon, active, onClick, collapsed }: { id: string, label: string, icon: React.ReactNode, active?: boolean, onClick: () => void, collapsed: boolean }) {
  return (
    <div className="relative group px-1">
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative",
          active ? "bg-slate-800 shadow-md border border-slate-700/50 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/40"
        )}
      >
        {active && <motion.div layoutId="nav-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-indigo-500 rounded-r-full" />}
        <div className={cn("shrink-0", active ? "text-indigo-400" : "group-hover:text-slate-300")}>{icon}</div>
        {!collapsed && <span className="text-[13px] font-medium whitespace-nowrap truncate">{label}</span>}
      </button>
    </div>
  );
}

function AppFormModal({ editApp, onClose, onSave }: { editApp?: AppConfig, onClose: () => void, onSave: (app: Omit<AppConfig, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    name: editApp?.name || '',
    url: editApp?.url || '',
    faviconUrl: editApp?.faviconUrl || '',
    description: editApp?.description || '',
    color: editApp?.color || 'bg-indigo-500',
    category: editApp?.category || 'other' as AppConfig['category']
  });
  const [generating, setGenerating] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-cyan-600', 'bg-violet-600', 'bg-fuchsia-600', 'bg-orange-600'];

  const previewFavicon = useMemo(() => {
    if (formData.faviconUrl) return formData.faviconUrl;
    if (!formData.url) return null;
    try {
      const urlToParse = formData.url.startsWith('http') ? formData.url : `https://${formData.url}`;
      return `https://www.google.com/s2/favicons?domain=${new URL(urlToParse).hostname}&sz=128`;
    } catch { return null; }
  }, [formData.url, formData.faviconUrl]);

  const generateDescription = async () => {
    if (!formData.name) return;
    setGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `One short sentence for a web app named "${formData.name}". Tone: professional, sleek.`,
      });
      if (response.text) setFormData(prev => ({ ...prev, description: response.text.trim().replace(/^"|"$/g, '') }));
    } catch (err) { console.error(err); } 
    finally { setGenerating(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1e293b] border border-white/5 relative w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{editApp ? 'Update Integration' : 'New Integration'}</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white bg-white/5 rounded-full"><X size={18} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-5 p-5 bg-white/5 rounded-3xl border border-white/5 group">
            <div className={cn("w-20 h-20 rounded-[24px] flex items-center justify-center text-white shrink-0 shadow-2xl transition-all group-hover:scale-105", formData.color)}>
              {previewFavicon && !faviconError ? (
                <img src={previewFavicon} alt="" className="w-full h-full object-contain p-3 drop-shadow-lg" onError={() => setFaviconError(true)} referrerPolicy="no-referrer" />
              ) : getAppIcon(formData.name) ? (
                <div className="scale-125">{getAppIcon(formData.name, 36)}</div>
              ) : <Globe size={40} />}
            </div>
            <div>
              <h4 className="text-[10px] text-white font-black uppercase tracking-wider mb-1">Visual Identity</h4>
              <p className="text-[9px] text-slate-500 font-mono tracking-tight leading-normal">System automatically identifies the best asset for your URL.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Label</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target URL</label>
                <input required value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all font-mono" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Classification</label>
              <div className="flex flex-wrap gap-2">
                {(['tools', 'productivity', 'health', 'finance', 'other'] as const).map(cat => (
                  <button key={cat} type="button" onClick={() => setFormData({ ...formData, category: cat })} className={cn("px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all", formData.category === cat ? "bg-indigo-600 border-indigo-400 text-white" : "bg-slate-950/50 border-white/5 text-slate-500 hover:border-white/10")}>{cat}</button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Metadata</label>
                <button type="button" disabled={generating || !formData.name} onClick={generateDescription} className="text-[9px] text-indigo-400 font-black uppercase tracking-widest flex items-center gap-1.5 disabled:opacity-20">{generating ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Auto_Desc</button>
              </div>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white h-24 resize-none focus:outline-none focus:border-indigo-500 transition-all italic" />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Brand Hue</label>
              <div className="flex flex-wrap gap-3 p-1">
                {colors.map(c => <button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })} className={cn("w-8 h-8 rounded-full border-2 transition-transform hover:scale-110", c, formData.color === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100")} />)}
              </div>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] py-5 rounded-[24px] text-xs shadow-xl transition-all active:scale-[0.98]">{editApp ? 'Update Node' : 'Initialize Connection'}</button>
        </form>
      </motion.div>
    </div>
  );
}
