import React, { useState, useEffect } from 'react';
import { 
  Utensils, Plus, Search, TrendingUp, 
  Clock, Flame, Apple, Brain, 
  ChevronRight, Trash2, Loader2, PieChart as PieChartIcon,
  BarChart3, Camera, Sparkles
} from 'lucide-react';
import { Card, HeaderTitle } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, limit, orderBy } from 'firebase/firestore';
import { NutritionLog, MacroNutrients } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { estimateFoodMacros, generateAIMealPlan } from '../services/gemini';

export default function Nutrition() {
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [foodInput, setFoodInput] = useState('');
  const [estimating, setEstimating] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);

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
        const existingLog = logs.find(l => l.date === today);

        if (existingLog) {
          // Update existing log logic would go here
          // For simplicity, we'll just add a new log entry for now
        }

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
    <div className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
            <HeaderTitle text="NUTRIÇÃO AI" />
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-80">
            Monitoramento inteligente de dieta.
          </p>
        </div>
        <button 
          onClick={() => setGeneratingPlan(true)}
          className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-105 transition-all"
        >
          <Sparkles size={18} /> Gerar Plano Diário
        </button>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
                O que você <span className="text-red-600">comeu?</span>
              </h3>
              <div className="flex gap-2">
                <button className="p-3 bg-secondary/30 rounded-xl text-muted-foreground hover:text-foreground transition-all">
                  <Camera size={20} />
                </button>
              </div>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="EX: 200G DE FRANGO GRELHADO E 150G DE ARROZ..."
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                className="flex-1 px-6 py-4 bg-secondary/30 border border-border rounded-2xl text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-red-600 transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleEstimate()}
              />
              <button 
                onClick={handleEstimate}
                disabled={estimating}
                className="px-8 py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
              >
                {estimating ? <Loader2 className="animate-spin" size={20} /> : 'LOG'}
              </button>
            </div>
          </Card>

          <section className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
              Refeições de <span className="text-red-600">Hoje</span>
            </h2>
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
                    <Card className="p-6 flex items-center justify-between group hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center shadow-inner">
                          <Apple className="text-red-600" size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none mb-2">{log.meals[0]?.name}</span>
                          <div className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Clock size={12} /> {log.meals[0]?.time}</span>
                            <span className="flex items-center gap-1.5"><Flame size={12} /> {log.meals[0]?.macros.calories} kcal</span>
                            <span className="flex items-center gap-1.5 text-red-600">P: {log.meals[0]?.macros.protein}g</span>
                            <span className="flex items-center gap-1.5 text-blue-600">C: {log.meals[0]?.macros.carbs}g</span>
                            <span className="flex items-center gap-1.5 text-yellow-600">G: {log.meals[0]?.macros.fat}g</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteLog(log.id!)}
                        className="p-3 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <Card className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">Distribuição</h3>
              <PieChartIcon className="text-muted-foreground/40" size={18} />
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {chartData.map((macro) => (
                <div key={macro.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: macro.color }} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{macro.name}</span>
                  </div>
                  <span className="text-xs font-black italic text-foreground">{macro.value} kcal</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 space-y-6">
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">Resumo Diário</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase italic tracking-widest">
                  <span className="text-muted-foreground">Calorias</span>
                  <span className="text-foreground">{dailyTotals.calories} / 2500 kcal</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]" 
                    style={{ width: `${Math.min((dailyTotals.calories / 2500) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <span className="block text-lg font-black italic tracking-tighter text-foreground">{dailyTotals.protein}g</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Prot</span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-black italic tracking-tighter text-foreground">{dailyTotals.carbs}g</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Carb</span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-black italic tracking-tighter text-foreground">{dailyTotals.fat}g</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Gord</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
