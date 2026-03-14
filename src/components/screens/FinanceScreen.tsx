import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { Expense } from '../../types';
import { User } from '@supabase/supabase-js';
import { formatDate } from '../../utils/format';

interface FinanceScreenProps {
  user: User;
  isDarkMode: boolean;
  refreshKey: number;
}

const FinanceScreen: React.FC<FinanceScreenProps> = ({ user, refreshKey }) => {
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Aluguel' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Revenue
      const { data: apts } = await supabase
        .from('appointments')
        .select('*, service:service_id(price)')
        .eq('status', 'completed');
      
      const rev = apts?.reduce((acc, apt: any) => acc + (apt.service?.price || 0), 0) || 0;
      setRevenue(rev);

      // Fetch Expenses
      const { data: exp } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      setExpenses(exp || []);
    };

    fetchData();
  }, [user.id, refreshKey]);

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      date: new Date().toISOString().split('T')[0]
    });

    if (!error) {
      setNewExpense({ description: '', amount: '', category: 'Aluguel' });
      setShowAddExpense(false);
      // Refresh expenses
      const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      setExpenses(data || []);
    }
    setLoading(false);
  };

  const deleteExpense = async (id: string) => {
    if (!confirm('Excluir esta despesa?')) return;
    await supabase.from('expenses').delete().eq('id', id);
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netProfit = revenue - totalExpenses;

  return (
    <div className="pb-24">
      <div className="bg-white dark:bg-surface-dark p-6 transition-colors border-b border-slate-200 dark:border-border-dark">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Finanças</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary p-6 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 size-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Saldo para Receber</p>
            <h3 className="text-3xl font-black truncate">R$ {netProfit.toFixed(2)}</h3>
            <div className="flex items-center gap-1.5 mt-3 text-xs font-bold bg-white/20 w-fit px-2 py-1 rounded-lg">
              <TrendingUp size={12} /> +12% esse mês
            </div>
          </div>

          <div className="bg-emerald-500/10 dark:bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/20 dark:border-emerald-500/10">
            <div className="flex items-center gap-3 mb-2 text-emerald-600 dark:text-emerald-400">
              <div className="p-2 bg-emerald-500/20 rounded-xl"><ArrowUpRight size={20} /></div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Total Faturado</p>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">R$ {revenue.toFixed(2)}</h3>
          </div>

          <div className="bg-rose-500/10 dark:bg-rose-500/5 p-6 rounded-3xl border border-rose-500/20 dark:border-rose-500/10">
            <div className="flex items-center gap-3 mb-2 text-rose-600 dark:text-rose-400">
              <div className="p-2 bg-rose-500/20 rounded-xl"><ArrowDownRight size={20} /></div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Total Despesas</p>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">R$ {totalExpenses.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
            Histórico <span className="text-slate-400 dark:text-slate-500 text-xs font-medium bg-slate-100 dark:bg-background-dark px-2 py-0.5 rounded-lg">{expenses.length}</span>
          </h4>
          <div className="flex gap-2">
            <button className="p-2.5 bg-slate-100 dark:bg-background-dark rounded-xl text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"><Filter size={18} /></button>
            <button 
              onClick={() => setShowAddExpense(true)}
              className="px-4 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-700 dark:hover:bg-slate-100 transition-all active:scale-95"
            >
              <Plus size={16} /> Nova Despesa
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-surface-dark rounded-3xl border border-slate-100 dark:border-border-dark">
              <div className="size-16 bg-slate-50 dark:bg-background-dark rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Wallet size={32} />
              </div>
              <p className="text-slate-500 font-bold">Nenhuma despesa registrada.</p>
            </div>
          ) : (
            expenses.map((exp) => (
              <motion.div 
                key={exp.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark rounded-2xl border border-slate-50 dark:border-border-dark shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`size-10 rounded-xl flex items-center justify-center ${exp.amount > 100 ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    <TrendingDown size={18} />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-bold text-sm">{exp.description}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{exp.category} • {formatDate(exp.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-rose-500 font-black text-sm">- R$ {exp.amount.toFixed(2)}</p>
                  <button 
                    onClick={() => deleteExpense(exp.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddExpense && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddExpense(false)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-surface-dark rounded-[32px] shadow-2xl overflow-hidden p-8"
            >
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Nova Despesa</h3>
              <form onSubmit={addExpense} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Descrição</label>
                  <input 
                    required
                    placeholder="ex: Produtos de Limpeza" 
                    value={newExpense.description}
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-border-dark outline-none focus:border-primary transition-all dark:text-white text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Valor (R$)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    placeholder="0,00" 
                    value={newExpense.amount}
                    onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-border-dark outline-none focus:border-primary transition-all dark:text-white text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Categoria</label>
                  <select 
                    value={newExpense.category}
                    onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-border-dark outline-none focus:border-primary transition-all dark:text-white text-sm font-bold"
                  >
                    <option value="Aluguel">Aluguel</option>
                    <option value="Produtos">Produtos</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="flex-1 h-12 rounded-xl text-slate-500 font-bold"
                  >
                    Cancelar
                  </button>
                  <button 
                    disabled={loading}
                    className="flex-[2] h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? 'Adicionando...' : 'Salvar Despesa'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinanceScreen;
