import React, { useState, useEffect } from 'react';
import { 
  Footprints, Plus, Search, TrendingUp, 
  Clock, MapPin, Zap, Target, 
  ChevronRight, Trash2, Loader2, BarChart3,
  Timer, Activity, Flame, Heart
} from 'lucide-react';
import { Card, HeaderTitle } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, limit, orderBy } from 'firebase/firestore';
import { RunningStats } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function RunTrack() {
  const [runs, setRuns] = useState<RunningStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLogging, setIsLogging] = useState(false);
  const [newRun, setNewRun] = useState({
    distance: '',
    duration: '',
    pace: '',
    heartRate: '',
    calories: ''
  });

  useEffect(() => {
    const fetchRuns = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, 'running_stats'), 
          where('studentId', '==', auth.currentUser.uid),
          orderBy('date', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        setRuns(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RunningStats)));
      } catch (error) {
        console.error("Error fetching runs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, []);

  const paceData = runs.slice().reverse().map(run => ({
    date: new Date(run.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    pace: parseFloat(run.pace.replace(':', '.'))
  }));

  const handleAddRun = async () => {
    if (!auth.currentUser) return;
    try {
      const runData: Omit<RunningStats, 'id'> = {
        studentId: auth.currentUser.uid,
        date: new Date().toISOString(),
        distance: parseFloat(newRun.distance),
        duration: parseInt(newRun.duration),
        pace: newRun.pace,
        heartRate: parseInt(newRun.heartRate),
        calories: parseInt(newRun.calories)
      };
      const docRef = await addDoc(collection(db, 'running_stats'), runData);
      setRuns([{ id: docRef.id, ...runData }, ...runs]);
      setIsLogging(false);
      setNewRun({ distance: '', duration: '', pace: '', heartRate: '', calories: '' });
    } catch (error) {
      console.error("Error adding run:", error);
    }
  };

  const handleDeleteRun = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'running_stats', id));
      setRuns(runs.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting run:", error);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
            <HeaderTitle text="ABFIT RUN" />
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-80">
            Performance e monitoramento de corrida.
          </p>
        </div>
        <button 
          onClick={() => setIsLogging(true)}
          className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-105 transition-all"
        >
          <Plus size={18} /> Registrar Corrida
        </button>
      </header>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2 group hover:border-red-600/50 transition-all">
          <Footprints className="text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-3xl font-black italic tracking-tighter text-foreground leading-none">124km</span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Distância Total</span>
        </Card>
        <Card className="p-6 space-y-2 group hover:border-red-600/50 transition-all">
          <Timer className="text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-3xl font-black italic tracking-tighter text-foreground leading-none">4:45</span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Melhor Pace</span>
        </Card>
        <Card className="p-6 space-y-2 group hover:border-red-600/50 transition-all">
          <Heart className="text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-3xl font-black italic tracking-tighter text-foreground leading-none">162</span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">FC Média</span>
        </Card>
        <Card className="p-6 space-y-2 group hover:border-red-600/50 transition-all">
          <Flame className="text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-3xl font-black italic tracking-tighter text-foreground leading-none">8.4k</span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Kcal Queimadas</span>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">Evolução de Pace</h3>
              <BarChart3 className="text-muted-foreground/40" size={18} />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={paceData}>
                  <defs>
                    <linearGradient id="colorPace" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#888" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    reversed
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pace" 
                    stroke="#dc2626" 
                    fillOpacity={1} 
                    fill="url(#colorPace)" 
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <section className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
              Histórico de <span className="text-red-600">Corridas</span>
            </h2>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {runs.map((run, idx) => (
                  <motion.div
                    key={run.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="p-6 flex items-center justify-between group hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center shadow-inner">
                          <Activity className="text-red-600" size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none mb-2">{run.distance}km</span>
                          <div className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Clock size={12} /> {run.duration} min</span>
                            <span className="flex items-center gap-1.5"><Zap size={12} /> {run.pace} min/km</span>
                            <span className="flex items-center gap-1.5"><Heart size={12} /> {run.heartRate} bpm</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(run.date).toLocaleDateString('pt-BR')}</span>
                        <button 
                          onClick={() => handleDeleteRun(run.id!)}
                          className="p-3 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <Card className="p-8 space-y-6 bg-gradient-to-br from-card to-red-600/5 border-red-600/20">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
                Próximo <span className="text-red-600">Desafio</span>
              </h3>
              <Target className="text-red-600/40" size={18} />
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                <p className="text-[10px] font-black uppercase italic tracking-widest text-red-600 mb-2">Meia Maratona RJ</p>
                <p className="text-xs font-bold text-muted-foreground leading-relaxed">Faltam 45 dias para o seu objetivo principal de 21km.</p>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="w-[65%] h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]" />
              </div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-center">65% do treinamento concluído</p>
            </div>
          </Card>

          <Card className="p-8 space-y-6">
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
              Zonas de <span className="text-red-600">Treino</span>
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Z1 - Recuperação', range: '110-125', color: 'bg-emerald-500' },
                { label: 'Z2 - Aeróbico', range: '126-140', color: 'bg-blue-500' },
                { label: 'Z3 - Tempo', range: '141-155', color: 'bg-yellow-500' },
                { label: 'Z4 - Limiar', range: '156-170', color: 'bg-orange-500' },
                { label: 'Z5 - Anaeróbico', range: '171+', color: 'bg-red-600' },
              ].map((zone) => (
                <div key={zone.label} className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${zone.color}`} />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{zone.label}</span>
                  </div>
                  <span className="text-[10px] font-black italic tracking-tighter text-foreground">{zone.range} bpm</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {isLogging && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsLogging(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                    Registrar <span className="text-red-600">Corrida</span>
                  </h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4">Insira os dados da sua sessão</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Distância (km)</label>
                    <input
                      type="number"
                      value={newRun.distance}
                      onChange={(e) => setNewRun({...newRun, distance: e.target.value})}
                      className="w-full px-6 py-4 bg-secondary/30 border border-border rounded-2xl text-sm font-black italic focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Duração (min)</label>
                    <input
                      type="number"
                      value={newRun.duration}
                      onChange={(e) => setNewRun({...newRun, duration: e.target.value})}
                      className="w-full px-6 py-4 bg-secondary/30 border border-border rounded-2xl text-sm font-black italic focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Pace (min/km)</label>
                    <input
                      type="text"
                      placeholder="4:45"
                      value={newRun.pace}
                      onChange={(e) => setNewRun({...newRun, pace: e.target.value})}
                      className="w-full px-6 py-4 bg-secondary/30 border border-border rounded-2xl text-sm font-black italic focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">FC Média (bpm)</label>
                    <input
                      type="number"
                      value={newRun.heartRate}
                      onChange={(e) => setNewRun({...newRun, heartRate: e.target.value})}
                      className="w-full px-6 py-4 bg-secondary/30 border border-border rounded-2xl text-sm font-black italic focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddRun}
                  className="w-full py-5 bg-red-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                >
                  Salvar Corrida
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
