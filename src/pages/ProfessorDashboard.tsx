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
        
        if (snap.empty) {
          const mockStudents: Student[] = [
            { id: '1', name: 'André Brito', email: 'andrevictorbrito@gmail.com', role: 'student' },
            { id: '2', name: 'Liliane Torres', email: 'lilicatorres@gmail.com', role: 'student' },
            { id: '3', name: 'Marcelly Bispo', email: 'marcellybispo92@gmail.com', role: 'student' },
            { id: '4', name: 'Marcia Brito', email: 'marciabrito@gmail.com', role: 'student' },
            { id: '5', name: 'Rebecca Brito', email: 'rebeccabrito@gmail.com', role: 'student' },
          ];
          setStudents(mockStudents);
        } else {
          setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        // Fallback on error
        setStudents([
          { id: '1', name: 'André Brito', email: 'andrevictorbrito@gmail.com', role: 'student' },
          { id: '2', name: 'Liliane Torres', email: 'lilicatorres@gmail.com', role: 'student' },
          { id: '3', name: 'Marcelly Bispo', email: 'marcellybispo92@gmail.com', role: 'student' },
          { id: '4', name: 'Marcia Brito', email: 'marciabrito@gmail.com', role: 'student' },
          { id: '5', name: 'Rebecca Brito', email: 'rebeccabrito@gmail.com', role: 'student' },
        ]);
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
            <header className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => document.dispatchEvent(new CustomEvent('open-sidenav'))}
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                >
                  <Menu size={20} />
                </button>
                <button 
                  onClick={() => setView('PROFESSOR_PROFILE')}
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-600 transition-all"
                >
                  <User size={20} />
                </button>
              </div>
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
    <div className="flex flex-col h-[calc(100vh-3rem)] animate-in slide-in-from-right duration-500">
      {/* Header */}
      <header className="flex items-center gap-4 pb-6 border-b border-white/5">
        <button 
          onClick={() => document.dispatchEvent(new CustomEvent('open-sidenav'))}
          className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
        <button 
          onClick={onBack}
          className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-sm font-black italic tracking-widest uppercase ml-2">
          FEED GLOBAL <span className="text-red-600">ABFIT</span>
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-6 opacity-40">
          <Camera size={64} strokeWidth={1.5} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">
            Nenhum registro visual ainda
          </p>
        </div>
      </main>

      {/* Footer */}
      <div className="w-full h-px bg-white/10 mb-12" />
      
      <footer className="pb-8 flex flex-col items-center space-y-8">
        <div className="flex gap-6">
          <button className="w-14 h-14 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <Mail size={20} strokeWidth={1.5} />
          </button>
          <button className="w-14 h-14 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <MessageCircle size={20} strokeWidth={1.5} />
          </button>
          <button className="w-14 h-14 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <Phone size={20} strokeWidth={1.5} />
          </button>
        </div>
        <div className="text-center space-y-3">
          <p className="text-[11px] font-black text-white/80 uppercase tracking-[0.4em]">ABFIT PERFORMANCE V2.0</p>
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">© 2025 ME. ANDRÉ BRITO. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}

