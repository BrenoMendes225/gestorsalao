import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  Plus, 
  Search, 
  Bell, 
  TrendingUp, 
  ChevronRight,
  Clock,
  Scissors,
  Palette,
  Hand,
  Sparkles,
  ArrowLeft,
  MoreVertical,
  Home,
  BarChart3,
  UserCircle,
  CreditCard,
  ArrowRight,
  Camera,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, Service, Appointment, DashboardStats } from './types';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';

// --- Components ---

const Navigation = ({ activeTab, setActiveTab, onNewRecord }: { activeTab: string, setActiveTab: (tab: string) => void, onNewRecord: () => void }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'services', label: 'Serviços', icon: Scissors },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 pb-6 pt-3 flex justify-between items-center z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-slate-400'}`}
          >
            <tab.icon size={24} fill={activeTab === tab.id ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <button 
            onClick={onNewRecord}
            className="bg-primary text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 hover:scale-105 transition-transform"
          >
            <Plus size={32} />
          </button>
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200 flex-col z-50">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20"><Scissors size={24} /></div>
          <h1 className="text-xl font-extrabold tracking-tight">Beleza & Gestão</h1>
        </div>
        
        <div className="flex-1 px-4 py-8 flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <tab.icon size={20} fill={activeTab === tab.id ? 'currentColor' : 'none'} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-slate-100">
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

const NewRecordModal = ({ isOpen, onClose, user, onSave, initialType = 'appointment', showTabs = true }: { isOpen: boolean, onClose: () => void, user: User, onSave: () => void, initialType?: 'appointment' | 'client' | 'service', showTabs?: boolean }) => {
  const [type, setType] = useState<'appointment' | 'client' | 'service'>(initialType);

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
    }
  }, [isOpen, initialType]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Form states
  const initialFormState = {
    client_id: '',
    service_id: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    professional_name: 'Juliana Moraes',
    client_name: '',
    client_phone: '',
    service_name: '',
    service_price: '',
    service_duration: '60',
    service_category: 'Cabelo'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      if (type === 'appointment') {
        supabase.from('clients').select('*').order('name').then(({ data }) => setClients(data || []));
        supabase.from('services').select('*').order('name').then(({ data }) => setServices(data || []));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && type === 'appointment') {
      supabase.from('clients').select('*').order('name').then(({ data }) => setClients(data || []));
      supabase.from('services').select('*').order('name').then(({ data }) => setServices(data || []));
    }
  }, [type]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, client_phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'appointment') {
        const { error } = await supabase.from('appointments').insert([{
          user_id: user.id,
          client_id: formData.client_id,
          service_id: formData.service_id,
          date: formData.date,
          time: formData.time,
          professional_name: formData.professional_name,
          status: 'pending'
        }]);
        if (error) throw error;
      } else if (type === 'client') {
        const { error } = await supabase.from('clients').insert([{
          user_id: user.id,
          name: formData.client_name,
          phone: formData.client_phone,
          status: 'active'
        }]);
        if (error) throw error;
      } else if (type === 'service') {
        const { error } = await supabase.from('services').insert([{
          user_id: user.id,
          name: formData.service_name,
          price: parseFloat(formData.service_price),
          duration: parseInt(formData.service_duration),
          category: formData.service_category
        }]);
        if (error) throw error;
      }
      onSave();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {!showTabs ? (type === 'service' ? 'Novo Serviço' : type === 'client' ? 'Nova Cliente' : 'Novo Agendamento') : 'Novo Registro'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Plus className="rotate-45" size={24} /></button>
        </div>

        {showTabs && (
          <div className="flex p-4 gap-2 bg-slate-50 border-b border-slate-100">
            {(['appointment', 'client', 'service'] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  type === t ? 'bg-primary text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100'
                }`}
              >
                {t === 'appointment' ? 'Agendamento' : t === 'client' ? 'Cliente' : 'Serviço'}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {type === 'appointment' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cliente</label>
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary"
                  value={formData.client_id}
                  onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                  required
                >
                  <option value="">Selecione uma cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Serviço</label>
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary"
                  value={formData.service_id}
                  onChange={e => setFormData({ ...formData, service_id: e.target.value })}
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data</label>
                  <input 
                    type="date" 
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Horário</label>
                  <input 
                    type="time" 
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {type === 'client' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Nome da cliente"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary"
                  value={formData.client_name}
                  onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">WhatsApp / Telefone</label>
                <input 
                  type="tel" 
                  placeholder="00 00000-0000"
                  maxLength={13}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary"
                  value={formData.client_phone}
                  onChange={handlePhoneChange}
                />
              </div>
            </>
          )}

          {type === 'service' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome do Serviço</label>
                <input 
                  type="text" 
                  placeholder="ex: Corte Feminino"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary"
                  value={formData.service_name}
                  onChange={e => setFormData({ ...formData, service_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preço (R$)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    step="0.01"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary"
                    value={formData.service_price}
                    onChange={e => setFormData({ ...formData, service_price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duração (min)</label>
                  <input 
                    type="number" 
                    placeholder="60"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary"
                    value={formData.service_duration}
                    onChange={e => setFormData({ ...formData, service_duration: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Categoria</label>
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary"
                  value={formData.service_category}
                  onChange={e => setFormData({ ...formData, service_category: e.target.value })}
                >
                  <option value="Cabelo">Cabelo</option>
                  <option value="Unhas">Unhas</option>
                  <option value="Estética">Estética</option>
                  <option value="Maquiagem">Maquiagem</option>
                </select>
              </div>
            </>
          )}

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white font-bold h-14 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Registro'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- Screens ---

const Dashboard = ({ user }: { user: User }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);

      // Fetch Stats
      const { data: confirmedApts } = await supabase
        .from('appointments')
        .select('service:service_id(price)')
        .eq('status', 'confirmed');
      
      const revenue = confirmedApts?.reduce((acc, apt: any) => acc + (apt.service?.price || 0), 0) || 0;
      
      const today = new Date().toISOString().split('T')[0];
      const { data: aptsToday } = await supabase.from('appointments').select('*').eq('date', today);
      const { data: totalCl } = await supabase.from('clients').select('*');

      setStats({
        revenue,
        appointmentsToday: aptsToday?.length || 0,
        totalClients: totalCl?.length || 0
      });

      // Fetch Recent Appointments
      const { data: recent } = await supabase
        .from('appointments')
        .select(`
          *,
          client:client_id(name),
          service:service_id(name, price)
        `)
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      
      if (recent) {
        setAppointments(recent.map(apt => ({
          ...apt,
          client_name: (apt.client as any)?.name,
          service_name: (apt.service as any)?.name,
          price: (apt.service as any)?.price
        })));
      }
    };

    fetchData();
  }, [user.id]);

  return (
    <div className="pb-24">
      {/* Top Bar */}
      <div className="flex items-center bg-white p-4 pb-2 justify-between border-b border-slate-200">
        <div className="flex items-center">
          <div className="size-10 rounded-full border-2 border-primary overflow-hidden bg-slate-100 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" referrerPolicy="no-referrer" />
            ) : (
              <UserCircle className="text-slate-400" size={32} />
            )}
          </div>
          <div className="ml-3">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Bem-vinda{profile?.salon_name ? ` ao ${profile.salon_name}` : ''},</p>
            <h2 className="text-slate-900 text-lg font-bold">{profile?.full_name || user.email?.split('@')[0]}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-slate-100 rounded-xl text-slate-700"><Search size={20} /></button>
          <button className="p-2 bg-slate-100 rounded-xl text-slate-700 relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 size-2 bg-primary rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-2 text-primary mb-1">
            <TrendingUp size={18} />
            <p className="text-slate-600 text-sm font-medium">Faturamento</p>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 leading-none">R$ {stats?.revenue.toFixed(2) || '0.00'}</h3>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={12} className="text-emerald-500" />
            <p className="text-emerald-500 text-[10px] font-bold">+12.5%</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Calendar size={18} />
            <p className="text-slate-600 text-sm font-medium">Agendados</p>
          </div>
          <p className="text-slate-900 text-xl md:text-2xl font-extrabold">{stats?.appointmentsToday} Serviços</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={12} className="text-emerald-500" />
            <p className="text-emerald-500 text-[10px] font-bold">+4 novos</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Users size={18} />
            <p className="text-slate-600 text-sm font-medium">Clientes Ativos</p>
          </div>
          <p className="text-slate-900 text-xl md:text-2xl font-extrabold">{stats?.totalClients}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={12} className="text-emerald-500" />
            <p className="text-emerald-500 text-[10px] font-bold">+28 este mês</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-2 text-primary mb-1">
            <BarChart3 size={18} />
            <p className="text-slate-600 text-sm font-medium">Ticket Médio</p>
          </div>
          <p className="text-slate-900 text-xl md:text-2xl font-extrabold">R$ {((stats?.revenue || 0) / (stats?.appointmentsToday || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={12} className="text-emerald-500" />
            <p className="text-emerald-500 text-[10px] font-bold">+5.2%</p>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="px-4 py-2">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-slate-900 text-base font-bold">Desempenho Semanal</h3>
            <span className="text-slate-400 text-[10px] font-bold uppercase">Últimos 7 dias</span>
          </div>
          <div className="flex items-end justify-between h-32 px-1">
            {[65, 80, 100, 50, 90, 40, 30].map((height, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div 
                  className={`w-full rounded-t-full ${height === 100 ? 'bg-primary' : 'bg-primary/20'}`} 
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-[10px] font-bold text-slate-400">
                  {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="px-4 md:px-8 pt-6 pb-2 flex justify-between items-center">
        <h2 className="text-slate-900 text-lg md:text-xl font-bold">Próximos de Hoje</h2>
        <button className="text-primary text-sm font-bold hover:underline">Ver todos</button>
      </div>
      <div className="px-4 md:px-8 space-y-3 md:space-y-4 mb-8">
        {appointments.slice(0, 3).map((apt) => (
          <div key={apt.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center md:flex-col md:justify-center min-w-[50px] md:border-r border-slate-100 md:pr-4 gap-4 md:gap-0">
              <p className="text-slate-900 font-bold text-base md:text-lg">{apt.time}</p>
              <p className="text-slate-400 text-[10px] font-bold uppercase hidden md:block">Hoje</p>
            </div>
            <div className="flex-1 border-t border-slate-50 pt-3 md:border-0 md:pt-0">
              <p className="text-slate-900 font-bold text-sm md:text-base">{apt.service_name}</p>
              <p className="text-slate-500 text-xs md:text-sm">{apt.client_name} • {apt.professional_name}</p>
            </div>
            <div className="flex justify-between items-center md:flex-col md:items-end mt-2 md:mt-0">
              <p className="text-primary font-bold text-sm md:text-base">R$ {apt.price}</p>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
              }`}>
                {apt.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsScreen = ({ user, onUpdate }: { user: User, onUpdate: () => void }) => {
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data));
  }, [user.id, user.id]); // Added an extra dependency to force refetch on update

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(updatedProfile);
      onUpdate();
      alert('Foto de perfil atualizada!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 mb-24 max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8">Ajustes da Conta</h1>
      
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 flex flex-col items-center border-b border-slate-50">
          <div className="relative group">
            <div className="size-32 rounded-full border-4 border-primary/10 overflow-hidden bg-slate-100 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="text-slate-300" size={80} />
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 size-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
            >
              <Camera size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">{profile?.full_name}</h2>
          <p className="text-slate-500 text-sm">{user.email}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm"><Home size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Salão</p>
                <p className="font-bold text-slate-700">{profile?.salon_name || 'Não configurado'}</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
          >
            <LogOut size={20} />
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
};

const Agenda = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    supabase.from('appointments').select(`
      *,
      client:client_id(name),
      service:service_id(name, price)
    `).then(({ data }) => {
      if (data) {
        setAppointments(data.map(apt => ({
          ...apt,
          client_name: (apt.client as any)?.name,
          service_name: (apt.service as any)?.name,
          price: (apt.service as any)?.price
        })));
      }
    });
  }, []);

  const tabs = ['Todos', 'Pendentes', 'Confirmados', 'Concluídos'];

  return (
    <div className="pb-24 md:pb-8">
      <header className="sticky top-0 z-10 bg-white/80 md:bg-white backdrop-blur-md rounded-t-2xl md:rounded-xl">
        <div className="flex items-center p-4 pb-2 justify-between">
          <button className="p-2 md:hidden"><MoreVertical size={24} /></button>
          <h2 className="text-lg md:text-2xl font-bold md:pl-4">Agendamentos</h2>
          <button className="p-2"><Search size={24} /></button>
        </div>
        <div className="px-4 md:px-8 pb-3">
          <div className="flex border-b border-slate-200 gap-6 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`pb-3 pt-2 shrink-0 text-sm font-bold transition-colors border-b-2 ${
                  filter === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold">Hoje, 24 de Outubro</h3>
          <span className="text-primary text-[10px] font-bold bg-primary/10 px-2 py-1 rounded-full uppercase">3 Horários</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {appointments.map(apt => (
            <div key={apt.id} className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-4">
                <div className="size-14 rounded-full border-2 border-primary/20 overflow-hidden shrink-0">
                  <img src={`https://picsum.photos/seed/${apt.client_name}/100/100`} alt={apt.client_name} referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-base font-bold leading-tight mb-1 line-clamp-1">{apt.client_name}</p>
                    <span className={`size-3 rounded-full shrink-0 ${
                      apt.status === 'confirmed' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/40' : 'bg-amber-500 shadow-sm shadow-amber-500/40'
                    }`}></span>
                  </div>
                  <p className="text-slate-500 text-xs font-medium bg-slate-50 inline-block px-2 py-1 rounded-md">{apt.time} — {apt.time} (45m)</p>
                </div>
              </div>
              <div>
                <p className="text-primary text-sm font-bold mb-1">{apt.service_name}</p>
                <p className="text-slate-500 text-xs">{apt.professional_name}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const Services = ({ onAdd }: { onAdd: () => void }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [category, setCategory] = useState('Cabelo');

  useEffect(() => {
    supabase.from('services').select('*').order('category').then(({ data }) => setServices(data || []));
  }, []);

  const categories = ['Cabelo', 'Unhas', 'Estética', 'Maquiagem'];

  return (
    <div className="pb-24 md:pb-8">
      <header className="bg-white sticky top-0 z-10 border-b border-primary/10 rounded-t-2xl md:rounded-xl">
        <div className="flex items-center p-4 justify-between md:px-8">
          <button className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary md:hidden">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl md:text-2xl font-extrabold flex-1 md:flex-none px-4 md:px-0">Catálogo de Serviços</h1>
          <button 
            onClick={onAdd}
            className="size-10 flex items-center justify-center rounded-full bg-primary text-white shadow-lg md:ml-auto md:w-auto md:px-4 md:gap-2 hover:scale-105 transition-transform"
          >
            <Plus size={20} /> <span className="hidden md:inline font-bold">Novo Serviço</span>
          </button>
        </div>
        <div className="px-4 md:px-8 overflow-x-auto no-scrollbar">
          <div className="flex gap-6 border-b border-primary/5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`pb-3 pt-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                  category === cat ? 'border-primary text-primary' : 'border-transparent text-slate-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Buscar por serviço ou preço..." 
            className="w-full h-12 pl-12 pr-4 bg-white rounded-xl border border-primary/10 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
          <h3 className="text-lg font-bold md:col-span-full">{category} <span className="text-sm font-normal text-slate-500 ml-2">({services.filter(s => s.category === category).length} serviços)</span></h3>
          {services.filter(s => s.category === category).map(service => (
            <div key={service.id} className="bg-white p-5 rounded-xl border border-primary/5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md flex items-center gap-4">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-lg bg-primary/5 overflow-hidden flex items-center justify-center shrink-0">
                {service.image_url ? (
                  <img src={service.image_url} alt={service.name} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                ) : (
                  <Scissors className="text-primary" size={24} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-base md:text-lg truncate">{service.name}</h4>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center text-xs md:text-sm text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                    <Clock size={14} className="mr-1" /> {service.duration} min
                  </span>
                  <span className="text-primary font-bold text-sm md:text-md">R$ {service.price.toFixed(2)}</span>
                </div>
              </div>
              <button className="p-2 md:p-3 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                <Settings size={20} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const Clients = ({ onAdd }: { onAdd: () => void }) => {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    supabase.from('clients').select('*').order('name').then(({ data }) => setClients(data || []));
  }, []);

  return (
    <div className="pb-24 md:pb-8">
      <header className="sticky top-0 z-10 bg-white/80 md:bg-white backdrop-blur-md border-b border-primary/10 rounded-t-2xl md:rounded-xl">
        <div className="px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold">Gestão de Clientes</h1>
          </div>
          <button 
            onClick={onAdd}
            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-sm shadow-primary/30 hover:bg-primary/90 transition-colors hover:scale-105"
          >
            <Plus size={16} /> <span className="hidden md:inline">Nova Cliente</span><span className="md:hidden">Nova</span>
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8">
        <div className="relative mb-6 md:mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome, telefone ou CPF..." 
            className="w-full pl-12 pr-4 py-3 md:py-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/50 transition-all text-sm md:text-base ring-1 ring-slate-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-primary/5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-primary">{clients.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-primary/5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ativas</p>
            <p className="text-2xl font-bold text-slate-800">{clients.filter(c => c.status === 'active').length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {clients.map(client => (
            <div key={client.id} className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-transparent hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group">
              <div className="relative shrink-0">
                <div className="size-16 md:size-14 rounded-full border-2 border-primary/10 overflow-hidden">
                  <img src={`https://picsum.photos/seed/${client.name}/100/100`} alt={client.name} referrerPolicy="no-referrer" />
                </div>
                {client.status === 'active' && (
                  <span className="absolute bottom-0 right-0 size-4 md:size-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-base md:text-md truncate">{client.name}</h3>
                <div className="flex flex-col text-xs text-slate-500 mt-1 gap-1">
                  <span className="flex items-center gap-1"><CreditCard size={12} /> {client.phone}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> Última: {client.last_visit}</span>
                </div>
              </div>
              <div className="p-2 bg-slate-50 group-hover:bg-primary/5 rounded-full text-slate-300 group-hover:text-primary transition-colors">
                <ChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0); // 0: Hero, 1: Login, 2: Register, 3: Step1, 4: Step2, 5: Success
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile data
  const [profileData, setProfileData] = useState({
    full_name: '',
    salon_name: '',
    salon_address: ''
  });

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(0, s - 1));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setStep(3); // Go to info steps after sign up
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        });
      if (error) alert(error.message);
      else onComplete();
    }
    setLoading(false);
  };

  if (step === 0) {
    return (
      <div className="min-h-screen bg-background-light flex flex-col p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-primary p-1.5 rounded-lg text-white"><Scissors size={20} /></div>
          <h2 className="text-lg font-extrabold">Beleza & Gestão</h2>
          <button onClick={next} className="ml-auto text-primary font-bold text-sm">Pular</button>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="relative rounded-3xl overflow-hidden min-h-[400px] mb-8 shadow-2xl border-4 border-white">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAypwri0pjTAuaQ6QEDDUgIxlgoXw-ReDYymt4mH2EB_1cbsMNPeyDQes6iJxxrUYkZavacLCeZpa6WyPvqKZbQIFyHCUY6TX9bWesDlWw3oBJocp4bwH-Cj-w5cvvFIvNO4QYlWqciyNTYrJ1BeEaWo9Cb1BQCd5LvIjhmF9os2TKU9Bt6rg_XKV6HJCOLRFeQQchG2Teb-rITDc8dJWYd7EDSlTT1dF58UbKQkV9kqdfNHwiWoCcbUE2_YkzwpSABPeziZ2l3J3U" className="absolute inset-0 w-full h-full object-cover" alt="Salon" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
              <div className="flex gap-2 mb-4">
                <div className="h-1.5 w-10 rounded-full bg-primary"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-white/40"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-white/40"></div>
              </div>
            </div>
          </div>
          <div className="text-center space-y-4 mb-8">
            <span className="inline-block bg-rose-100 text-primary px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Destaque</span>
            <h1 className="text-3xl font-extrabold tracking-tight">Gestão Completa do seu Espaço</h1>
            <p className="text-slate-600 text-sm px-4">Organize sua equipe, estoque e agenda de forma intuitiva. Ganhe tempo para o que realmente importa: a beleza das suas clientes.</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2">
              <div className="text-primary"><Calendar size={20} /></div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Agendamento</span>
            </div>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex flex-col items-center gap-2">
              <div className="text-primary"><CreditCard size={20} /></div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Financeiro</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2">
              <div className="text-primary"><Users size={20} /></div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Equipe</span>
            </div>
          </div>

          <button onClick={next} className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mb-4">
            Próximo <ArrowRight size={20} />
          </button>
          
          <p className="text-center text-xs text-slate-500">
            Já possui uma conta? <button onClick={() => setStep(1)} className="text-primary font-bold">Entrar</button>
          </p>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-background-light flex flex-col">
        <div className="relative h-64 overflow-hidden">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRakmA1k2ekRowepKuM-0xzuJfSLmw0wAyVy0CRr996Sf3l97sW0O6ktxs0aVHSMkeMrGkE0qaEbzg0Jc-OkOEifq9Au0odTu1kXGCyUJgJQ67HV1Nsp-xuuknxB9YUjdWWDOXgjB-1D0Pf1_XCXnUGiZfyU5U6BhJeCFCeaSrkp80k3TwGa41z08_Z7a0vPARsuIhZpKEb864vHVOgT-mUPEfOb6ZRUQOEsltGLE1wXBXRrjk1D2_HcPEUvi6CcdB9oOzkoK7oTY" className="w-full h-full object-cover" alt="Salon" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-background-light to-transparent"></div>
        </div>
        <form onSubmit={handleLogin} className="px-8 pb-10 -mt-12 relative z-10 flex-1 flex flex-col">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg text-white">
              <Scissors size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">Entrar</h1>
          <p className="text-slate-600 text-center mb-8">Bem-vinda de volta ao Beleza & Gestão.</p>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100">{error}</div>}
          
          <div className="space-y-4 mb-8">
            <input 
              type="email" 
              placeholder="seu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary" 
              required
            />
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary" 
              required
            />
          </div>
          <div className="space-y-3">
            <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <button type="button" onClick={() => setStep(2)} className="w-full bg-slate-100 text-slate-900 font-bold h-12 rounded-xl border border-slate-200">
              Criar Nova Conta
            </button>
            <button type="button" onClick={() => setStep(0)} className="w-full text-slate-400 text-sm font-medium">Voltar</button>
          </div>
          <div className="mt-auto pt-8 text-center text-[10px] text-slate-400">
            Ao continuar, você concorda com nossos <br/>
            <span className="underline cursor-pointer">Termos de Serviço</span> e <span className="underline cursor-pointer">Política de Privacidade</span>.
          </div>
        </form>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-background-light flex flex-col">
        <div className="relative h-64 overflow-hidden">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRakmA1k2ekRowepKuM-0xzuJfSLmw0wAyVy0CRr996Sf3l97sW0O6ktxs0aVHSMkeMrGkE0qaEbzg0Jc-OkOEifq9Au0odTu1kXGCyUJgJQ67HV1Nsp-xuuknxB9YUjdWWDOXgjB-1D0Pf1_XCXnUGiZfyU5U6BhJeCFCeaSrkp80k3TwGa41z08_Z7a0vPARsuIhZpKEb864vHVOgT-mUPEfOb6ZRUQOEsltGLE1wXBXRrjk1D2_HcPEUvi6CcdB9oOzkoK7oTY" className="w-full h-full object-cover" alt="Salon" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-background-light to-transparent"></div>
        </div>
        <form onSubmit={handleRegister} className="px-8 pb-10 -mt-12 relative z-10 flex-1 flex flex-col">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg text-white">
              <Scissors size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">Criar Conta</h1>
          <p className="text-slate-600 text-center mb-8">Comece sua jornada hoje mesmo.</p>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100">{error}</div>}

          <div className="space-y-4 mb-8">
            <input 
              type="email" 
              placeholder="seu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary" 
              required
            />
            <input 
              type="password" 
              placeholder="•••••••• (mín. 6 caracteres)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary" 
              required
            />
          </div>
          <div className="space-y-3">
            <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50">
              {loading ? 'Criando...' : 'Criar Conta'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full bg-slate-100 text-slate-900 font-bold h-12 rounded-xl border border-slate-200">
              Já tenho uma conta
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-background-light flex flex-col p-6">
        <button onClick={() => setStep(2)} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-200 mb-4"><ArrowLeft size={24} /></button>
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-base font-bold">Configuração Inicial</h2>
          <span className="text-slate-500 text-xs">Passo 1 de 3</span>
        </div>
        <div className="h-2 w-full bg-primary/10 rounded-full mb-8 overflow-hidden">
          <div className="h-full w-1/3 bg-primary rounded-full"></div>
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Seja bem-vinda!</h1>
        <p className="text-slate-600 mb-8">Vamos começar com seu nome profissional.</p>
        <div className="space-y-6 flex-1">
          <div>
            <label className="block text-sm font-bold mb-2">Seu Nome Completo</label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="ex: Juliana Moraes" 
                className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary"
                value={profileData.full_name}
                onChange={e => setProfileData({...profileData, full_name: e.target.value})}
              />
            </div>
          </div>
        </div>
        <button onClick={next} className="w-full bg-primary text-white font-bold h-14 rounded-xl shadow-lg mt-8">Continuar</button>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-background-light flex flex-col p-6">
        <button onClick={back} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-200 mb-4"><ArrowLeft size={24} /></button>
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-base font-bold">Informações do Salão</h2>
          <span className="text-slate-500 text-xs">Passo 2 de 3</span>
        </div>
        <div className="h-2 w-full bg-primary/10 rounded-full mb-8 overflow-hidden">
          <div className="h-full w-2/3 bg-primary rounded-full"></div>
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Sobre o seu salão</h1>
        <p className="text-slate-600 mb-8">Forneça os detalhes que seus clientes verão ao agendar.</p>
        <div className="space-y-6 flex-1">
          <div>
            <label className="block text-sm font-bold mb-2">Nome do Salão</label>
            <div className="relative">
              <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="ex: Blossom Hair & Spa" 
                className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary"
                value={profileData.salon_name}
                onChange={e => setProfileData({...profileData, salon_name: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Endereço / Cidade</label>
            <div className="relative">
              <Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="ex: Rua das Flores, 123" 
                className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-primary"
                value={profileData.salon_address}
                onChange={e => setProfileData({...profileData, salon_address: e.target.value})}
              />
            </div>
          </div>
        </div>
        <button onClick={next} className="w-full bg-primary text-white font-bold h-14 rounded-xl shadow-lg mt-8">Continuar</button>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div className="min-h-screen bg-background-light flex flex-col p-6 items-center justify-center text-center">
        <div className="size-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <Sparkles size={40} />
        </div>
        <h1 className="text-3xl font-extrabold mb-4">Tudo Pronto!</h1>
        <p className="text-slate-600 mb-12">Seu salão foi configurado com sucesso. Agora você pode começar a gerenciar seus agendamentos.</p>
        <button 
          onClick={saveProfile} 
          disabled={loading}
          className="w-full bg-primary text-white font-bold h-14 rounded-xl shadow-lg disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Acessar Dashboard'}
        </button>
      </div>
    );
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'appointment' | 'client' | 'service'>('appointment');
  const [modalShowTabs, setModalShowTabs] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const openModal = (type: 'appointment' | 'client' | 'service' = 'appointment', showTabs: boolean = true) => {
    setModalType(type);
    setModalShowTabs(showTabs);
    setIsModalOpen(true);
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshData = () => setRefreshKey(prev => prev + 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Onboarding onComplete={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-background-light font-sans antialiased md:flex">
      {/* Navigation Component - Handles both mobile and desktop (sidebar) views inside */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} onNewRecord={() => openModal('appointment')} />
      
      {/* Main Content Area - Left margin on desktop to leave space for fixed sidebar */}
      <main className="md:ml-64 flex-1 transition-all duration-300 relative min-h-screen overflow-x-hidden">
        <div className="max-w-7xl mx-auto md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${refreshKey}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard user={user} />}
              {activeTab === 'agenda' && <Agenda />}
              {activeTab === 'services' && <Services onAdd={() => openModal('service', false)} />}
              {activeTab === 'clients' && <Clients onAdd={() => openModal('client', false)} />}
              {activeTab === 'settings' && <SettingsScreen user={user} onUpdate={refreshData} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <NewRecordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={user} 
        onSave={refreshData}
        initialType={modalType}
        showTabs={modalShowTabs}
      />
    </div>
  );
}
