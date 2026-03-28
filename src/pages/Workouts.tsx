import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, Play, ArrowLeft, RefreshCw
} from 'lucide-react';
import { Card } from '../components/Layout';
import { motion } from 'framer-motion';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Workout } from '../types';
import { useNavigate } from 'react-router-dom';

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-black text-white p-6 sm:p-10 space-y-8 max-w-3xl mx-auto relative">
      {/* Status Bar */}
      <div className="absolute top-6 right-6 flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl z-10">
        <RefreshCw size={12} className="text-white/40 animate-spin" />
        <span className="text-[9px] font-black tracking-widest text-white/60 uppercase">CARREGANDO...</span>
      </div>

      <header className="flex items-center gap-6 pt-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
          PLANILHAS DE <span className="text-red-600">TREINO</span>
        </h1>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="animate-spin mx-auto text-red-600 mb-4" size={32} />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Buscando planilhas...</p>
          </div>
        ) : workouts.length > 0 ? (
          workouts.map((workout, idx) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                onClick={() => navigate(`/workouts/${workout.id}`)}
                className="group relative p-6 bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-red-600/40 transition-all duration-500 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-red-600 shadow-inner group-hover:scale-110 transition-transform">
                    <Play size={24} fill="currentColor" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black italic uppercase tracking-tighter text-white leading-none group-hover:text-red-600 transition-colors">
                      {workout.name}
                    </h3>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      {workout.exercises.length} EXERCÍCIOS PRESCRITOS
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-sm font-black italic tracking-tighter text-red-600 leading-none">2/20</span>
                  <div className="w-12 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="w-[10%] h-full bg-red-600" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
            <Dumbbell className="mx-auto text-white/10 mb-4" size={48} />
            <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Nenhuma planilha ativa.</p>
          </div>
        )}
      </div>
    </div>
  );
}
