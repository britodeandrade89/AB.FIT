import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Bot, 
  ChevronRight, Activity, TrendingUp, 
  Target, Brain, MessageCircle, 
  Calendar, Filter, MoreVertical,
  UserPlus, FileText, Zap, User, BarChart3,
  LayoutGrid, Sparkles, LogOut, Mail, Phone, ArrowLeft, Camera,
  Dumbbell, Footprints, Ruler, MapPin, Layout, History, Info, Edit2, PlusCircle
} from 'lucide-react';
import { Card, HeaderTitle, Logo } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../services/firebase';
import { collection, query, getDocs, limit, orderBy, doc, getDoc } from 'firebase/firestore';
import { Student, Workout } from '../types';
import { useNavigate } from 'react-router-dom';

type ViewState = 'MAIN' | 'FEED_GLOBAL' | 'PRESCREVE_AI' | 'STUDENT_DETAIL';

export default function ProfessorDashboard() {
  const [view, setView] = useState<ViewState>('MAIN');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, 'students'), orderBy('name', 'asc'));
        const snap = await getDocs(q);
        setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('abfit-session');
    navigate('/login');
    window.location.reload();
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    switch (view) {
      case 'FEED_GLOBAL':
        return <FeedGlobal onBack={() => setView('MAIN')} />;
      case 'PRESCREVE_AI':
        return <PrescreveAI onBack={() => setView('MAIN')} />;
      case 'STUDENT_DETAIL':
        return selectedStudent ? (
          <StudentDetail 
            student={selectedStudent} 
            onBack={() => {
              setView('MAIN');
              setSelectedStudent(null);
            }} 
          />
        ) : null;
      default:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between gap-4">
              <button className="p-3 bg-zinc-900 rounded-xl text-zinc-400">
                <LayoutGrid size={20} />
              </button>
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  type="text" 
                  placeholder="CARREGANDO..." 
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
              <button onClick={handleLogout} className="p-3 bg-zinc-900 rounded-xl text-zinc-400 hover:text-red-600 transition-colors">
                <LogOut size={20} />
              </button>
            </header>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                <div className="flex gap-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse delay-75" />
                </div>
              </div>
              <Logo size="text-5xl" subSize="text-[8px]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setView('FEED_GLOBAL')}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] text-left space-y-3 group hover:border-red-600/50 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-red-600 transition-colors">
                  <Layout size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Feed Global</h3>
                  <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Timeline de Atletas</p>
                </div>
              </button>
              <button 
                onClick={() => setView('PRESCREVE_AI')}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] text-left space-y-3 group hover:border-red-600/50 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-red-600 transition-colors">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">PrescreveAI</h3>
                  <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Gerador de Biomecânica</p>
                </div>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Users size={14} className="text-red-600" />
                <h2 className="text-[11px] font-black uppercase italic tracking-widest text-white">
                  Gestão de Atletas ({students.length})
                </h2>
              </div>

              <div className="space-y-3">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      setView('STUDENT_DETAIL');
                    }}
                    className="w-full flex items-center justify-between p-5 bg-zinc-900/50 border border-zinc-800 rounded-[1.5rem] hover:bg-zinc-800/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-red-600 transition-colors overflow-hidden">
                        {student.photoURL ? (
                          <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <Activity size={20} className="animate-pulse" />
                        )}
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-black uppercase italic tracking-tighter text-white group-hover:text-red-600 transition-colors">
                          <HeaderTitle text={student.name} />
                        </h4>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate max-w-[150px]">
                          {student.email}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-700 group-hover:text-red-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            <footer className="pt-12 pb-8 flex flex-col items-center space-y-8">
              <div className="flex gap-4">
                <button className="p-4 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-white transition-colors">
                  <Mail size={20} />
                </button>
                <button className="p-4 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-white transition-colors">
                  <MessageCircle size={20} />
                </button>
                <button className="p-4 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-white transition-colors">
                  <Phone size={20} />
                </button>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">ABFIT Performance v2.0</p>
                <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">© 2025 Me. André Brito. All Rights Reserved.</p>
              </div>
            </footer>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-2xl mx-auto">
      {renderContent()}
    </div>
  );
}

