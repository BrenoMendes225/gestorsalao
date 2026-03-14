import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Clock, 
  MessageCircle, 
  Scissors, 
  User, 
  Trash2, 
  CheckCircle2, 
  Edit3, 
  ChevronRight, 
  ExternalLink,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { Appointment } from '../../types';

interface AgendaProps {
  userId: string;
  onEditApt: (apt: Appointment) => void;
  refreshKey: number;
}

const Agenda: React.FC<AgendaProps> = ({ userId, onEditApt, refreshKey }) => {
  const [activeStatus, setActiveStatus] = useState<'pending' | 'completed' | 'cancelled'>('pending');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*, client:client_id(name, phone), service:service_id(name, price)')
        .eq('status', activeStatus)
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      
      if (error) {
        console.error("Error fetching appointments:", error);
      } else {
        setAppointments(data.map((a: any) => ({
          ...a,
          client_name: a.client?.name,
          client_phone: a.client?.phone,
          service_name: a.service?.name,
          price: a.service?.price
        })));
      }
      setLoading(false);
    };

    fetchAppointments();
  }, [activeStatus, userId, refreshKey]);

  const updateStatus = async (id: number, status: 'completed' | 'cancelled') => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    setAppointments(appointments.filter(a => a.id !== id));
    if (selectedAppointment?.id === id) setSelectedAppointment(null);
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
    await supabase.from('appointments').delete().eq('id', id);
    setAppointments(appointments.filter(a => a.id !== id));
    if (selectedAppointment?.id === id) setSelectedAppointment(null);
  };

  const sendReminder = (apt: Appointment) => {
    const phone = apt.client_name === 'Ana Beatriz Silva' ? '11987654321' : (apt as any).client_phone?.replace(/\D/g, '');
    if (!phone) {
      alert('Telefone do cliente não encontrado.');
      return;
    }
    const message = `Olá ${apt.client_name}, lembrete do seu agendamento de ${apt.service_name} dia ${apt.date} às ${apt.time}. Confirmado?`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredApts = appointments.filter(apt => 
    apt.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="pb-24">
      {/* Header & Tabs */}
      <div className="bg-white dark:bg-surface-dark p-6 transition-colors border-b border-slate-200 dark:border-border-dark sticky top-0 z-40">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Agenda</h2>
        
        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-background-dark rounded-2xl mb-6">
          {[
            { id: 'pending', label: 'Pendentes' },
            { id: 'completed', label: 'Finalizados' },
            { id: 'cancelled', label: 'Cancelados' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveStatus(tab.id as any)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
                activeStatus === tab.id ? 'bg-white dark:bg-surface-dark text-primary shadow-sm shadow-black/5' : 'text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            placeholder="Buscar por cliente ou serviço..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-border-dark rounded-xl text-sm font-medium outline-none focus:border-primary transition-all dark:text-white"
          />
        </div>
      </div>

      {/* Appointment List */}
      <div className="px-6 py-6 h-full min-h-[50vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold text-sm">Carregando agendamentos...</p>
          </div>
        ) : filteredApts.length === 0 ? (
          <div className="text-center py-20">
            <div className="size-16 bg-slate-100 dark:bg-background-dark rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-700">
              <Calendar size={32} />
            </div>
            <p className="text-slate-500 font-bold">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filteredApts.map((apt) => (
              <motion.div 
                key={apt.id} 
                variants={item}
                onClick={() => setSelectedAppointment(apt)}
                className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-100 dark:border-border-dark shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h4 className="text-slate-900 dark:text-white font-bold text-base leading-tight group-hover:text-primary transition-colors">{apt.service_name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <User size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{apt.client_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-900 dark:text-white font-black text-base">R$ {apt.price?.toFixed(2)}</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mt-1">{apt.time}</p>
                  </div>
                </div>
                
                {activeStatus === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50 dark:border-border-dark opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateStatus(apt.id, 'completed'); }}
                      className="flex-1 h-9 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
                    >
                      Finalizar
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditApt(apt); }}
                      className="flex-1 h-9 bg-slate-100 dark:bg-background-dark text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); sendReminder(apt); }}
                      className="h-9 w-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAppointment(null)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Scissors size={28} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { onEditApt(selectedAppointment); setSelectedAppointment(null); }} className="p-3 bg-slate-50 dark:bg-background-dark rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                      <Edit3 size={20} />
                    </button>
                    <button onClick={() => deleteAppointment(selectedAppointment.id)} className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedAppointment.service_name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 mt-1 uppercase text-xs tracking-widest">
                      R$ {selectedAppointment.price?.toFixed(2)} • {selectedAppointment.time}
                    </p>
                  </div>

                  <div className="p-5 bg-slate-50 dark:bg-background-dark rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center text-slate-400 font-bold border border-slate-100 dark:border-border-dark">
                          {selectedAppointment.client_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Cliente</p>
                          <p className="text-slate-800 dark:text-white font-bold">{selectedAppointment.client_name}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => sendReminder(selectedAppointment)}
                        className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Phone size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-100 dark:border-border-dark rounded-2xl flex items-center gap-3">
                      <Calendar size={18} className="text-primary" />
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400">Data</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedAppointment.date}</p>
                      </div>
                    </div>
                    <div className="p-4 border border-slate-100 dark:border-border-dark rounded-2xl flex items-center gap-3">
                      <Clock size={18} className="text-primary" />
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400">Horário</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedAppointment.time}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 flex gap-3">
                  <button 
                    onClick={() => setSelectedAppointment(null)}
                    className="flex-1 h-14 rounded-2xl bg-slate-50 dark:bg-background-dark text-slate-500 dark:text-slate-400 font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Voltar
                  </button>
                  {selectedAppointment.status === 'pending' && (
                    <button 
                      onClick={() => updateStatus(selectedAppointment.id, 'completed')}
                      className="flex-[2] h-14 rounded-2xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all"
                    >
                      <CheckCircle2 size={20} /> Finalizar Atendimento
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Agenda;
