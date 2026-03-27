import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Play, Pause, RotateCcw, 
  CheckCircle2, Info, Brain, Zap, 
  ChevronRight, Timer, Dumbbell, Save, Clock
} from 'lucide-react';
import { Card, HeaderTitle } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../services/firebase';
import { doc, getDoc, addDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Workout, Exercise, WorkoutHistoryEntry } from '../types';
import { generateTechnicalCue } from '../services/gemini';

export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      if (!id || !auth.currentUser) return;
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
            where('studentId', '==', auth.currentUser.uid),
            orderBy('date', 'desc'),
            limit(20) // Look at last 20 workouts to find exercise matches
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
  }, [id]);

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
    if (!workout || !auth.currentUser) return;
    
    const historyEntry: WorkoutHistoryEntry = {
      id: crypto.randomUUID(),
      studentId: auth.currentUser.uid,
      workoutId: id!,
      workoutName: workout.name,
      date: new Date().toISOString(),
      duration: Math.floor(timer / 60),
      totalVolume: 0, // Calculate volume if needed
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
    <div className="p-6 sm:p-10 space-y-10 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/workouts')}
          className="p-3 bg-card border border-border rounded-2xl text-muted-foreground hover:text-foreground transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
            <HeaderTitle text={workout.name} />
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
            Sessão em andamento
          </p>
        </div>
        <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-2xl border border-border">
          <Timer size={16} className="text-red-600" />
          <span className="text-sm font-black italic tracking-tighter text-foreground">{formatTime(timer)}</span>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExercise.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <Card className="p-8 space-y-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase italic text-red-600 tracking-widest">Exercício {currentExerciseIndex + 1} de {workout.exercises.length}</span>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                      {currentExercise.name}
                    </h2>
                  </div>
                  <button 
                    onClick={() => handleGetCue(currentExercise.name)}
                    disabled={cueLoading}
                    className="p-4 bg-indigo-600/10 text-indigo-600 rounded-2xl hover:bg-indigo-600/20 transition-all disabled:opacity-50"
                  >
                    {cueLoading ? <RotateCcw className="animate-spin" size={24} /> : <Brain size={24} />}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-6 bg-secondary/30 rounded-3xl border border-border/50 text-center">
                    <span className="block text-3xl font-black italic tracking-tighter text-foreground leading-none">{currentExercise.sets}</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-2 block">Séries</span>
                  </div>
                  <div className="p-6 bg-secondary/30 rounded-3xl border border-border/50 text-center">
                    <span className="block text-3xl font-black italic tracking-tighter text-foreground leading-none">{currentExercise.reps}</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-2 block">Reps</span>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {/* Last Weight Display (Non-editable) */}
                    <div className="flex-1 p-3 bg-indigo-600/10 rounded-2xl border border-indigo-600/30 text-center relative overflow-hidden group flex flex-col justify-center">
                      <div className="absolute top-1 right-1">
                        <Clock size={10} className="text-indigo-600 opacity-50" />
                      </div>
                      <span className="block text-xl font-black italic tracking-tighter text-indigo-600 leading-none">
                        {lastWeights[currentExercise.id!] || '--'}
                        <span className="text-xs ml-0.5">kg</span>
                      </span>
                      <span className="text-[7px] font-black text-indigo-600/70 uppercase tracking-widest mt-1 block">Última Carga</span>
                    </div>

                    {/* Current Weight Input */}
                    <div className="flex-1 p-3 bg-red-600/5 rounded-2xl border border-red-600/20 text-center focus-within:border-red-600 transition-all flex flex-col justify-center">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="text"
                          value={currentWeights[currentExercise.id!] || ''}
                          onChange={(e) => setCurrentWeights(prev => ({ ...prev, [currentExercise.id!]: e.target.value }))}
                          className="w-full bg-transparent text-xl font-black italic tracking-tighter text-foreground text-center focus:outline-none"
                          placeholder="0"
                        />
                        <span className="text-xs font-black italic text-foreground">kg</span>
                      </div>
                      <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest mt-1 block">Carga Atual</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Checklist de Séries</h4>
                  <div className="flex flex-wrap gap-3">
                    {completedSets[currentExercise.id]?.map((done, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleSet(currentExercise.id, idx)}
                        className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                          done 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                            : 'bg-card border-border text-muted-foreground hover:border-red-600/50'
                        }`}
                      >
                        {done ? <CheckCircle2 size={24} /> : <span className="text-lg font-black italic">{idx + 1}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {technicalCue && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 bg-indigo-600/5 border-indigo-600/20">
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="text-indigo-600" size={18} />
                      <span className="text-xs font-black uppercase italic tracking-widest text-indigo-600">Dica Biomecânica</span>
                    </div>
                    <p className="text-sm font-bold text-muted-foreground leading-relaxed italic">
                      {technicalCue}
                    </p>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-4">
            <button
              onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
              disabled={currentExerciseIndex === 0}
              className="flex-1 py-5 bg-card border border-border rounded-3xl text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all disabled:opacity-30"
            >
              Anterior
            </button>
            {currentExerciseIndex < workout.exercises.length - 1 ? (
              <button
                onClick={() => setCurrentExerciseIndex(prev => prev + 1)}
                className="flex-[2] py-5 bg-foreground text-background rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3"
              >
                Próximo Exercício <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinishWorkout}
                className="flex-[2] py-5 bg-red-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                Finalizar Treino <Save size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-foreground">Controle de Descanso</h3>
            <div className="flex flex-col items-center gap-6">
              <div className="text-5xl font-black italic tracking-tighter text-red-600">
                {currentExercise.rest || '60'}s
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsTimerActive(!isTimerActive)}
                  className="p-4 bg-foreground text-background rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                >
                  {isTimerActive ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button 
                  onClick={() => setTimer(0)}
                  className="p-4 bg-card border border-border rounded-2xl text-muted-foreground hover:text-foreground transition-all"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-foreground">Lista de Exercícios</h3>
            <div className="space-y-3">
              {workout.exercises.map((ex, idx) => (
                <button
                  key={ex.id}
                  onClick={() => setCurrentExerciseIndex(idx)}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all border ${
                    currentExerciseIndex === idx 
                      ? 'bg-red-600/10 border-red-600/30 text-foreground' 
                      : 'bg-card border-border text-muted-foreground hover:border-red-600/20'
                  }`}
                >
                  <span className="text-xs font-black italic w-6">{idx + 1}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest truncate flex-1 text-left">{ex.name}</span>
                  {completedSets[ex.id]?.every(v => v) && <CheckCircle2 size={14} className="text-emerald-500" />}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
