import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Bell, 
  TrendingUp, 
  UserCircle,
  Users,
  Wallet,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { Appointment } from '../../types';
import { User } from '@supabase/supabase-js';
import { formatDate, formatTime } from '../../utils/format';

interface DashboardProps {
  user: User;
  isDarkMode: boolean;
  refreshKey: number;
  onSelectApt: (apt: Appointment) => void;
  onOpenNotifications: () => void;
  unreadCount: number;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  refreshKey,
  onSelectApt, 
  onOpenNotifications, 
  unreadCount 
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);
    };

    fetchProfile();
  }, [user.id, refreshKey]);

  useEffect(() => {
    const fetchAppointmentsForSelectedDate = async () => {
      const { data: apts } = await supabase
        .from('appointments')
        .select('*, client:client_id(name), service:service_id(name, price)')
        .eq('date', selectedDate)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('time', { ascending: true });

      if (apts) {
        setAppointments(apts.map((a: any) => ({
          ...a,
          client_name: a.client?.name,
          service_name: a.service?.name,
          price: a.service?.price
        })));
      } else {
        setAppointments([]);
      }
    };

    fetchAppointmentsForSelectedDate();
  }, [selectedDate, user.id, refreshKey]);

  useEffect(() => {
    const fetchBookedDates = async () => {
      const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data } = await supabase
        .from('appointments')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .eq('status', 'pending');

      if (data) {
        const dates = new Set(data.map(a => a.date));
        setBookedDates(dates);
      }
    };

    fetchBookedDates();
  }, [viewDate, user.id, refreshKey]);


  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Calendar Helpers
  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Adjust for Monday start if needed, but here we use Sunday start for simplicity (0-6)
    // or we can adjust to make S (Mon) first. Let's stick to conventional Sun start for now
    // and label accordingly.
    
    const days = [];
    // Padding
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    // Month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const isBooked = bookedDates.has(dateStr);
      const isSelected = dateStr === selectedDate;

      days.push(
        <div 
          key={d} 
          onClick={() => setSelectedDate(dateStr)}
          className="flex flex-col items-center justify-center h-10 relative cursor-pointer group/day"
        >
          <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2 dark:ring-offset-surface-dark' :
            isToday ? 'bg-primary/20 text-primary' : 
            isBooked ? 'text-primary' : 
            'text-slate-600 dark:text-slate-400'
          } group-hover/day:scale-110`}>
            {d}
          </div>
          {isBooked && !isSelected && (
            <div className="absolute bottom-0 size-1 bg-primary rounded-full"></div>
          )}
        </div>
      );
    }
    return days;
  };

  const isSelectedToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="pb-24">
      {/* Top Bar */}
      <div className="flex items-center bg-white dark:bg-surface-dark p-4 pb-2 justify-between border-b border-slate-200 dark:border-border-dark transition-colors">
        <div className="flex items-center">
          <div className="size-10 rounded-full border-2 border-primary overflow-hidden bg-slate-100 dark:bg-background-dark flex items-center justify-center">
          {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" referrerPolicy="no-referrer" />
            ) : (
              <UserCircle className="text-slate-400 dark:text-slate-500" size={32} />
            )}
          </div>
          <div className="ml-3">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Bem-vinda{profile?.salon_name ? ` ${profile.salon_name}` : ''},</p>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold">{profile?.full_name || user.email?.split('@')[0]}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-slate-100 dark:bg-background-dark rounded-xl text-slate-700 dark:text-white"><Search size={20} /></button>
          <button 
            onClick={onOpenNotifications}
            className="p-2 bg-slate-100 dark:bg-background-dark rounded-xl text-slate-700 dark:text-white relative transition-all active:scale-90"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 size-2 bg-primary rounded-full animate-pulse"></span>
            )}
          </button>
        </div>
      </div>


      {/* Calendar Section */}
      <motion.div animate={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.95 }} className="px-4 py-2">
        <div className="bg-white dark:bg-surface-dark p-5 rounded-xl shadow-sm border border-slate-100 dark:border-border-dark transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-slate-900 dark:text-white text-base font-bold">Calendário de Agendamentos</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => changeMonth(-1)}
                className="p-1.5 hover:bg-slate-50 dark:hover:bg-background-dark rounded-lg transition-colors text-slate-400 dark:text-slate-500"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-slate-900 dark:text-white text-sm font-black min-w-[120px] text-center uppercase tracking-tighter">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button 
                onClick={() => changeMonth(1)}
                className="p-1.5 hover:bg-slate-50 dark:hover:bg-background-dark rounded-lg transition-colors text-slate-400 dark:text-slate-500"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-center text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>
      </motion.div>

      {/* Appointments List */}
      <div className="px-4 md:px-8 pt-6 pb-2 flex justify-between items-center">
        <h2 className="text-slate-900 dark:text-white text-lg md:text-xl font-bold">
          {isSelectedToday ? 'Próximos de Hoje' : `Agenda de ${formatDate(selectedDate)}`}
        </h2>
        <button className="text-primary text-sm font-bold hover:underline transition-colors">Ver todos</button>
      </div>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="px-4 md:px-8 space-y-3 md:space-y-4 mb-8"
      >
        {appointments.length === 0 ? (
          <div className="py-8 text-center text-slate-400 bg-white dark:bg-surface-dark rounded-xl border border-slate-100 dark:border-border-dark">
            Não há atendimentos até o momento.
          </div>
        ) : (
          appointments.map((apt) => (
            <motion.div 
              key={apt.id} 
              variants={item}
              onClick={() => onSelectApt(apt)}
              className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white dark:bg-surface-dark rounded-xl border border-slate-100 dark:border-border-dark shadow-sm transition-all hover:shadow-md cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center md:flex-col md:justify-center min-w-[50px] md:border-r border-slate-100 dark:border-border-dark md:pr-4 gap-4 md:gap-0">
                <p className="text-slate-900 dark:text-white font-bold text-base md:text-lg group-hover:text-primary transition-colors">{formatTime(apt.time)}</p>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase hidden md:block">
                  {isSelectedToday ? 'Hoje' : formatDate(selectedDate).split('/')[0] + '/' + formatDate(selectedDate).split('/')[1]}
                </p>
              </div>
              <div className="flex-1 border-t border-slate-50 dark:border-border-dark pt-3 md:border-0 md:pt-0">
                <p className="text-slate-900 dark:text-white font-bold text-sm md:text-base group-hover:text-primary transition-colors">{apt.service_name}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">{apt.client_name}</p>
              </div>
              <div className="flex justify-between items-center md:flex-col md:items-end mt-2 md:mt-0 gap-2">
                <p className="text-primary font-black text-sm md:text-base">R$ {apt.price?.toFixed(2)}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                    apt.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {apt.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </span>
                  <div className="size-8 rounded-lg bg-slate-50 dark:bg-background-dark flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                    <FileText size={16} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
