import React, { useState, useEffect } from 'react';
import { 
  User, Ruler, Weight, Activity, 
  TrendingUp, Calendar, LogOut, Moon, 
  Sun, Settings, ChevronRight, BarChart3,
  Target, Info, Mail, Shield, ArrowLeft, Menu, RefreshCw
} from 'lucide-react';
import { Card } from '../components/Layout';
import { useTheme } from '../components/ThemeContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { PhysicalAssessment, Student } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Profile() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [assessments, setAssessments] = useState<PhysicalAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      const savedUser = localStorage.getItem('abfit-session');
      if (!savedUser) {
        navigate('/login');
        return;
      }
      
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      try {
        // Fetch assessments
        const assessmentQuery = query(
          collection(db, 'physical_assessments'), 
          where('studentId', '==', parsedUser.uid || parsedUser.id),
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
  }, [navigate]);

  const weightData = assessments.slice().reverse().map(a => ({
    date: new Date(a.date).toLocaleDateString('pt-BR', { month: 'short' }),
    weight: a.weight
  }));

  const handleLogout = () => {
    localStorage.removeItem('abfit-session');
    navigate('/login');
  };

  const latestAssessment = assessments[0];

  return (
    <div className="min-h-screen bg-black text-white p-6 sm:p-10 space-y-8 max-w-3xl mx-auto relative pb-20">
      <header className="flex items-center justify-between pt-4 mb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => document.dispatchEvent(new CustomEvent('open-sidenav'))}
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
          >
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
          <span className="text-xl font-black italic tracking-tighter uppercase">MEU <span className="text-red-600">PERFIL</span></span>
        </div>
      </header>

      {/* Profile Card */}
      <Card className="p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 border-2 border-red-600/30 flex items-center justify-center overflow-hidden shadow-2xl">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={48} className="text-white/20" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 p-3 bg-red-600 text-white rounded-2xl shadow-xl border-4 border-black">
              <Settings size={16} />
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left space-y-4">
            <div className="space-y-1">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
                {user?.displayName || user?.name || 'Atleta ABFIT'}
              </h2>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{user?.email}</p>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <span className="px-4 py-1.5 bg-red-600/10 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-600/20">Membro Premium</span>
              <button 
                onClick={handleLogout}
                className="px-4 py-1.5 bg-white/5 text-white/40 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 hover:bg-red-600 hover:text-white transition-all"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Physical Assessment Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-6 text-center space-y-2 bg-white/[0.03] border-white/10 group hover:border-red-600/50 transition-all">
          <Weight className="mx-auto text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-2xl font-black italic tracking-tighter text-white leading-none">{latestAssessment?.weight || '--'}kg</span>
          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest block">Peso</span>
        </Card>
        <Card className="p-6 text-center space-y-2 bg-white/[0.03] border-white/10 group hover:border-red-600/50 transition-all">
          <Ruler className="mx-auto text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-2xl font-black italic tracking-tighter text-white leading-none">{latestAssessment?.height || '--'}cm</span>
          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest block">Altura</span>
        </Card>
        <Card className="p-6 text-center space-y-2 bg-white/[0.03] border-white/10 group hover:border-red-600/50 transition-all">
          <Activity className="mx-auto text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-2xl font-black italic tracking-tighter text-white leading-none">{latestAssessment?.bodyFat || '--'}%</span>
          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest block">Gordura</span>
        </Card>
        <Card className="p-6 text-center space-y-2 bg-white/[0.03] border-white/10 group hover:border-red-600/50 transition-all">
          <TrendingUp className="mx-auto text-red-600/40 group-hover:text-red-600 transition-colors" size={20} />
          <span className="block text-2xl font-black italic tracking-tighter text-white leading-none">{latestAssessment?.muscleMass || '--'}kg</span>
          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest block">Massa Musc.</span>
        </Card>
      </div>

      {/* Evolution Chart */}
      <Card className="p-8 space-y-6 bg-white/[0.03] border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black italic uppercase tracking-widest">EVOLUÇÃO DE PESO</h3>
          <BarChart3 size={16} className="text-white/20" />
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => val.toUpperCase()}
              />
              <YAxis 
                stroke="#666" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#dc2626" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#dc2626', strokeWidth: 2, stroke: '#000' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Settings Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">CONFIGURAÇÕES</h3>
        <div className="space-y-2">
          {[
            { icon: Mail, label: 'Notificações' },
            { icon: Shield, label: 'Privacidade' },
            { icon: Info, label: 'Sobre o App' },
            { icon: Sun, label: 'Tema', action: toggleTheme }
          ].map((item, idx) => (
            <button 
              key={idx}
              onClick={item.action}
              className="w-full flex items-center justify-between p-5 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <item.icon className="text-white/20 group-hover:text-red-600 transition-colors" size={18} />
                <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              </div>
              <ChevronRight size={14} className="text-white/20" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
