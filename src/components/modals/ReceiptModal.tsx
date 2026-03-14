import React from 'react';
import { 
  Scissors, 
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment } from '../../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  isDarkMode: boolean;
  salonName: string;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ 
  isOpen, 
  onClose, 
  appointment, 
  salonName
}) => {
  if (!appointment) return null;

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatDate(appointment.date);

  const handleShare = async () => {
    const text = `🌸 Confirmação de Atendimento – ${salonName}\n\n` +
                 `Olá, ${appointment.client_name} ! Tudo bem? 😊\n` +
                 `Seu atendimento foi registrado com sucesso.\n\n` +
                 `💅 Serviço realizado: ${appointment.service_name}\n` +
                 `📅 Data: ${formattedDate}\n` +
                 `💰 Valor: R$ ${appointment.price?.toFixed(2)}\n\n` +
                 `Agradecemos pela confiança no nosso trabalho.\n` +
                 `Será sempre um prazer cuidar da sua beleza! ✨\n\n` +
                 `💖 ${salonName}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Recibo - Beleza & Gestão',
          text: text,
        });
      } catch (err) {
        console.log('Erro ao compartilhar:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Recibo copiado para a área de transferência!');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-surface-dark w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl transition-colors"
          >
            <div className="p-8 relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.1] pointer-events-none rotate-[-30deg]">
                <Scissors size={200} className="text-primary" />
              </div>

              <div className="text-center mb-8 relative">
                <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-4">
                  <Scissors size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Comprovante</h2>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Beleza & Gestão</p>
              </div>

              <div className="space-y-6 relative border-t border-dashed border-slate-200 dark:border-slate-800 pt-6">
                <div className="bg-slate-50 dark:bg-background-dark p-6 rounded-3xl text-center mb-6">
                  <p className="text-slate-800 dark:text-white font-medium">
                    Olá, <span className="font-bold">{appointment.client_name}</span>! Tudo bem? 😊
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Seu atendimento foi registrado com sucesso.</p>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 block mb-1">Serviço</label>
                    <p className="text-base font-bold text-slate-700 dark:text-slate-300">{appointment.service_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{appointment.date} • {appointment.time}</p>
                  </div>
                  <div className="text-right">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 block mb-1">Valor</label>
                    <p className="text-xl font-black text-primary">R$ {appointment.price?.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-3xl text-center border border-primary/10">
                  <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                    Agradecemos pela confiança no nosso trabalho.<br/>
                    Será sempre um prazer cuidar da sua beleza! ✨
                  </p>
                  <p className="text-primary font-black mt-4 uppercase tracking-tighter">💖 {salonName}</p>
                </div>
              </div>

              <div className="mt-8 flex gap-3 relative">
                <button 
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Fechar
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Share2 size={18} /> Compartilhar
                </button>
              </div>
            </div>
            
            <div className="h-2 bg-gradient-to-r from-primary to-rose-500"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReceiptModal;