function FeedGlobal({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-zinc-900 rounded-xl text-zinc-400">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-black uppercase italic tracking-tighter">
          Feed Global <span className="text-red-600">ABFIT</span>
        </h1>
      </header>

      <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-30">
        <Camera size={64} className="text-zinc-700" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Nenhum registro visual ainda</p>
      </div>

      <footer className="pt-12 pb-8 flex flex-col items-center space-y-8">
        <div className="flex gap-4">
          <button className="p-4 bg-zinc-900 rounded-2xl text-zinc-500">
            <Mail size={20} />
          </button>
          <button className="p-4 bg-zinc-900 rounded-2xl text-zinc-500">
            <MessageCircle size={20} />
          </button>
          <button className="p-4 bg-zinc-900 rounded-2xl text-zinc-500">
            <Phone size={20} />
          </button>
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">ABFIT Performance v2.0</p>
          <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">© 2025 Me. André Brito. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function PrescreveAI({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<'ACADEMIA' | 'OUTDOOR'>('ACADEMIA');
  const [gender, setGender] = useState<'HOMEM' | 'MULHER'>('MULHER');
  const [filter, setFilter] = useState('TODOS');

  const filters = [
    'TODOS', 'PEITORAL', 'DORSAIS', 'OMBROS', 'BÍCEPS', 'TRÍCEPS', 
    'QUADRÍCEPS', 'POSTERIORES DE COXA', 'GLÚTEOS', 'ADUTORES', 
    'PANTURRILHA', 'PARAVERTEBRAIS', 'ABDOMINAIS'
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400">
          <ArrowLeft size={14} /> Voltar
        </button>
      </header>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Dumbbell size={32} className="text-white" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-cyan-400 leading-none">PrescreveAI</h1>
          <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest border-t border-zinc-800 pt-1">Prescrição e Biomecânica de Alta Performance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 p-1 bg-zinc-900 rounded-2xl">
        <button 
          onClick={() => setMode('ACADEMIA')}
          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'ACADEMIA' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500'}`}
        >
          Academia
        </button>
        <button 
          onClick={() => setMode('OUTDOOR')}
          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'OUTDOOR' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500'}`}
        >
          Outdoor / Casa
        </button>
      </div>

      <div className="grid grid-cols-2 p-1 bg-zinc-900 rounded-2xl">
        <button 
          onClick={() => setGender('HOMEM')}
          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gender === 'HOMEM' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
        >
          Homem
        </button>
        <button 
          onClick={() => setGender('MULHER')}
          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gender === 'MULHER' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
        >
          Mulher
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
        {['ÁFRICA DO SUL 26', 'REAL MADRID 81', 'FLAMENGO 81 (HOME)', 'FLAMENGO'].map((team) => (
          <button key={team} className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl whitespace-nowrap group hover:border-blue-600 transition-all">
            <div className="w-4 h-4 text-blue-600"><Layout size={16} /></div>
            <span className="text-[9px] font-black uppercase italic tracking-widest text-zinc-400 group-hover:text-white">{team}</span>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
        <input 
          type="text" 
          placeholder="Qual o exercício de todos vamos prescrever?" 
          className="w-full pl-12 pr-6 py-5 bg-white rounded-full text-[11px] font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none shadow-xl"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-white text-zinc-500'}`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

function StudentDetail({ student, onBack }: { student: Student, onBack: () => void }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const q = query(collection(db, 'workouts'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setWorkouts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout)).filter(w => w.studentId === student.id));
      } catch (error) {
        console.error("Error fetching workouts:", error);
      }
    };
    fetchWorkouts();
  }, [student.id]);

  const menuItems = [
    { id: 'PLANILHAS', label: 'Planilhas Ativas', icon: Dumbbell, color: 'border-orange-600/50 text-orange-600' },
    { id: 'RUN', label: 'ABFIT RUN', icon: Footprints, color: 'border-rose-600/50 text-rose-600' },
    { id: 'PERIODIZACAO', label: 'Periodização Mestre', icon: Brain, color: 'border-indigo-600/50 text-indigo-600' },
    { id: 'AVALIACAO', label: 'Avaliação Física', icon: Ruler, color: 'border-emerald-600/50 text-emerald-600' },
    { id: 'CORRE_RJ', label: 'Corre RJ 2026', icon: MapPin, color: 'border-yellow-600/50 text-yellow-600' },
    { id: 'FEED', label: 'Feed Performance', icon: Layout, color: 'border-red-600/50 text-red-600' },
    { id: 'ANALYTICS', label: 'Análise de Dados', icon: BarChart3, color: 'border-blue-600/50 text-blue-600' },
    { id: 'HISTORY', label: 'Histórico de Treinos', icon: History, color: 'border-emerald-600/50 text-emerald-600' },
    { id: 'ABOUT', label: 'Sobre a ABFIT', icon: Info, color: 'border-zinc-800 text-zinc-500' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-zinc-900 rounded-xl text-zinc-400">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-black uppercase italic tracking-tighter">
          <HeaderTitle text={student.name} />
        </h1>
      </header>

      <div className="space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center justify-between p-5 bg-zinc-900/50 border ${item.color.split(' ')[0]} rounded-[1.5rem] hover:bg-zinc-800/50 transition-all group`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center ${item.color.split(' ')[1]}`}>
                <item.icon size={20} />
              </div>
              <span className="text-xs font-black uppercase italic tracking-widest text-white">{item.label}</span>
            </div>
            <ChevronRight size={16} className="text-zinc-700 group-hover:text-white transition-colors" />
          </button>
        ))}
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-black uppercase italic tracking-widest text-zinc-500">Gerenciar Planilhas</h2>
          <span className="px-2 py-1 bg-zinc-900 rounded-md text-[8px] font-black uppercase text-zinc-500">{workouts.length} ATIVAS</span>
        </div>

        <div className="space-y-3">
          {workouts.map((workout) => (
            <div key={workout.id} className="flex items-center justify-between p-6 bg-zinc-900/50 border border-zinc-800 rounded-[2rem]">
              <div className="flex items-center gap-4">
                <h4 className="text-sm font-black uppercase italic tracking-tighter text-white">{workout.name}</h4>
                <span className="px-3 py-1 bg-emerald-900/30 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Publicado</span>
              </div>
              <button className="p-3 bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-colors">
                <Edit2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button className="w-full py-5 border-2 border-dashed border-zinc-800 rounded-[2rem] flex items-center justify-center gap-3 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400 transition-all">
            <PlusCircle size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Novo Treino (Editor Padrão)</span>
          </button>
          
          <button className="w-full py-6 bg-red-600 rounded-[2rem] flex items-center justify-center gap-3 text-white shadow-xl shadow-red-600/20 hover:scale-[1.02] active:scale-95 transition-all">
            <Sparkles size={20} className="animate-pulse" />
            <span className="text-sm font-black uppercase italic tracking-widest">Criar Treino (ABFIT AI)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
