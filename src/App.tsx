import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Plus,
  ArrowRight,
  Trash2,
  Settings,
  Zap,
  Globe,
  ExternalLink,
  X,
  AlertCircle,
  Sparkles,
  Loader2,
  Maximize2
} from 'lucide-react';
import { cn } from './lib/utils';
import { AppId, AppConfig } from './types';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [activeAppId, setActiveAppId] = useState<AppId>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userApps, setUserApps] = useState<AppConfig[]>(() => {
    const saved = localStorage.getItem('livesmart_apps');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('livesmart_apps', JSON.stringify(userApps));
  }, [userApps]);

  const addApp = (newApp: Omit<AppConfig, 'id'>) => {
    const app: AppConfig = {
      ...newApp,
      id: Date.now().toString()
    };
    setUserApps([...userApps, app]);
    setShowAddModal(false);
  };

  const deleteApp = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setUserApps(userApps.filter(a => a.id !== id));
    if (activeAppId === id) setActiveAppId('home');
    setAppToDelete(null);
  };

  const activeApp = userApps.find(a => a.id === activeAppId);

  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-slate-200 selection:bg-indigo-500 selection:text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "border-r border-slate-800 flex flex-col transition-all duration-300 shrink-0 glass z-20",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <Zap size={18} className="text-white" />
          </div>
          {sidebarOpen && <h1 className="font-bold tracking-tight text-lg text-white">LiveSmart</h1>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className={cn("text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 px-2", !sidebarOpen && "hidden")}>Navigation</div>
          <NavItem 
            id="home" 
            label="Dashboard" 
            icon={<LayoutDashboard size={20} />} 
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
              {userApps.map(app => (
                <NavItem 
                  key={app.id}
                  id={app.id} 
                  label={app.name} 
                  icon={<Globe size={20} />} 
                  active={activeAppId === app.id} 
                  onClick={() => setActiveAppId(app.id)} 
                  collapsed={!sidebarOpen}
                  onDelete={(e) => deleteApp(app.id, e)}
                />
              ))}
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
             className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-white transition-colors"
           >
             <Settings size={18} />
             {sidebarOpen && <span className="text-xs">Console Options</span>}
           </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <div className="text-sm font-medium text-slate-300">
              Workspace: <span className="text-slate-500 font-normal ml-1">LiveSmart_V1</span>
            </div>
            <div className="h-4 w-px bg-slate-800"></div>
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <div className="status-dot dot-active"></div>
                GATEWAY OPERATIONAL
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-4 py-1.5 rounded text-xs font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-colors uppercase tracking-wider"
            >
              Add Project URL
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
                  apps={userApps} 
                  onLaunch={setActiveAppId} 
                  onAdd={() => setShowAddModal(true)} 
                  onDelete={(id) => setAppToDelete(id)}
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

        {/* Modal Overlay */}
        {showAddModal && (
          <AddAppModal 
            onClose={() => setShowAddModal(false)}
            onAdd={addApp}
          />
        )}

        {/* Delete Confirmation Modal */}
        {appToDelete && (
          <DeleteConfirmModal 
            appName={userApps.find(a => a.id === appToDelete)?.name || 'this app'}
            onConfirm={() => deleteApp(appToDelete)}
            onCancel={() => setAppToDelete(null)}
          />
        )}
      </main>
    </div>
  );
}

