import React from 'react';
import { 
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification as AppNotification } from '../../types';

interface NotificationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
}

const NotificationOverlay: React.FC<NotificationOverlayProps> = ({ 
  isOpen, 
  onClose, 
  notifications,
  onMarkRead 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose}></div>
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-16 right-4 w-80 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-slate-100 dark:border-border-dark z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-50 dark:border-border-dark flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Notificações</h3>
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {notifications.filter(n => !n.read).length} Novas
              </span>
            </div>
            <div className="max-h-96 overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto text-slate-200 dark:text-slate-700 mb-2" size={32} />
                  <p className="text-slate-400 dark:text-slate-500 text-sm">Tudo limpo por aqui!</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => onMarkRead(n.id)}
                    className={`p-4 border-b border-slate-50 dark:border-border-dark cursor-pointer transition-colors ${!n.read ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-background-dark'}`}
                  >
                    <div className="flex gap-3">
                      <div className={`size-2 rounded-full mt-2 shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`}></div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{n.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2">Agora mesmo</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="w-full p-3 text-xs font-bold text-primary hover:bg-slate-50 dark:hover:bg-background-dark transition-colors border-t border-slate-50 dark:border-border-dark">
              Ver todas as notificações
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationOverlay;
