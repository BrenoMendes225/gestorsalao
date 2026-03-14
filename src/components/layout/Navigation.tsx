import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Wallet, 
  Scissors, 
  Users, 
  Settings, 
  Plus, 
  Sun, 
  Moon 
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewRecord: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  setActiveTab, 
  onNewRecord,
  isDarkMode,
  toggleDarkMode 
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'finances', label: 'Finanças', icon: Wallet },
    { id: 'services', label: 'Serviços', icon: Scissors },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-border-dark px-2 pb-6 pt-3 flex items-center z-50 transition-colors">
        <div className="flex-1 flex justify-around">
          {tabs.slice(0, 3).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
            >
              <tab.icon size={20} fill={activeTab === tab.id ? 'currentColor' : 'none'} />
              <span className="text-[9px] font-bold uppercase tracking-tighter opacity-80">{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Placeholder for the FAB */}
        <div className="w-16 h-10 flex-shrink-0"></div>

        <div className="flex-1 flex justify-around">
          {tabs.slice(3).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
            >
              <tab.icon size={20} fill={activeTab === tab.id ? 'currentColor' : 'none'} />
              <span className="text-[9px] font-bold uppercase tracking-tighter opacity-80">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-50">
          <button 
            onClick={onNewRecord}
            className="bg-primary text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 hover:scale-105 transition-transform"
          >
            <Plus size={32} />
          </button>
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-border-dark flex-col z-50 transition-colors">
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-border-dark">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20"><Scissors size={24} /></div>
            <h1 className="text-xl font-extrabold tracking-tight dark:text-white">Beleza & Gestão</h1>
          </div>
          <button 
            onClick={toggleDarkMode}
            className="p-2 hover:bg-slate-100 dark:hover:bg-background-dark rounded-xl transition-colors text-slate-500 dark:text-text-dark-secondary"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        
        <div className="flex-1 px-4 py-8 flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-background-dark hover:text-slate-900 dark:hover:text-white'}`}
            >
              <tab.icon size={20} fill={activeTab === tab.id ? 'currentColor' : 'none'} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-border-dark">
          <button 
            onClick={onNewRecord}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} /> Novo Registro
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
