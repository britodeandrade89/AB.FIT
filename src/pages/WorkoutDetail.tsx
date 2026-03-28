import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Play, Pause, RotateCcw, 
  CheckCircle2, Info, Brain, Zap, 
  ChevronRight, Timer, Dumbbell, Save, Clock,
  ArrowLeft, Menu, RefreshCw
} from 'lucide-react';
import { Card } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { doc, getDoc, addDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Workout, Exercise, WorkoutHistoryEntry } from '../types';
import { generateTechnicalCue } from '../services/gemini';

export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [technicalCue, setTechnicalCue] = useState<string | null>(null);
  const [cueLoading, setCueLoading] = useState(false);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
  const [lastWeights, setLastWeights] = useState<Record<string, string>>({});
  const [currentWeights, setCurrentWeights] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchWorkout = async () => {
      const savedUser = localStorage.getItem('abfit-session');
      if (!savedUser) {
        navigate('/login');
        return;
      }
      
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      if (!id) return;
      try {
        const docRef = doc(db, 'workouts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Workout;
          setWorkout(data);
          
          // Initialize completed sets and current weights
          const initialSets: Record<string, boolean[]> = {};
          const initialWeights: Record<string, string> = {};
          data.exercises.forEach(ex => {
            initialSets[ex.id] = new Array(ex.sets).fill(false);
            initialWeights[ex.id] = ex.load || '';
          });
          setCompletedSets(initialSets);
          setCurrentWeights(initialWeights);

          // Fetch last weights from history
          const historyQuery = query(
            collection(db, 'workout_history'),
            where('studentId', '==', parsedUser.uid || parsedUser.id),
            orderBy('date', 'desc'),
            limit(20)
          );
          const historySnap = await getDocs(historyQuery);
          const lastWeightMap: Record<string, string> = {};
          
          historySnap.docs.forEach(doc => {
            const entry = doc.data() as WorkoutHistoryEntry;
            entry.exercises.forEach(ex => {
              const exId = ex.id;
              if (exId && !lastWeightMap[exId] && ex.load) {
                lastWeightMap[exId] = ex.load;
              }
            });
          });
          setLastWeights(lastWeightMap);
        }
      } catch (error) {
        console.error("Error fetching workout:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [id, navigate]);

  useEffect(() => {
    let interval: any;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGetCue = async (exerciseName: string) => {
    setCueLoading(true);
    try {
      const cue = await generateTechnicalCue(exerciseName);
      setTechnicalCue(cue);
    } catch (error) {
      console.error("Error getting cue:", error);
    } finally {
      setCueLoading(false);
    }
  };

  const toggleSet = (exerciseId: string, setIndex: number) => {
    setCompletedSets(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((val, idx) => idx === setIndex ? !val : val)
    }));
  };

  const handleFinishWorkout = async () => {
    if (!workout || !user) return;
    
    const historyEntry: WorkoutHistoryEntry = {
      id: crypto.randomUUID(),
      studentId: user.uid || user.id,
      workoutId: id!,
      workoutName: workout.name,
      date: new Date().toISOString(),
      duration: Math.floor(timer / 60),
      totalVolume: 0,
      exercises: workout.exercises.map(ex => ({
        ...ex,
        load: currentWeights[ex.id] || ex.load
      })),
      type: 'STRENGTH'
    };

    try {
      await addDoc(collection(db, 'workout_history'), historyEntry);
      navigate('/workouts');
    } catch (error) {
      console.error("Error saving workout history:", error);
    }
  };

  if (loading) return null;
  if (!workout) return <div className="p-10 text-center">Planilha não encontrada.</div>;

  const currentExercise = workout.exercises[currentExerciseIndex];

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
          <span className="text-xl font-black italic tracking-tighter uppercase">TREINO <span className="text-red-600">ATIVO</span></span>
        </div>
      </header>

      {/* Main Exercise Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExercise.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <Card className="p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase italic text-red-600 tracking-widest">EXERCÍCIO {currentExerciseIndex + 1} DE {workout.exercises.length}</span>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                  {currentExercise.name}
                </h2>
              </div>
              <button 
                onClick={() => handleGetCue(currentExercise.name)}
                disabled={cueLoading}
                className="w-14 h-14 bg-white/5 border border-white/10 text-white/40 rounded-2xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {cueLoading ? <RotateCcw className="animate-spin" size={24} /> : <Brain size={24} />}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/10 text-center">
                <span className="block text-3xl font-black italic tracking-tighter text-white leading-none">{currentExercise.sets}</span>
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-2 block">Séries</span>
              </div>
              <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/10 text-center">
                <span className="block text-3xl font-black italic tracking-tighter text-white leading-none">{currentExercise.reps}</span>
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-2 block">Reps</span>
              </div>
              <div className="p-6 bg-red-600/10 rounded-3xl border border-red-600/20 text-center">
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="text"
                    value={currentWeights[currentExercise.id] || ''}
                    onChange={(e) => setCurrentWeights(prev => ({ ...prev, [currentExercise.id]: e.target.value }))}
                    className="w-full bg-transparent text-2xl font-black italic tracking-tighter text-white text-center focus:outline-none"
                    placeholder="0"
                  />
                  <span className="text-xs font-black italic text-red-600">kg</span>
                </div>
                <span className="text-[8px] font-black text-red-600/60 uppercase tracking-widest mt-2 block">Carga</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">CHECKLIST DE SÉRIES</h4>
              <div className="flex flex-wrap gap-4">
                {completedSets[currentExercise.id]?.map((done, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleSet(currentExercise.id, idx)}
                    className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                      done 
                        ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                        : 'bg-white/5 border-white/10 text-white/20 hover:border-red-600/50'
                    }`}
                  >
                    {done ? <CheckCircle2 size={24} /> : <span className="text-lg font-black italic">{idx + 1}</span>}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {technicalCue && (
            <Card className="p-6 bg-red-600/5 border-red-600/20">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="text-red-600" size={18} />
                <span className="text-xs font-black uppercase italic tracking-widest text-red-600">DICA BIOMECÂNICA</span>
              </div>
              <p className="text-sm font-black italic text-white/60 leading-relaxed">
                {technicalCue}
              </p>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Timer & Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-8 bg-white/[0.03] border-white/10 flex flex-col items-center justify-center space-y-6">
          <div className="flex items-center gap-3 text-white/40">
            <Timer size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">DESCANSO</span>
          </div>
          <div className="text-6xl font-black italic tracking-tighter text-white">
            {formatTime(timer)}
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsTimerActive(!isTimerActive)}
              className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
            >
              {isTimerActive ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button 
              onClick={() => setTimer(0)}
              className="w-14 h-14 bg-white/5 border border-white/10 text-white/40 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
            disabled={currentExerciseIndex === 0}
            className="w-full py-6 bg-white/5 border border-white/10 rounded-3xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all disabled:opacity-30"
          >
            ANTERIOR
          </button>
          {currentExerciseIndex < workout.exercises.length - 1 ? (
            <button
              onClick={() => setCurrentExerciseIndex(prev => prev + 1)}
              className="w-full py-6 bg-white text-black rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3"
            >
              PRÓXIMO EXERCÍCIO <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinishWorkout}
              className="w-full py-6 bg-red-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              FINALIZAR TREINO <Save size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
