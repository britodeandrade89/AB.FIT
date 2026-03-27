import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Bot, 
  ChevronRight, Activity, TrendingUp, 
  Target, Brain, MessageCircle, 
  Calendar, Filter, MoreVertical,
  UserPlus, FileText, Zap, User, BarChart3
} from 'lucide-react';
import { Card, HeaderTitle } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../services/firebase';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { Student } from '../types';

export default function ProfessorDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
            <HeaderTitle text="Gestão de Alunos" />
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-80">
            Controle de performance e prescrição.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-3 px-6 py-4 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-red-600 transition-all shadow-xl">
            <Bot size={16} className="text-red-600" /> AI Coach
          </button>
          <button className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-105 transition-all">
            <UserPlus size={18} /> Novo Aluno
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2 group hover:border-red-600/50 transition-all">
          <Users className="text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-3xl font-black italic tracking-tighter text-foreground leading-none">{students.length}</span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Alunos Ativos</span>
        </Card>
        <Card className="p-6 space-y-2 group hover:border-red-600/50 transition-all">
          <Activity className="text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-3xl font-black italic tracking-tighter text-foreground leading-none">92%</span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Taxa de Adesão</span>
        </Card>
        <Card className="p-6 space-y-2 group hover:border-red-600/50 transition-all">
          <TrendingUp className="text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-3xl font-black italic tracking-tighter text-foreground leading-none">15</span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Avaliações Pendentes</span>
        </Card>
        <Card className="p-6 space-y-2 group hover:border-red-600/50 transition-all">
          <Zap className="text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-3xl font-black italic tracking-tighter text-foreground leading-none">42</span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Treinos Hoje</span>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="BUSCAR ALUNO POR NOME OU EMAIL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-card border border-border rounded-2xl text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
        <button className="px-6 py-4 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-2">
          <Filter size={16} /> Filtros
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredStudents.map((student, idx) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              layout
            >
              <Card className="group relative h-full flex flex-col hover:border-red-600/50 transition-all duration-500">
                <div className="p-8 space-y-6 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-card border border-border flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-110 transition-transform">
                      {student.photoURL ? (
                        <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User size={32} className="text-muted-foreground" />
                      )}
                    </div>
                    <button className="p-2 text-muted-foreground hover:text-foreground">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground leading-none group-hover:text-red-600 transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      {student.email}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="flex flex-col">
                      <span className="text-xs font-black italic tracking-tighter text-foreground leading-none">{student.objective || 'Hipertrofia'}</span>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Objetivo</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black italic tracking-tighter text-foreground leading-none">{student.lastWorkoutDate ? new Date(student.lastWorkoutDate).toLocaleDateString('pt-BR') : 'Sem dados'}</span>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Último Treino</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest">
                      <span className="text-muted-foreground italic">Adesão ao Plano</span>
                      <span className="text-red-600">85%</span>
                    </div>
                    <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-secondary/30 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                    <FileText size={12} /> Prescrever
                  </button>
                  <button className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all">
                    <MessageCircle size={14} />
                  </button>
                  <button className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-red-600 transition-all">
                    <BarChart3 size={14} />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