function NavItem({ id, label, icon, active, onClick, collapsed, onDelete }: { id: string, label: string, icon: React.ReactNode, active?: boolean, onClick: () => void, collapsed: boolean, onDelete?: (e: React.MouseEvent) => void }) {
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
      {onDelete && !collapsed && (
        <button 
          onClick={onDelete}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

function HomeDashboard({ apps, onLaunch, onAdd, onDelete }: { apps: AppConfig[], onLaunch: (id: string) => void, onAdd: () => void, onDelete: (id: string, e: React.MouseEvent) => void }) {
  return (
    <div className="h-full p-8 md:p-12 overflow-y-auto custom-scrollbar space-y-16 bg-[#0f172a] relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
      
      <header className="relative z-10 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-4 uppercase inline-block bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
            Command Center
          </h2>
          <p className="text-slate-400 text-sm font-mono tracking-widest italic flex items-center justify-center md:justify-start gap-3">
             <Zap size={14} className="text-indigo-500" /> System synchronization active. All nodes operational.
          </p>
        </motion.div>
      </header>

      <section className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.3em]">Resource_Nodes</h3>
          <button 
            onClick={onAdd} 
            className="group text-[10px] bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 px-4 py-2 rounded-full text-slate-300 hover:text-white font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
          >
            <Plus size={12} className="group-hover:rotate-90 transition-transform" /> New Integration
          </button>
        </div>
        
        <LayoutGroup>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            <motion.button
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 }
              }}
              onClick={onAdd}
              className="app-card border-dashed border-2 border-slate-800 hover:border-indigo-500/50 flex flex-col items-center justify-center gap-6 transition-all group bg-transparent aspect-[4/5] sm:aspect-[3/4] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors" />
              <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-white group-hover:border-indigo-500 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all">
                <Plus size={32} />
              </div>
              <div className="text-[11px] font-bold text-slate-500 group-hover:text-indigo-400 uppercase tracking-[0.25em] transition-colors">Deploy_New_Asset</div>
            </motion.button>

            {apps.map(app => {
              const domainFavicon = `https://www.google.com/s2/favicons?domain=${new URL(app.url).hostname}&sz=64`;
              const faviconSrc = app.faviconUrl || domainFavicon;

              return (
                <motion.div
                  layout
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  key={app.id}
                  className="app-card group relative overflow-hidden flex flex-col aspect-[4/5] sm:aspect-[3/4] hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10"
                >
                  <div className="p-7 flex-1 flex flex-col relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className={cn("w-14 h-14 rounded-[20px] flex items-center justify-center text-white font-bold shadow-2xl overflow-hidden group-hover:scale-110 transition-transform duration-500", app.color)}>
                        {faviconSrc ? (
                          <img src={faviconSrc} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Globe size={28} />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => onDelete(app.id, e)}
                          className="p-2.5 bg-slate-900/50 rounded-xl text-slate-500 hover:text-red-400 transition-all backdrop-blur-md border border-white/5 hover:border-red-500/20 active:scale-95"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <h4 className="font-extrabold text-white text-xl tracking-tight truncate mb-1 group-hover:text-indigo-100 transition-colors">
                      {app.name}
                    </h4>
                    <div className="flex items-center gap-2 mb-4 opacity-40 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-slate-500 font-mono truncate italic tracking-tighter">{app.url}</p>
                    </div>
                    
                    <p className="text-[13px] text-slate-400 leading-relaxed line-clamp-3 font-medium">
                      {app.description || 'System node initialized without extended metadata.'}
                    </p>
                  </div>

                  <div className="px-7 pb-7 pt-2 relative z-10">
                    <button 
                      onClick={() => onLaunch(app.id)}
                      className={cn(
                        "w-full text-white text-[12px] font-bold py-3.5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 group/btn uppercase tracking-widest relative overflow-hidden",
                        app.color.replace('bg-', 'hover:bg-').includes('indigo') ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20' : 
                        app.color + ' brightness-90 hover:brightness-110'
                      )}
                    >
                      <span className="relative z-10">Launch Interface</span>
                      <ArrowRight size={16} className="relative z-10 group-hover/btn:translate-x-1.5 transition-transform" />
                    </button>
                    
                    <div className="flex justify-center mt-4">
                      <a 
                        href={app.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-slate-600 hover:text-indigo-400 transition-colors font-mono uppercase flex items-center gap-2 opacity-60 hover:opacity-100"
                      >
                        <ExternalLink size={11} /> network_origin
                      </a>
                    </div>
                  </div>

                  {/* Glass reflections */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className={cn("absolute -right-8 -bottom-8 w-32 h-32 blur-[60px] opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-700", app.color)}></div>
                </motion.div>
              );
            })}
          </motion.div>
        </LayoutGroup>
      </section>

      {/* Overview Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        <div className="glass rounded-2xl p-8 flex flex-col border border-slate-800">
           <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-6">LiveSmart Metrics</div>
           <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs text-slate-400 font-mono">Active Integrations</span>
                <span className="text-2xl font-bold text-white">{apps.length}</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((apps.length / 10) * 100, 100)}%` }}
                  className="h-full bg-indigo-500" 
                />
              </div>
              <p className="text-[9px] text-slate-600 font-mono tracking-tighter">RESOURCE_LIMIT: 10_NODES_MAX</p>
           </div>
        </div>
        <div className="glass rounded-2xl p-8 flex flex-col border border-slate-800 justify-center">
           <p className="text-sm text-slate-400 italic font-mono leading-relaxed">
             "The best way to predict the future is to integrate it."
           </p>
           <span className="text-[10px] font-bold text-slate-600 mt-2 tracking-widest uppercase">— LiveSmart CORE</span>
        </div>
      </section>
    </div>
  );
}

function AddAppModal({ onClose, onAdd }: { onClose: () => void, onAdd: (app: Omit<AppConfig, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    faviconUrl: '',
    description: '',
    color: 'bg-indigo-500'
  });
  const [generating, setGenerating] = useState(false);

  const colors = [
    'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 
    'bg-cyan-500', 'bg-zinc-500', 'bg-violet-600', 'bg-fuchsia-500', 
    'bg-orange-500', 'bg-lime-500'
  ];

  const generateDescription = async () => {
    if (!formData.name || !formData.url) return;
    setGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a high-tech, professional 1-sentence system description for a web application named "${formData.name}" hosted at "${formData.url}". The tone should be technical and futuristic, matching a "Command Center" dashboard theme. Do not use quotes. Just give the sentence.`,
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
    
    // Ensure URL has protocol
    let url = formData.url;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    
    onAdd({ ...formData, url });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="glass relative w-full max-w-xl border border-white/10 rounded-[32px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]"
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-[0.2em]">Asset Deployment</h3>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest mt-1">INITIALIZING_NEW_RESOURCE_LINK</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Node Identifier</label>
              <input 
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
                placeholder="APP_NAME_01"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Endpoint Protocol</label>
              <input 
                type="text"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
                placeholder="https://app.io"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Source Favicon (Optional)</label>
            <input 
              type="text"
              value={formData.faviconUrl}
              onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
              placeholder="https://domain.com/icon.png"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Metadata Description</label>
              <button 
                type="button"
                disabled={generating || !formData.name || !formData.url}
                onClick={generateDescription}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-30 transition-all"
              >
                {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} MAGIC_FILL
              </button>
            </div>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-mono resize-none h-28"
              placeholder="System functionality summary..."
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Resource Visual Aura</label>
            <div className="flex flex-wrap gap-3 px-1">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  className={cn(
                    "w-7 h-7 rounded-full transition-all",
                    c,
                    formData.color === c ? "ring-4 ring-indigo-500/30 scale-125 shadow-xl" : "opacity-40 hover:opacity-100 hover:scale-110"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-extrabold py-5 rounded-[24px] hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-2xl shadow-indigo-500/20 active:scale-[0.98] uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
            >
              Confirm Deployment <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function DeleteConfirmModal({ appName, onConfirm, onCancel }: { appName: string, onConfirm: () => void, onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        className="bg-slate-900/80 border border-red-500/20 p-8 rounded-[32px] max-w-sm w-full relative z-10 text-center shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Delete Node?</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Are you sure you want to terminate the connection to <span className="text-white font-bold">{appName}</span>? This action is irreversible.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onCancel}
            className="py-3 px-4 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white font-bold text-xs uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-600/20"
          >
            Terminate
          </button>
        </div>
      </motion.div>
    </div>
  );
}
