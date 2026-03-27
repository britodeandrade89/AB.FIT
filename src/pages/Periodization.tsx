import React, { useState, useEffect } from 'react';
import { 
  Brain, Target, Calendar, TrendingUp, 
  ChevronRight, Info, Zap, Activity,
  LayoutGrid, List, BarChart3, Clock
} from 'lucide-react';
import { Card, HeaderTitle } from '../components/Layout';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { PeriodizationPlan } from '../types';
import { motion } from 'framer-motion';

export default function Periodization() {
  const [plan, setPlan] = useState<PeriodizationPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeriodization = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(collection(db, 'periodization_plans'), where('studentId', '==', auth.currentUser.uid), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setPlan(snap.docs[0].data() as PeriodizationPlan);
        }
      } catch (error) {
        console.error("Error fetching periodization:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPeriodization();
  }, []);

  if (loading) return null;

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
            <HeaderTitle text="Periodização" />
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-80">
            Estratégia e planejamento de longo prazo.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-card px-6 py-3 rounded-2xl border border-border shadow-xl">
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black italic tracking-tighter text-foreground leading-none">Macro 01</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Ciclo Atual</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col">
            <span className="text-2xl font-black italic tracking-tighter text-red-600 leading-none">Fase 2</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Meso Atual</span>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 space-y-8 bg-gradient-to-br from-card to-indigo-600/5 border-indigo-600/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-600">
                  <Brain size={24} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                    {plan?.name || 'Plano de Hipertrofia 2026'}
                  </h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Objetivo: {plan?.objective || 'Ganho de Massa Muscular'}</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="px-4 py-1.5 bg-indigo-600/10 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-600/20">Em Andamento</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Início</span>
                <p className="text-sm font-bold text-foreground uppercase italic tracking-tighter">{new Date(plan?.startDate || '2026-01-01').toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Término</span>
                <p className="text-sm font-bold text-foreground uppercase italic tracking-tighter">{new Date(plan?.endDate || '2026-06-30').toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Duração</span>
                <p className="text-sm font-bold text-foreground uppercase italic tracking-tighter">24 Semanas</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground italic">Progresso Geral do Plano</span>
                <span className="text-indigo-600">42% Concluído</span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <div className="w-[42%] h-full bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.6)]" />
              </div>
            </div>
          </Card>

          <section className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
              Estrutura de <span className="text-red-600">Mesociclos</span>
            </h2>
            <div className="space-y-4">
              {plan?.mesocycles.map((meso, idx) => (
                <div key={idx}>
                  <Card className={`p-6 flex items-center justify-between group transition-all ${idx === 1 ? 'border-red-600/50 bg-secondary/20' : 'hover:bg-secondary/30'}`}>
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl border border-border flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 ${idx === 1 ? 'bg-red-600 text-white' : 'bg-card text-muted-foreground'}`}>
                      <span className="text-lg font-black italic">{idx + 1}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none mb-2">{meso.name}</span>
                      <div className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Calendar size={12} /> {meso.duration} Semanas</span>
                        <span className="flex items-center gap-1.5"><Zap size={12} /> {meso.focus}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {idx === 1 && (
                      <span className="px-3 py-1 bg-red-600/10 text-red-600 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">Atual</span>
                    )}
                    <ChevronRight size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Card>
              </div>
              ))}
              
              {!plan && (
                [1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <Card className="p-6 flex items-center justify-between opacity-50 grayscale">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center">
                        <span className="text-lg font-black italic">{i}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-32 bg-secondary rounded-full" />
                        <div className="h-2 w-24 bg-secondary rounded-full" />
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </Card>
                </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <Card className="p-8 space-y-6">
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
              Foco do <span className="text-red-600">Ciclo</span>
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600/10 rounded-2xl text-red-600">
                  <TrendingUp size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black italic tracking-tighter text-foreground leading-none">Hipertrofia</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Objetivo Primário</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-600">
                  <Zap size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black italic tracking-tighter text-foreground leading-none">Força Máxima</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Objetivo Secundário</span>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-border space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Distribuição de Volume</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest">
                  <span>Membros Superiores</span>
                  <span>60%</span>
                </div>
                <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                  <div className="w-[60%] h-full bg-red-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest">
                  <span>Membros Inferiores</span>
                  <span>40%</span>
                </div>
                <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                  <div className="w-[40%] h-full bg-blue-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
                Insights <span className="text-red-600">IA</span>
              </h3>
              <BarChart3 className="text-red-600/40" size={18} />
            </div>
            <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
              <p className="text-xs font-bold text-muted-foreground leading-relaxed italic">
                "Você está na fase de transição para força. Aumente o tempo de descanso entre as séries para 3 minutos."
              </p>
            </div>
            <button className="w-full py-4 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-red-600 hover:text-red-600 transition-all flex items-center justify-center gap-3">
              <Brain size={14} /> Analisar Performance
            </button>
          </Card>

          <Card className="p-8 space-y-4 text-center">
            <Clock className="mx-auto text-muted-foreground/20" size={32} />
            <div className="space-y-1">
              <p className="text-xs font-black italic uppercase tracking-tighter text-foreground">Próxima Reavaliação</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">15 de Abril, 2026</p>
            </div>
            <button className="w-full py-3 bg-foreground text-background rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
              Agendar Agora
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
