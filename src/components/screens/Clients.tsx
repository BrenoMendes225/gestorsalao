import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  Settings2, 
  UserPlus, 
  Phone, 
  Calendar, 
  Star,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { Client } from '../../types';

interface ClientsProps {
  userId: string;
  onAdd: () => void;
  refreshKey: number;
}

const Clients: React.FC<ClientsProps> = ({ onAdd, refreshKey }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('clients').select('*').order('name').then(({ data }) => {
      setClients(data || []);
    });
  }, [refreshKey]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="pb-24">
      <div className="bg-white dark:bg-surface-dark p-6 border-b border-slate-100 dark:border-border-dark flex justify-between items-center transition-colors">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Clientes</h2>
        <button 
          onClick={onAdd}
          className="bg-primary text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <UserPlus size={18} /> Adicionar Cliente
        </button>
      </div>

      <div className="p-6">
        <div className="relative mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            placeholder="Buscar por nome ou WhatsApp..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl outline-none focus:border-primary transition-all dark:text-white font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client, i) => (
            <motion.div 
              key={client.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-border-dark shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              <button className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors">
                <MoreHorizontal size={20} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="size-16 rounded-2xl bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-border-dark flex items-center justify-center text-slate-300 overflow-hidden relative group-hover:border-primary/50 transition-colors">
                  <Users size={32} />
                  {client.is_vip && (
                    <div className="absolute top-0 right-0 bg-amber-500 p-0.5 rounded-bl-lg">
                      <Star size={10} fill="white" className="text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{client.name}</h4>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Phone size={12} />
                    <span className="text-xs font-bold">{client.phone || '(Sempre)'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="bg-slate-50 dark:bg-background-dark p-3 rounded-xl border border-slate-100 dark:border-border-dark">
                  <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Última Visita</p>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Calendar size={12} className="text-primary" />
                    <span className="text-xs font-bold">{client.last_visit || '--/--/--'}</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-background-dark p-3 rounded-xl border border-slate-100 dark:border-border-dark">
                  <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className={`size-1.5 rounded-full ${client.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 capitalize">{client.status}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-border-dark flex gap-2">
                <button className="flex-1 h-10 bg-primary/10 text-primary rounded-xl text-xs font-black hover:bg-primary hover:text-white transition-all uppercase tracking-tighter">
                  Ver Histórico
                </button>
                <button className="h-10 w-10 flex items-center justify-center bg-slate-50 dark:bg-background-dark text-slate-400 rounded-xl hover:text-primary transition-colors">
                  <Settings2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Clients;
