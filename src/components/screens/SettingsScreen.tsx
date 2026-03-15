import React, { useState, useEffect } from 'react';
import { 
  User, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronRight, 
  Bell, 
  Shield, 
  Share2,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Image as ImageIcon,
  ArrowLeft,
  Info,
  CalendarDays,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { User as AuthUser } from '@supabase/supabase-js';

interface SettingsScreenProps {
  user: AuthUser;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
  salonName: string;
}

const Switch: React.FC<{ active: boolean; onChange: () => void }> = ({ active, onChange }) => (
  <button 
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${active ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
  >
    <div className={`absolute top-1 size-4 bg-white rounded-full transition-all duration-300 ${active ? 'left-7' : 'left-1'}`}></div>
  </button>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  user, 
  isDarkMode, 
  toggleDarkMode, 
  onLogout,
  salonName 
}) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(localStorage.getItem('biometric_enabled') === 'true');
  const [notificationsEnabled, setNotificationsEnabled] = useState(localStorage.getItem('notifications_enabled') !== 'false');
  
  // Edit states
  const [isEditingSalonName, setIsEditingSalonName] = useState(false);
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [newSalonName, setNewSalonName] = useState('');
  const [tempHours, setTempHours] = useState<any>(null);

  const toggleBiometric = () => {
    const newValue = !biometricEnabled;
    setBiometricEnabled(newValue);
    localStorage.setItem('biometric_enabled', String(newValue));
  };

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('notifications_enabled', String(newValue));
  };

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => {
        setProfile(data);
        if (data) {
          setNewSalonName(data.salon_name || salonName);
          setTempHours(data.business_hours || {
            monday: { open: '09:00', close: '18:00', active: true },
            tuesday: { open: '09:00', close: '18:00', active: true },
            wednesday: { open: '09:00', close: '18:00', active: true },
            thursday: { open: '09:00', close: '18:00', active: true },
            friday: { open: '09:00', close: '18:00', active: true },
            saturday: { open: '09:00', close: '15:00', active: true },
            sunday: { open: '00:00', close: '00:00', active: false },
          });
        }
      });
  }, [user.id]);

  const updateProfile = async (field: string, value: any) => {
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', user.id);
    if (!error) setProfile({ ...profile, [field]: value });
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile('avatar_url', publicUrl);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const bookingLink = `${window.location.origin}/booking?s=${user.id}`;
  const shareBookingLink = async () => {
    const shareData = {
      title: profile?.salon_name || salonName,
      text: `Agende seu horário no ${profile?.salon_name || salonName}:`,
      url: bookingLink,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(bookingLink);
        alert('Link de agendamento copiado para a área de transferência!');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(bookingLink);
        alert('Link de agendamento copiado!');
      }
    }
  };

  const menuGroups = [
    {
      title: 'Negócio',
      items: [
        { id: 'salon', label: 'Nome do Salão', value: profile?.salon_name || salonName, icon: MapPin, action: () => setIsEditingSalonName(true) },
        { id: 'hours', label: 'Horário de Funcionamento', value: 'Ver detalhes', icon: Clock, action: () => setIsEditingHours(true) },
        { id: 'bookings', label: 'Link de Agendamento', value: 'Clique para compartilhar', icon: Share2, action: shareBookingLink },
      ]
    },
    {
      title: 'App',
      items: [
        { id: 'theme', label: 'Modo Escuro', value: isDarkMode ? 'Ativado' : 'Desativado', icon: isDarkMode ? Moon : Sun, action: toggleDarkMode, type: 'toggle', active: isDarkMode },
        { id: 'biometric', label: 'Face ID / Biometria', value: biometricEnabled ? 'Ativado' : 'Desativado', icon: Shield, action: toggleBiometric, type: 'toggle', active: biometricEnabled },
        { id: 'notifs', label: 'Notificações', value: notificationsEnabled ? 'Ativado' : 'Desativado', icon: Bell, action: toggleNotifications, type: 'toggle', active: notificationsEnabled },
      ]
    }
  ];

  return (
    <div className="pb-24">
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Ajustes</h2>

        {/* Profile Section */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-slate-100 dark:border-border-dark mb-8 flex flex-col md:flex-row items-center gap-6 group transition-colors shadow-sm">
          <div className="relative">
            <div className="size-24 rounded-3xl bg-slate-50 dark:bg-background-dark border-2 border-primary overflow-hidden flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-slate-300" />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 size-8 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white dark:border-surface-dark cursor-pointer hover:scale-110 active:scale-95 transition-all">
              <ImageIcon size={14} />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{profile?.full_name || user.email?.split('@')[0]}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-4">{user.email}</p>
            <button className="px-4 py-2 bg-slate-50 dark:bg-background-dark text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest">
              Editar Perfil
            </button>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="space-y-8">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-1">{group.title}</p>
              <div className="bg-white dark:bg-surface-dark rounded-[32px] border border-slate-100 dark:border-border-dark overflow-hidden transition-colors shadow-sm">
                {group.items.map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    className={`w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-background-dark transition-all group ${i !== group.items.length - 1 ? 'border-b border-slate-50 dark:border-border-dark' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-slate-50 dark:bg-background-dark flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <item.icon size={20} />
                      </div>
                      <span className="text-slate-700 dark:text-slate-200 font-bold text-sm">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.type === 'toggle' ? (
                        <Switch active={item.active || false} onChange={item.action || (() => {})} />
                      ) : (
                        <>
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{item.value}</span>
                          <ChevronRight size={16} className="text-slate-300" />
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 p-5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-[32px] font-black hover:bg-rose-500 hover:text-white transition-all active:scale-95"
            >
              <LogOut size={20} /> Sair do App
            </button>
            <p className="text-center text-[10px] uppercase font-black text-slate-300 dark:text-slate-700 tracking-tighter">
              Versão 2.4.0 • Beleza & Gestão
            </p>
          </div>
        </div>
      </div>

      {/* Edit Salon Name Modal */}
      <AnimatePresence>
        {isEditingSalonName && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingSalonName(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-surface-dark rounded-[32px] shadow-2xl p-8"
            >
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Nome do Salão</h3>
              <div className="space-y-4">
                <input 
                  type="text"
                  value={newSalonName}
                  onChange={(e) => setNewSalonName(e.target.value)}
                  placeholder="Ex: Studio VIP"
                  className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-border-dark outline-none focus:border-primary transition-all dark:text-white font-bold"
                />
                <button 
                  onClick={() => {
                    updateProfile('salon_name', newSalonName);
                    setIsEditingSalonName(false);
                  }}
                  disabled={loading}
                  className="w-full h-14 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all uppercase text-sm"
                >
                  {loading ? 'Salvando...' : 'Salvar Alteração'}
                </button>
                <button 
                  onClick={() => setIsEditingSalonName(false)}
                  className="w-full h-14 bg-slate-50 dark:bg-background-dark text-slate-500 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Business Hours Modal */}
      <AnimatePresence>
        {isEditingHours && tempHours && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingHours(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-[100dvh] md:h-[90vh] md:rounded-[32px] bg-white dark:bg-background-dark shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-primary/10">
                <button 
                  onClick={() => setIsEditingHours(false)}
                  className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center hover:bg-primary/10 rounded-full transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 ml-4">
                  Alterar Horário de Funcionamento
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                {/* Info Card */}
                <div className="p-4">
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-2">
                    <div className="flex items-start gap-3">
                      <Info className="text-primary shrink-0" size={20} />
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        Defina os horários em que o salão estará aberto para agendamentos. Dias desmarcados aparecerão como "Fechado" para os clientes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sincronizar Action */}
                <div className="px-4 mb-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">Sincronizar</p>
                        <p className="text-[10px] font-bold text-slate-500">Usar horários da segunda em todos</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const base = tempHours.monday;
                        const newH = { ...tempHours };
                        Object.keys(newH).forEach(d => {
                          if (newH[d].active) {
                            newH[d] = { ...newH[d], open: base.open, close: base.close };
                          }
                        });
                        setTempHours(newH);
                      }}
                      className="px-4 py-2 bg-primary text-white text-[10px] font-black rounded-lg hover:bg-primary/90 transition-all uppercase tracking-widest"
                    >
                      Reproduzir
                    </button>
                  </div>
                </div>

                {/* Days List */}
                <div className="flex flex-col gap-3 px-4">
                  {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
                    const dayLabels: any = {
                      monday: 'Segunda-feira',
                      tuesday: 'Terça-feira',
                      wednesday: 'Quarta-feira',
                      thursday: 'Quinta-feira',
                      friday: 'Sexta-feira',
                      saturday: 'Sábado',
                      sunday: 'Domingo'
                    };

                    const isActive = tempHours[day].active;

                    return (
                      <div 
                        key={day} 
                        className={`flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300 ${
                          isActive 
                            ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm' 
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-3 ${!isActive && 'opacity-60'}`}>
                            <div className={`${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'} p-2 rounded-lg transition-colors`}>
                              <CalendarDays size={20} />
                            </div>
                            <p className="text-slate-900 dark:text-slate-100 text-base font-bold">{dayLabels[day]}</p>
                          </div>
                          
                          <label className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-all ${
                            isActive ? 'bg-primary justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'
                          }`}>
                            <div className="h-full w-[27px] rounded-full bg-white shadow-md"></div>
                            <input 
                              type="checkbox"
                              checked={isActive}
                              onChange={() => {
                                setTempHours({
                                  ...tempHours,
                                  [day]: { ...tempHours[day], active: !isActive }
                                });
                              }}
                              className="invisible absolute"
                            />
                          </label>
                        </div>

                        {isActive ? (
                          <div className="grid grid-cols-2 gap-4 mt-2 animate-in fade-in slide-in-from-top-1">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Abertura</label>
                              <input 
                                type="time" 
                                value={tempHours[day].open}
                                onChange={(e) => {
                                  setTempHours({
                                    ...tempHours,
                                    [day]: { ...tempHours[day], open: e.target.value }
                                  });
                                }}
                                className="w-full h-12 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:border-primary focus:ring-primary font-bold px-3 transition-all"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fechamento</label>
                              <input 
                                type="time" 
                                value={tempHours[day].close}
                                onChange={(e) => {
                                  setTempHours({
                                    ...tempHours,
                                    [day]: { ...tempHours[day], close: e.target.value }
                                  });
                                }}
                                className="w-full h-12 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:border-primary focus:ring-primary font-bold px-3 transition-all"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 text-center py-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest text-[10px]">Estabelecimento fechado</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-background-dark p-4 border-t border-primary/10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <button 
                  onClick={() => {
                    updateProfile('business_hours', tempHours);
                    setIsEditingHours(false);
                  }}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20"
                >
                  <Save size={20} />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsScreen;
