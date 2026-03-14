import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Scissors, 
  Clock, 
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { Service } from '../../types';

interface ServicesProps {
  userId: string;
  onEdit: (service: Service) => void;
  onAdd: () => void;
  refreshKey: number;
}

const Services: React.FC<ServicesProps> = ({ onEdit, onAdd, refreshKey }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    supabase.from('services').select('*').order('category').then(({ data }) => {
      setServices(data || []);
    });
  }, [refreshKey]);

  const deleteService = async (id: number) => {
    if (!confirm('Deseja excluir este serviço?')) return;
    await supabase.from('services').delete().eq('id', id);
    setServices(services.filter(s => s.id !== id));
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-24">
      <div className="bg-white dark:bg-surface-dark p-6 border-b border-slate-100 dark:border-border-dark flex justify-between items-center transition-colors">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Serviços</h2>
        <button 
          onClick={onAdd}
          className="bg-primary text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={18} /> Novo Serviço
        </button>
      </div>

      <div className="p-6">
        <div className="relative mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            placeholder="Buscar serviços ou categorias..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl outline-none focus:border-primary transition-all dark:text-white font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((service, i) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-border-dark shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Scissors size={28} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(service)} className="p-2.5 bg-slate-50 dark:bg-background-dark rounded-xl text-slate-400 hover:text-primary transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => deleteService(service.id)} className="p-2.5 bg-slate-50 dark:bg-background-dark rounded-xl text-slate-400 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary py-0.5 px-2 bg-primary/10 rounded-lg">{service.category}</span>
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">{service.name}</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm font-bold">
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} className="text-slate-300" />
                      {service.duration} min
                    </div>
                  </div>
                  <p className="text-2xl font-black text-primary">R$ {service.price.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
