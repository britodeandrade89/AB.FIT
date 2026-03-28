import React from 'react';
import { 
  Dumbbell, Footprints, Brain, Ruler, 
  MapPin, Layout, BarChart3, Info, 
  LogOut, Mail, MessageCircle, Phone,
  Camera, RefreshCw, Menu
} from 'lucide-react';
import { Logo, BackgroundCarousel, FITNESS_IMAGES } from '../components/Layout';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const savedUser = localStorage.getItem('abfit-session');
  const user = savedUser ? JSON.parse(savedUser) : null;

  const menuItems = [
    { id: 'WORKOUTS', label: 'PLANILHAS ATIVAS', icon: Dumbbell, color: 'from-orange-600/20 to-orange-900/40', borderColor: 'border-orange-500/30', iconColor: 'text-orange-500', path: '/workouts' },
    { id: 'RUN', label: 'ABFIT RUN', icon: Footprints, color: 'from-rose-600/20 to-rose-900/40', borderColor: 'border-rose-500/30', iconColor: 'text-rose-500', path: '/run' },
    { id: 'PERIODIZATION', label: 'PERIODIZAÇÃO MESTRE', icon: Brain, color: 'from-indigo-600/20 to-indigo-900/40', borderColor: 'border-indigo-500/30', iconColor: 'text-indigo-500', path: '/periodization' },
    { id: 'ASSESSMENT', label: 'AVALIAÇÃO FÍSICA', icon: Ruler, color: 'from-emerald-600/20 to-emerald-900/40', borderColor: 'border-emerald-500/30', iconColor: 'text-emerald-500', path: '/assessment' },
    { id: 'CORRE_RJ', label: 'CORRE RJ 2026', icon: MapPin, color: 'from-yellow-600/20 to-yellow-900/40', borderColor: 'border-yellow-500/30', iconColor: 'text-yellow-500', path: '/corre-rj' },
    { id: 'FEED', label: 'FEED PERFORMANCE', icon: Layout, color: 'from-red-600/20 to-red-900/40', borderColor: 'border-red-500/30', iconColor: 'text-red-500', path: '/feed' },
    { id: 'ANALYTICS', label: 'ANÁLISE DE DADOS', icon: BarChart3, color: 'from-blue-600/20 to-blue-900/40', borderColor: 'border-blue-500/30', iconColor: 'text-blue-500', path: '/analytics' },
    { id: 'ABOUT', label: 'SOBRE A ABFIT', icon: Info, color: 'from-zinc-600/20 to-zinc-900/40', borderColor: 'border-zinc-500/30', iconColor: 'text-zinc-500', path: '/about' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('abfit-session');
    window.location.href = '/login';
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center pt-12 pb-20 px-6 overflow-x-hidden">
      <BackgroundCarousel images={FITNESS_IMAGES} />
      
      <button 
        onClick={() => document.dispatchEvent(new CustomEvent('open-sidenav'))}
        className="absolute top-6 left-6 z-[70] p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white shadow-2xl transition-all hover:scale-110"
      >
        <Menu size={20} />
      </button>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <Logo size="text-5xl" subSize="text-[10px]" />
      </motion.div>

      {/* Profile Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center mb-12"
      >
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-[2.5rem] bg-zinc-800 border-2 border-red-600/50 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.2)]">
            <div className="text-zinc-600">
              <Camera size={40} />
            </div>
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-600 rounded-full border-2 border-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <Camera size={14} className="text-white" />
          </button>
        </div>
        <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">
          {user?.displayName || 'ANDRÉ BRITO'}
        </h2>
      </motion.div>

      {/* Menu Grid */}
      <div className="w-full max-w-md space-y-4 mb-12">
        {menuItems.map((item, idx) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.05 }}
            onClick={() => navigate(item.path)}
            className={`w-full group relative flex items-center gap-6 p-1 rounded-[1.8rem] border ${item.borderColor} bg-gradient-to-r ${item.color} backdrop-blur-md hover:scale-[1.02] transition-all duration-300 shadow-xl overflow-hidden`}
          >
            <div className={`w-14 h-14 rounded-2xl bg-black/40 flex items-center justify-center ${item.iconColor} shadow-inner group-hover:scale-110 transition-transform`}>
              <item.icon size={24} />
            </div>
            <span className="text-sm font-black italic tracking-widest text-white uppercase">
              {item.label}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ))}

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-4 p-5 rounded-[1.8rem] border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all group mt-8"
        >
          <LogOut size={18} className="text-white/40 group-hover:text-red-600 transition-colors" />
          <span className="text-xs font-black tracking-[0.3em] text-white/60 uppercase">FINALIZAR SESSÃO</span>
        </motion.button>
      </div>

      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="w-full max-w-md pt-12 border-t border-white/10 text-center"
      >
        <div className="flex justify-center gap-6 mb-8">
          <button className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-red-600 transition-all border border-white/5">
            <Mail size={20} />
          </button>
          <button className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-emerald-600 transition-all border border-white/5">
            <MessageCircle size={20} />
          </button>
          <button className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-blue-600 transition-all border border-white/5">
            <Phone size={20} />
          </button>
        </div>
        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em] mb-2">ABFIT PERFORMANCE V2.0</p>
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">© 2025 ME. ANDRÉ BRITO. ALL RIGHTS RESERVED.</p>
      </motion.div>
    </div>
  );
}