function PrescreveAI({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<'ACADEMIA' | 'OUTDOOR'>('ACADEMIA');
  const [gender, setGender] = useState<'HOMEM' | 'MULHER'>('MULHER');
  const [filter, setFilter] = useState('TODOS');
  const [selectedTeam, setSelectedTeam] = useState('ÁFRICA DO SUL 26');

  const filters = [
    'TODOS', 'PEITORAL', 'DORSAIS', 'OMBROS', 'BÍCEPS', 'TRÍCEPS', 
    'QUADRÍCEPS', 'POSTERIORES DE COXA', 'GLÚTEOS', 'ADUTORES', 
    'PANTURRILHA', 'PARAVERTEBRAIS', 'ABDOMINAIS'
  ];

  const teams = ['ÁFRICA DO SUL 26', 'REAL MADRID 01', 'FLAMENGO 01 (HOME)', 'FLAMENGO 01 (AWAY)'];

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-24">
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all w-fit">
        <ArrowLeft size={16} />
        <span className="text-[11px] font-black uppercase tracking-widest">Voltar</span>
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#3b82f6] to-[#34d399] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
          <Dumbbell size={48} className="text-white transform -rotate-45" strokeWidth={2.5} />
        </div>
        <div className="space-y-1.5 flex-1">
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#3b82f6] to-[#34d399] leading-none">
            PRESCREVEAI
          </h1>
          <div className="h-px w-full bg-white/20 my-2" />
          <p className="text-[9px] sm:text-[10px] font-bold text-white/60 uppercase tracking-widest">
            Prescrição e Biomecânica de Alta Performance
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex p-1.5 bg-white rounded-2xl shadow-lg">
        <button 
          onClick={() => setMode('ACADEMIA')}
          className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mode === 'ACADEMIA' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-slate-800 hover:bg-slate-50'}`}
        >
          Academia
        </button>
        <button 
          onClick={() => setMode('OUTDOOR')}
          className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mode === 'OUTDOOR' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-slate-800 hover:bg-slate-50'}`}
        >
          Outdoor / Casa
        </button>
      </div>

      {/* Gender Toggle */}
      <div className="flex p-1.5 bg-white rounded-2xl shadow-lg">
        <button 
          onClick={() => setGender('HOMEM')}
          className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${gender === 'HOMEM' ? 'bg-[#1e293b] text-white shadow-md' : 'text-slate-800 hover:bg-slate-50'}`}
        >
          Homem
        </button>
        <button 
          onClick={() => setGender('MULHER')}
          className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${gender === 'MULHER' ? 'bg-[#1e293b] text-white shadow-md' : 'text-slate-800 hover:bg-slate-50'}`}
        >
          Mulher
        </button>
      </div>

      {/* Teams Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0">
        {teams.map((team) => {
          const isSelected = selectedTeam === team;
          return (
            <button 
              key={team} 
              onClick={() => setSelectedTeam(team)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl whitespace-nowrap transition-all shadow-lg ${isSelected ? 'bg-[#3b82f6] text-white' : 'bg-white text-slate-800 hover:bg-slate-50'}`}
            >
              <div className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                {/* Using Layout as fallback for Shirt since Shirt might not be imported yet */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a8.59 8.59 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{team}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#3b82f6]" size={24} />
        <input 
          type="text" 
          placeholder="Qual o exercício de todos vamos prescrever?" 
          className="w-full pl-16 pr-6 py-5 bg-white rounded-[2rem] text-[13px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all shadow-xl"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-2.5">
        {filters.map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-md ${filter === f ? 'bg-[#3b82f6] text-white' : 'bg-white text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Generate Image Button */}
      <div className="pt-6">
        <button className="w-full py-5 bg-gradient-to-r from-[#3b82f6] to-[#34d399] rounded-[2rem] flex items-center justify-center gap-3 text-white shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all group">
          <Sparkles size={24} className="group-hover:animate-pulse" />
          <span className="text-sm font-black uppercase tracking-widest">Gerar Imagem do Exercício</span>
        </button>
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
    { id: 'PLANILHAS', label: 'Planilhas Ativas', icon: Dumbbell, color: 'border-orange-500/30 text-orange-500 bg-orange-500/20' },
    { id: 'RUN', label: 'ABFIT RUN', icon: Footprints, color: 'border-rose-500/30 text-rose-500 bg-rose-500/20' },
    { id: 'PERIODIZACAO', label: 'Periodização Mestre', icon: Brain, color: 'border-indigo-500/30 text-indigo-500 bg-indigo-500/20' },
    { id: 'AVALIACAO', label: 'Avaliação Física', icon: Ruler, color: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/20' },
    { id: 'CORRE_RJ', label: 'Corre RJ 2026', icon: MapPin, color: 'border-amber-500/30 text-amber-500 bg-amber-500/20' },
    { id: 'FEED', label: 'Feed Performance', icon: Layout, color: 'border-red-500/30 text-red-500 bg-red-500/20' },
    { id: 'ANALYTICS', label: 'Análise de Dados', icon: BarChart3, color: 'border-blue-500/30 text-blue-500 bg-blue-500/20' },
    { id: 'HISTORY', label: 'Histórico de Treinos', icon: History, color: 'border-teal-500/30 text-teal-500 bg-teal-500/20' },
    { id: 'ABOUT', label: 'Sobre a ABFIT', icon: Info, color: 'border-zinc-500/30 text-zinc-400 bg-zinc-500/20' },
  ];

  // Split name for styling
  const nameParts = student.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 px-2">
        <button 
          onClick={onBack} 
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black uppercase italic tracking-tighter">
          <span className="text-white">{firstName}</span>
          {lastName && <span className="text-red-600 ml-1">{lastName}</span>}
        </h1>
      </div>

      {/* Menu Items List */}
      <div className="space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center justify-between p-4 bg-[#0a0a0a] border rounded-2xl transition-all group hover:bg-white/5 ${item.color.split(' ')[0]}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color.split(' ')[2]} ${item.color.split(' ')[1]}`}>
                <item.icon size={18} />
              </div>
              <span className="text-[11px] font-black uppercase italic tracking-widest text-white">{item.label}</span>
            </div>
            <ChevronRight size={18} className={item.color.split(' ')[1]} />
          </button>
        ))}
      </div>

      {/* Workouts Section */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black uppercase italic tracking-[0.2em] text-white/40">GERENCIAR PLANILHAS</h2>
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] font-black text-white/60 uppercase tracking-widest">
            {workouts.length} ATIVAS
          </span>
        </div>

        <div className="space-y-3">
          {workouts.map((workout) => (
            <div key={workout.id} className="flex items-center justify-between p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
              <div className="flex items-center gap-4">
                <h4 className="text-sm font-black uppercase italic tracking-tighter text-white">{workout.name}</h4>
                <span className="px-2 py-0.5 rounded border border-emerald-500/30 text-[8px] font-black uppercase tracking-widest text-emerald-500">Publicado</span>
              </div>
              <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <Edit2 size={16} />
              </button>
            </div>
          ))}

          {workouts.length === 0 && !loading && (
            <div className="py-8 text-center space-y-3 opacity-40 border border-dashed border-white/10 rounded-2xl">
              <FileText size={24} className="mx-auto" />
              <p className="text-[9px] font-black uppercase tracking-widest">Nenhuma planilha vinculada</p>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <button className="w-full py-5 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-3 text-white/40 hover:border-white/20 hover:text-white transition-all group bg-[#0a0a0a]">
            <Plus size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Novo Treino (Editor Padrão)</span>
          </button>
          
          <button className="w-full py-5 bg-[#c81e1e] hover:bg-[#b91c1c] rounded-2xl flex items-center justify-center gap-3 text-white transition-all shadow-lg shadow-red-900/20">
            <Sparkles size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest">Criar Treino (ABFIT AI)</span>
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
