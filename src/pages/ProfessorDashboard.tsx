import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Bot, 
  ChevronRight, Activity, TrendingUp, 
  Target, Brain, MessageCircle, 
  Calendar, Filter, MoreVertical,
  UserPlus, FileText, Zap, User, BarChart3,
  LayoutGrid, Sparkles, LogOut, Mail, Phone, ArrowLeft, Camera,
  Dumbbell, Footprints, Ruler, MapPin, Layout, History, Info, Edit2, PlusCircle,
  RefreshCw, Menu, Bell, Settings, Star, Award
} from 'lucide-react';
import { Card, HeaderTitle, Logo } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { Student, Workout } from '../types';
import { useNavigate } from 'react-router-dom';

type ViewState = 'MAIN' | 'FEED_GLOBAL' | 'PRESCREVE_AI' | 'STUDENT_DETAIL' | 'PROFESSOR_PROFILE';

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
      case 'PROFESSOR_PROFILE':
        return <ProfessorProfile onBack={() => setView('MAIN')} />;
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
          <div className="space-y-8 animate-in fade-in duration-700 pb-24">
            {/* Status Bar */}
            <div className="flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[9px] font-black tracking-widest text-white/60 uppercase">SISTEMA ATIVO</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw size={10} className="text-white/40 animate-spin" />
                <span className="text-[9px] font-black tracking-widest text-white/60 uppercase">SINCRONIZADO</span>
              </div>
            </div>

            <header className="flex items-center justify-between gap-4">
              <button 
                onClick={() => setView('PROFESSOR_PROFILE')}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-600 transition-all"
              >
                <User size={20} />
              </button>
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="BUSCAR ATLETA..." 
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-red-600 transition-all"
                />
              </div>
              <button onClick={handleLogout} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-600 transition-all">
                <LogOut size={20} />
              </button>
            </header>

            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <Logo size="text-5xl" subSize="text-[8px]" />
              <div className="px-4 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-600">PAINEL DO TREINADOR</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setView('FEED_GLOBAL')}
                className="p-6 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-[2.5rem] text-left space-y-4 group hover:border-red-600/50 transition-all shadow-2xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-red-600 transition-colors">
                  <Layout size={22} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Feed Global</h3>
                  <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Timeline de Atletas</p>
                </div>
              </button>
              <button 
                onClick={() => setView('PRESCREVE_AI')}
                className="p-6 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-[2.5rem] text-left space-y-4 group hover:border-red-600/50 transition-all shadow-2xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-red-600 transition-colors">
                  <Sparkles size={22} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">PrescreveAI</h3>
                  <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Biomecânica Inteligente</p>
                </div>
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-red-600" />
                  <h2 className="text-[11px] font-black uppercase italic tracking-widest text-white">
                    GESTÃO DE ATLETAS
                  </h2>
                </div>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-white/40 uppercase tracking-widest">
                  {students.length} TOTAL
                </span>
              </div>

              <div className="space-y-3">
                {filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      setView('STUDENT_DETAIL');
                    }}
                    className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group shadow-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-red-600 transition-colors overflow-hidden">
                        {student.photoURL ? (
                          <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Activity size={24} className="opacity-20" />
                        )}
                      </div>
                      <div className="text-left space-y-1">
                        <h4 className="text-sm font-black uppercase italic tracking-tighter text-white group-hover:text-red-600 transition-colors">
                          <HeaderTitle text={student.name} />
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest truncate max-w-[150px]">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Último Treino</span>
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">Hoje, 09:45</span>
                      </div>
                      <ChevronRight size={18} className="text-white/10 group-hover:text-red-600 transition-colors" />
                    </div>
                  </button>
                ))}
                
                {filteredStudents.length === 0 && !loading && (
                  <div className="py-20 text-center space-y-4 opacity-20">
                    <Search size={48} className="mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Nenhum atleta encontrado</p>
                  </div>
                )}
              </div>
            </div>

            <footer className="pt-12 pb-8 flex flex-col items-center space-y-8">
              <div className="flex gap-4">
                <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/20 hover:text-white transition-colors">
                  <Mail size={20} />
                </button>
                <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/20 hover:text-white transition-colors">
                  <MessageCircle size={20} />
                </button>
                <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/20 hover:text-white transition-colors">
                  <Phone size={20} />
                </button>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">ABFIT Performance v2.0</p>
                <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest">© 2025 Me. André Brito. All Rights Reserved.</p>
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
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-24">
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          <span className="text-[9px] font-black tracking-widest text-white/60 uppercase">FEED GLOBAL</span>
        </div>
        <button onClick={onBack} className="text-[9px] font-black tracking-widest text-red-600 uppercase">VOLTAR</button>
      </div>

      <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-30">
        <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center">
          <Camera size={48} className="text-white/20" />
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Nenhum registro visual ainda</p>
          <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Aguardando uploads dos atletas</p>
        </div>
      </div>

      <footer className="pt-12 pb-8 flex flex-col items-center space-y-8">
        <div className="flex gap-4">
          <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/20 hover:text-white transition-colors">
            <Mail size={20} />
          </button>
          <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/20 hover:text-white transition-colors">
            <MessageCircle size={20} />
          </button>
          <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/20 hover:text-white transition-colors">
            <Phone size={20} />
          </button>
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">ABFIT Performance v2.0</p>
          <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest">© 2025 Me. André Brito. All Rights Reserved.</p>
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
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-24">
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          <span className="text-[9px] font-black tracking-widest text-white/60 uppercase">PRESCREVE AI</span>
        </div>
        <button onClick={onBack} className="text-[9px] font-black tracking-widest text-red-600 uppercase">VOLTAR</button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-600/20">
          <Sparkles size={32} className="text-white" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">PrescreveAI</h1>
          <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest border-t border-white/10 pt-1">Biomecânica de Alta Performance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
        <button 
          onClick={() => setMode('ACADEMIA')}
          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'ACADEMIA' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-white/20'}`}
        >
          Academia
        </button>
        <button 
          onClick={() => setMode('OUTDOOR')}
          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'OUTDOOR' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-white/20'}`}
        >
          Outdoor / Casa
        </button>
      </div>

      <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
        <button 
          onClick={() => setGender('HOMEM')}
          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gender === 'HOMEM' ? 'bg-white/10 text-white' : 'text-white/20'}`}
        >
          Homem
        </button>
        <button 
          onClick={() => setGender('MULHER')}
          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gender === 'MULHER' ? 'bg-white/10 text-white' : 'text-white/20'}`}
        >
          Mulher
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
        {['ÁFRICA DO SUL 26', 'REAL MADRID 81', 'FLAMENGO 81 (HOME)', 'FLAMENGO'].map((team) => (
          <button key={team} className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl whitespace-nowrap group hover:border-red-600 transition-all">
            <div className="w-4 h-4 text-red-600"><Layout size={16} /></div>
            <span className="text-[9px] font-black uppercase italic tracking-widest text-white/40 group-hover:text-white">{team}</span>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600" size={18} />
        <input 
          type="text" 
          placeholder="Qual exercício vamos prescrever?" 
          className="w-full pl-12 pr-6 py-5 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-red-600 transition-all shadow-xl"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-red-600 text-white' : 'bg-white/5 text-white/40 border border-white/10'}`}
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const q = query(collection(db, 'workouts'), where('studentId', '==', student.id), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setWorkouts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout)));
      } catch (error) {
        console.error("Error fetching workouts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, [student.id]);

  const menuItems = [
    { id: 'PLANILHAS', label: 'Planilhas Ativas', icon: Dumbbell, color: 'border-red-600/50 text-red-600' },
    { id: 'RUN', label: 'ABFIT RUN', icon: Footprints, color: 'border-red-600/50 text-red-600' },
    { id: 'PERIODIZACAO', label: 'Periodização Mestre', icon: Brain, color: 'border-red-600/50 text-red-600' },
    { id: 'AVALIACAO', label: 'Avaliação Física', icon: Ruler, color: 'border-red-600/50 text-red-600' },
    { id: 'CORRE_RJ', label: 'Corre RJ 2026', icon: MapPin, color: 'border-red-600/50 text-red-600' },
    { id: 'FEED', label: 'Feed Performance', icon: Layout, color: 'border-red-600/50 text-red-600' },
    { id: 'ANALYTICS', label: 'Análise de Dados', icon: BarChart3, color: 'border-red-600/50 text-red-600' },
    { id: 'HISTORY', label: 'Histórico de Treinos', icon: History, color: 'border-red-600/50 text-red-600' },
    { id: 'ABOUT', label: 'Sobre a ABFIT', icon: Info, color: 'border-white/10 text-white/20' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-24">
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          <span className="text-[9px] font-black tracking-widest text-white/60 uppercase">DETALHES DO ATLETA</span>
        </div>
        <button onClick={onBack} className="text-[9px] font-black tracking-widest text-red-600 uppercase">VOLTAR</button>
      </div>

      <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl">
        <div className="w-20 h-20 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/20 overflow-hidden">
          {student.photoURL ? (
            <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User size={32} className="opacity-20" />
          )}
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">
            <HeaderTitle text={student.name} />
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{student.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {menuItems.slice(0, 6).map((item) => (
          <button
            key={item.id}
            className="p-6 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-[2.5rem] text-left space-y-4 group hover:border-red-600/50 transition-all shadow-xl"
          >
            <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${item.color.split(' ')[1]} transition-colors`}>
              <item.icon size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="text-[10px] font-black uppercase italic tracking-tighter text-white">{item.label}</h3>
              <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Acessar Módulo</p>
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Dumbbell size={14} className="text-red-600" />
            <h2 className="text-[11px] font-black uppercase italic tracking-widest text-white">PLANILHAS ATIVAS</h2>
          </div>
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-white/40 uppercase tracking-widest">
            {workouts.length} ATIVAS
          </span>
        </div>

        <div className="space-y-3">
          {workouts.map((workout) => (
            <div key={workout.id} className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[2.5rem] shadow-xl group hover:border-red-600/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-600">
                  <FileText size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase italic tracking-tighter text-white group-hover:text-red-600 transition-colors">{workout.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Publicado em {new Date(workout.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-red-600 hover:border-red-600 transition-all">
                <Edit2 size={16} />
              </button>
            </div>
          ))}

          {workouts.length === 0 && !loading && (
            <div className="py-12 text-center space-y-4 opacity-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
              <FileText size={32} className="mx-auto" />
              <p className="text-[9px] font-black uppercase tracking-widest">Nenhuma planilha vinculada</p>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4">
          <button className="w-full py-6 border-2 border-dashed border-white/10 rounded-[2.5rem] flex items-center justify-center gap-3 text-white/20 hover:border-red-600/50 hover:text-red-600 transition-all group">
            <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Novo Treino (Editor Padrão)</span>
          </button>
          
          <button className="w-full py-8 bg-red-600 rounded-[2.5rem] flex items-center justify-center gap-4 text-white shadow-2xl shadow-red-600/40 hover:scale-[1.02] active:scale-95 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-black uppercase italic tracking-widest leading-none">Criar Treino</span>
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60">ABFIT AI Biomecânica</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfessorProfile({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-24">
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          <span className="text-[9px] font-black tracking-widest text-white/60 uppercase">PERFIL DO TREINADOR</span>
        </div>
        <button onClick={onBack} className="text-[9px] font-black tracking-widest text-red-600 uppercase">VOLTAR</button>
      </div>

      <div className="relative">
        <div className="h-48 rounded-[3rem] bg-gradient-to-br from-red-600/20 to-transparent border border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-900 border-4 border-black overflow-hidden shadow-2xl">
              <img 
                src="https://picsum.photos/seed/coach/400/400" 
                alt="Professor" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-red-600 border-4 border-black flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform">
              <Camera size={16} />
            </button>
          </div>
          <div className="pb-4 space-y-1">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
              Me. André Brito
            </h2>
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 bg-red-600/20 border border-red-600/30 rounded-md">
                <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">HEAD COACH</span>
              </div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">CREF 012345-G/SP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-4">
        {[
          { label: 'ATLETAS', value: '42', icon: Users },
          { label: 'TREINOS', value: '156', icon: Dumbbell },
          { label: 'RATING', value: '4.9', icon: Star },
        ].map((stat, i) => (
          <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-3xl text-center space-y-2">
            <stat.icon size={14} className="mx-auto text-red-600" />
            <div className="space-y-0.5">
              <p className="text-xl font-black text-white italic tracking-tighter">{stat.value}</p>
              <p className="text-[7px] font-black text-white/20 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Settings size={14} className="text-red-600" />
          <h2 className="text-[11px] font-black uppercase italic tracking-widest text-white">CONFIGURAÇÕES</h2>
        </div>
        
        <div className="space-y-3">
          {[
            { label: 'Dados Profissionais', icon: Award, desc: 'Especializações e Formação' },
            { label: 'Gestão de Planos', icon: Zap, desc: 'Preços e Assinaturas' },
            { label: 'Notificações', icon: Bell, desc: 'Alertas de Atletas' },
            { label: 'Segurança', icon: Target, desc: 'Senha e Acesso' },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-red-600 transition-colors">
                  <item.icon size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">{item.label}</h4>
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{item.desc}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/10 group-hover:text-red-600 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <button className="w-full p-6 bg-red-600/10 border border-red-600/20 rounded-[2rem] flex items-center justify-center gap-3 group hover:bg-red-600 transition-all">
        <LogOut size={20} className="text-red-600 group-hover:text-white" />
        <span className="text-xs font-black uppercase tracking-[0.2em] text-red-600 group-hover:text-white">ENCERRAR SESSÃO</span>
      </button>
    </div>
  );
}
