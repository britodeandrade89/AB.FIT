import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, Plus, Search, Filter, 
  ChevronRight, Clock, Zap, Target, 
  Play, MoreVertical, Trash2, Edit3,
  Calendar, Info
} from 'lucide-react';
import { Card, HeaderTitle } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Workout, Exercise } from '../types';
import { useNavigate } from 'react-router-dom';

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(collection(db, 'workouts'), where('studentId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const workoutList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Workout[];
        setWorkouts(workoutList);
      } catch (error) {
        console.error("Error fetching workouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const filteredWorkouts = workouts.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'all') return matchesSearch;
    return matchesSearch && w.status === filter;
  });

  const handleDeleteWorkout = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta planilha?")) return;
    try {
      await deleteDoc(doc(db, 'workouts', id));
      setWorkouts(workouts.filter(w => w.id !== id));
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
            <HeaderTitle text="Planilhas de Treino" />
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-80">
            Gerencie seus ciclos e sessões de treinamento.
          </p>
        </div>
        <button 
          onClick={() => navigate('/workouts/new')}
          className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-105 transition-all"
        >
          <Plus size={18} /> Nova Planilha
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="BUSCAR PLANILHA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-card border border-border rounded-2xl text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === f 
                  ? 'bg-red-600 border-red-600 text-white' 
                  : 'bg-card border-border text-muted-foreground hover:border-red-600/50'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'active' ? 'Ativas' : 'Concluídas'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredWorkouts.map((workout, idx) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              layout
            >
              <Card className="group relative h-full flex flex-col hover:border-red-600/50 transition-all duration-500">
                <div className="p-8 space-y-6 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-red-600/10 rounded-2xl group-hover:scale-110 transition-transform">
                      <Dumbbell className="text-red-600" size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        workout.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'
                      }`}>
                        {workout.status}
                      </span>
                      <button className="p-2 text-muted-foreground hover:text-foreground">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground leading-none group-hover:text-red-600 transition-colors">
                      {workout.name}
                    </h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest line-clamp-2 leading-relaxed">
                      {workout.description || 'Sem descrição.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="flex flex-col">
                      <span className="text-xs font-black italic tracking-tighter text-foreground leading-none">{workout.exercises.length}</span>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Exercícios</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black italic tracking-tighter text-foreground leading-none">{workout.duration || '45'} min</span>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Duração Est.</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-secondary/30 flex gap-2">
                  <button 
                    onClick={() => navigate(`/workouts/${workout.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Play size={12} /> Iniciar Treino
                  </button>
                  <button 
                    onClick={() => navigate(`/workouts/edit/${workout.id}`)}
                    className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteWorkout(workout.id!)}
                    className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-red-600 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredWorkouts.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-card border border-border rounded-full flex items-center justify-center mx-auto opacity-20">
              <Search size={32} className="text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-black italic uppercase tracking-tighter text-muted-foreground">Nenhuma planilha encontrada</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tente ajustar sua busca ou filtros.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
