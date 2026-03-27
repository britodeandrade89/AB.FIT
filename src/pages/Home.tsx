import React, { useState, useEffect } from 'react';
import { 
  Activity, Calendar, TrendingUp, 
  ChevronRight, Clock, Target, 
  Flame, Heart, Zap, Brain,
  BarChart3, Ruler, Search
} from 'lucide-react';
import { Card, HeaderTitle, WeatherWidget } from '../components/Layout';
import { motion } from 'framer-motion';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { WorkoutHistoryEntry } from '../types';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentWorkouts = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, 'workout_history'), 
          where('studentId', '==', auth.currentUser.uid),
          orderBy('date', 'desc'),
          limit(3)
        );
        const snap = await getDocs(q);
        setRecentWorkouts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutHistoryEntry)));
      } catch (error) {
        console.error("Error fetching recent workouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentWorkouts();
  }, []);

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
            <HeaderTitle text={`OLÁ, ${auth.currentUser?.displayName?.split(' ')[0] || 'ATLETA'}`} />
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-80">
            Seu progresso está sendo monitorado.
          </p>
        </div>
        <WeatherWidget />
      </header>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2 group hover:border-red-600/50 transition-all">
          <Activity className="text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-3xl font-black italic tracking-tighter text-foreground leading-none">84%</span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Adesão Semanal</span>
        </Card>
        <Card className="p-6 space-y-2 group hover:border-red-600/50 transition-all">
          <Flame className="text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-3xl font-black italic tracking-tighter text-foreground leading-none">12.4k</span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Calorias (Mês)</span>
        </Card>
        <Card className="p-6 space-y-2 group hover:border-red-600/50 transition-all">
          <Zap className="text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-3xl font-black italic tracking-tighter text-foreground leading-none">42</span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Treinos Concluídos</span>
        </Card>
        <Card className="p-6 space-y-2 group hover:border-red-600/50 transition-all">
          <TrendingUp className="text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-3xl font-black italic tracking-tighter text-foreground leading-none">+12%</span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Evolução de Carga</span>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
                Treinos <span className="text-red-600">Recentes</span>
              </h2>
              <button 
                onClick={() => navigate('/workouts')}
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-600 transition-colors flex items-center gap-2"
              >
                Ver Todos <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {recentWorkouts.length > 0 ? (
                recentWorkouts.map((workout, idx) => (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="p-6 group hover:bg-secondary/30 transition-colors cursor-pointer border-l-4 border-l-red-600">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-inner">
                          <Activity className="text-red-600" size={18} />
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          {new Date(workout.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <h3 className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none mb-2">
                        {workout.workoutName}
                      </h3>
                      <div className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Clock size={12} /> {workout.duration} min</span>
                        <span className="flex items-center gap-1.5"><Zap size={12} /> {workout.totalVolume}kg</span>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 p-12 text-center border-2 border-dashed border-border rounded-[2rem]">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Nenhum treino registrado ainda.</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
              Metas <span className="text-red-600">Ativas</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600/10 rounded-lg">
                    <Target className="text-emerald-600" size={16} />
                  </div>
                  <span className="text-xs font-black uppercase italic tracking-widest">Peso Corporal</span>
                </div>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed">Atingir 82kg com 12% de BF até o final do semestre.</p>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="w-[65%] h-full bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              </Card>
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600/10 rounded-lg">
                    <Brain className="text-indigo-600" size={16} />
                  </div>
                  <span className="text-xs font-black uppercase italic tracking-widest">Periodização</span>
                </div>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed">Finalizar o mesociclo de hipertrofia com 95% de adesão.</p>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                </div>
              </Card>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <Card className="p-8 space-y-6 bg-gradient-to-br from-card to-secondary/20">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
                Status <span className="text-red-600">Físico</span>
              </h3>
              <Ruler className="text-muted-foreground/40" size={18} />
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-3xl font-black italic tracking-tighter text-foreground leading-none">24.2</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">IMC Atual</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-3xl font-black italic tracking-tighter text-foreground leading-none">14%</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Gordura Corporal</span>
                </div>
              </div>
              <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase italic text-muted-foreground tracking-widest">Peso Meta</span>
                  <span className="text-[10px] font-black uppercase italic text-foreground tracking-widest">82kg / 85kg</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="w-[92%] h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
                Insights <span className="text-red-600">IA</span>
              </h3>
              <BarChart3 className="text-muted-foreground/40" size={18} />
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                <p className="text-xs font-bold text-muted-foreground leading-relaxed italic">
                  "Seu volume de treino aumentou 15% esta semana. Mantenha o foco na recuperação e hidratação."
                </p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                <p className="text-xs font-bold text-muted-foreground leading-relaxed italic">
                  "Baseado no seu sono, hoje é um ótimo dia para um treino de alta intensidade."
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
