import React, { useState, useEffect } from 'react';
import { 
  Utensils, ArrowLeft, Menu, TrendingUp, 
  Clock, Flame, Apple, Brain, 
  ChevronRight, Trash2, Loader2, PieChart as PieChartIcon,
  BarChart3, Camera, Sparkles, RefreshCw, Plus
} from 'lucide-react';
import { Card } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, limit, orderBy } from 'firebase/firestore';
import { NutritionLog } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { estimateFoodMacros } from '../services/gemini';

export default function Nutrition() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [foodInput, setFoodInput] = useState('');
  const [estimating, setEstimating] = useState(false);

  useEffect(() => {
    const fetchNutritionData = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, 'nutrition_logs'), 
          where('studentId', '==', auth.currentUser.uid),
          orderBy('date', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NutritionLog)));
      } catch (error) {
        console.error("Error fetching nutrition data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionData();
  }, []);

  const dailyTotals = logs[0]?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const chartData = [
    { name: 'Proteína', value: dailyTotals.protein * 4, color: '#dc2626' },
    { name: 'Carbo', value: dailyTotals.carbs * 4, color: '#2563eb' },
    { name: 'Gordura', value: dailyTotals.fat * 9, color: '#eab308' },
  ];

  const handleEstimate = async () => {
    if (!foodInput.trim() || !auth.currentUser) return;
    setEstimating(true);
    try {
      const macros = await estimateFoodMacros(foodInput);
      if (macros) {
        const today = new Date().toISOString().split('T')[0];
        const newLog: Omit<NutritionLog, 'id'> = {
          studentId: auth.currentUser.uid,
          date: today,
          meals: [{
            name: foodInput,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            items: [foodInput],
            macros: macros
          }],
          totals: {
            calories: dailyTotals.calories + macros.calories,
            protein: dailyTotals.protein + macros.protein,
            carbs: dailyTotals.carbs + macros.carbs,
            fat: dailyTotals.fat + macros.fat
          }
        };
        const docRef = await addDoc(collection(db, 'nutrition_logs'), newLog);
        setLogs([{ id: docRef.id, ...newLog }, ...logs]);
        setFoodInput('');
      }
    } catch (error) {
      console.error("Error estimating macros:", error);
    } finally {
      setEstimating(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'nutrition_logs', id));
      setLogs(logs.filter(l => l.id !== id));
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 sm:p-10 space-y-8 max-w-3xl mx-auto relative pb-20">
      {/* Status Bar */}
      <div className="absolute top-6 right-6 flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl z-10">
        <RefreshCw size={12} className="text-white/40 animate-spin" />
        <span className="text-[9px] font-black tracking-widest text-white/60 uppercase">CARREGANDO...</span>
      </div>

      <header className="flex items-center justify-between pt-4 mb-12">
        <div className="flex items-center gap-4">
          <button className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
            <Menu size={20} />
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black italic tracking-tighter uppercase">NUTRIÇÃO <span className="text-red-600">AI</span></span>
        </div>
      </header>

      {/* Input Section */}
      <Card className="p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-1 h-3 bg-red-600 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">O QUE VOCÊ COMEU?</span>
            </div>
            <Sparkles size={18} className="text-red-600/40" />
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="EX: 200G DE FRANGO E 150G DE ARROZ..."
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-red-600 transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && handleEstimate()}
            />
            <button 
              onClick={handleEstimate}
              disabled={estimating}
              className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
            >
              {estimating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={24} />}
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-8 bg-white/[0.03] border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black italic tracking-widest uppercase">DISTRIBUIÇÃO</h3>
            <PieChartIcon size={16} className="text-white/20" />
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {chartData.map((macro) => (
              <div key={macro.name} className="text-center">
                <div className="w-1 h-1 rounded-full mx-auto mb-1" style={{ backgroundColor: macro.color }} />
                <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">{macro.name}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 bg-white/[0.03] border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black italic tracking-widest uppercase">RESUMO</h3>
            <Flame size={16} className="text-red-600/40" />
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">CALORIAS</span>
                <span className="text-white">{dailyTotals.calories} / 2500</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]" 
                  style={{ width: `${Math.min((dailyTotals.calories / 2500) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <span className="block text-lg font-black italic tracking-tighter text-white">{dailyTotals.protein}g</span>
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">PROT</span>
              </div>
              <div className="text-center">
                <span className="block text-lg font-black italic tracking-tighter text-white">{dailyTotals.carbs}g</span>
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">CARB</span>
              </div>
              <div className="text-center">
                <span className="block text-lg font-black italic tracking-tighter text-white">{dailyTotals.fat}g</span>
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">GORD</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Meal List */}
      <div className="space-y-6 pt-8">
        <div className="flex items-center gap-3 text-white/40">
          <Utensils size={18} />
          <h3 className="text-sm font-black uppercase tracking-[0.3em]">REFEIÇÕES</h3>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {logs.map((log, idx) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-6 bg-white/[0.03] border-white/10 group relative overflow-hidden">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-600">
                      <Apple size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-black italic uppercase tracking-tighter">{log.meals[0]?.name}</h4>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{log.meals[0]?.time}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
                        <span className="text-white/60">{log.meals[0]?.macros.calories} KCAL</span>
                        <span className="text-red-600">P: {log.meals[0]?.macros.protein}G</span>
                        <span className="text-blue-600">C: {log.meals[0]?.macros.carbs}G</span>
                        <span className="text-yellow-600">G: {log.meals[0]?.macros.fat}G</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteLog(log.id!)}
                      className="p-3 text-white/20 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
