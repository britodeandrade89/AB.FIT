import React, { useState, useEffect } from 'react';
import { 
  User, Ruler, Weight, Activity, 
  TrendingUp, Calendar, LogOut, Moon, 
  Sun, Settings, ChevronRight, BarChart3,
  Target, Info, Mail, Shield
} from 'lucide-react';
import { Card, HeaderTitle } from '../components/Layout';
import { useTheme } from '../components/ThemeContext';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { PhysicalAssessment, Student } from '../types';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Profile() {
  const { theme, toggleTheme } = useTheme();
  const [student, setStudent] = useState<Student | null>(null);
  const [assessments, setAssessments] = useState<PhysicalAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!auth.currentUser) return;
      try {
        // Fetch student profile
        const studentQuery = query(collection(db, 'students'), where('uid', '==', auth.currentUser.uid), limit(1));
        const studentSnap = await getDocs(studentQuery);
        if (!studentSnap.empty) {
          setStudent(studentSnap.docs[0].data() as Student);
        }

        // Fetch assessments
        const assessmentQuery = query(
          collection(db, 'physical_assessments'), 
          where('studentId', '==', auth.currentUser.uid),
          orderBy('date', 'desc')
        );
        const assessmentSnap = await getDocs(assessmentQuery);
        setAssessments(assessmentSnap.docs.map(doc => doc.data() as PhysicalAssessment));
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const weightData = assessments.slice().reverse().map(a => ({
    date: new Date(a.date).toLocaleDateString('pt-BR', { month: 'short' }),
    weight: a.weight
  }));

  const handleLogout = () => {
    auth.signOut();
  };

  const latestAssessment = assessments[0];

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
            <HeaderTitle text="Meu Perfil" />
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-80">
            Dados antropométricos e configurações.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={toggleTheme}
            className="p-4 bg-card border border-border rounded-2xl text-muted-foreground hover:text-foreground transition-all shadow-xl"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-4 bg-red-600/10 text-red-600 border border-red-600/20 rounded-2xl font-black uppercase italic tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all shadow-xl"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 flex flex-col sm:flex-row items-center gap-8 bg-gradient-to-br from-card to-secondary/20">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-card border-2 border-red-600/30 flex items-center justify-center overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                {auth.currentUser?.photoURL ? (
                  <img src={auth.currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={48} className="text-muted-foreground" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 p-3 bg-red-600 text-white rounded-2xl shadow-xl border-4 border-background group-hover:rotate-12 transition-transform">
                <Settings size={16} />
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                  {auth.currentUser?.displayName || 'Atleta ABFIT'}
                </h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{auth.currentUser?.email}</p>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                <span className="px-4 py-1.5 bg-red-600/10 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-600/20">Membro Premium</span>
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">Status: Ativo</span>
              </div>
            </div>
          </Card>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
                Avaliação <span className="text-red-600">Física</span>
              </h2>
              <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-600 transition-colors flex items-center gap-2">
                Histórico Completo <ChevronRight size={12} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-6 text-center space-y-2 group hover:border-red-600/50 transition-all">
                <Weight className="mx-auto text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
                <span className="block text-2xl font-black italic tracking-tighter text-foreground leading-none">{latestAssessment?.weight || '--'}kg</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Peso</span>
              </Card>
              <Card className="p-6 text-center space-y-2 group hover:border-red-600/50 transition-all">
                <Ruler className="mx-auto text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
                <span className="block text-2xl font-black italic tracking-tighter text-foreground leading-none">{latestAssessment?.height || '--'}cm</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Altura</span>
              </Card>
              <Card className="p-6 text-center space-y-2 group hover:border-red-600/50 transition-all">
                <Activity className="mx-auto text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
                <span className="block text-2xl font-black italic tracking-tighter text-foreground leading-none">{latestAssessment?.bodyFat || '--'}%</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Gordura</span>
              </Card>
              <Card className="p-6 text-center space-y-2 group hover:border-red-600/50 transition-all">
                <TrendingUp className="mx-auto text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
                <span className="block text-2xl font-black italic tracking-tighter text-foreground leading-none">{latestAssessment?.muscleMass || '--'}kg</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Massa Musc.</span>
              </Card>
            </div>

            <Card className="p-8 space-y-6">
              <h3 className="text-lg font-black italic uppercase tracking-tighter text-foreground">Evolução de Peso</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => val.toUpperCase()}
                    />
                    <YAxis 
                      stroke="#888" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#dc2626" 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: '#dc2626', strokeWidth: 2, stroke: '#18181b' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>
        </div>

        <div className="space-y-8">
          <Card className="p-8 space-y-6">
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
              Configurações <span className="text-red-600">Gerais</span>
            </h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50 hover:bg-secondary/50 transition-all group">
                <div className="flex items-center gap-4">
                  <Mail className="text-muted-foreground group-hover:text-red-600 transition-colors" size={18} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Notificações</span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50 hover:bg-secondary/50 transition-all group">
                <div className="flex items-center gap-4">
                  <Shield className="text-muted-foreground group-hover:text-red-600 transition-colors" size={18} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Privacidade</span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50 hover:bg-secondary/50 transition-all group">
                <div className="flex items-center gap-4">
                  <Info className="text-muted-foreground group-hover:text-red-600 transition-colors" size={18} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Sobre o App</span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </button>
            </div>
          </Card>

          <Card className="p-8 space-y-6 bg-gradient-to-br from-card to-emerald-600/5 border-emerald-600/20">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
                Metas <span className="text-emerald-600">Ativas</span>
              </h3>
              <Target className="text-emerald-600/40" size={18} />
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground italic">Redução de BF</span>
                  <span className="text-emerald-500">14% / 12%</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="w-[70%] h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground italic">Massa Muscular</span>
                  <span className="text-emerald-500">42kg / 45kg</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="w-[45%] h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 text-center space-y-4">
            <BarChart3 className="mx-auto text-muted-foreground/20" size={32} />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
              Seus dados são sincronizados automaticamente com a nuvem ABFIT.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
