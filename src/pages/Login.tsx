import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Logo, BackgroundWrapper } from '../components/Layout';
import { User, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Student } from '../types';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [input, setInput] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [showProfiles, setShowProfiles] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, 'students'), orderBy('name', 'asc'));
        const snap = await getDocs(q);
        setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
      } catch (error) {
        console.error("Error fetching students for login:", error);
      }
    };
    fetchStudents();
  }, []);

  const filteredProfiles = [
    { id: 'professor', name: 'PROFESSOR', email: 'professor', role: 'professor', photoURL: null },
    ...students.map(s => ({ ...s, role: 'student' }))
  ].filter(p => 
    p.name.toLowerCase().includes(input.toLowerCase()) || 
    p.email.toLowerCase().includes(input.toLowerCase())
  );

  const handleEnter = () => {
    if (input.toLowerCase() === 'professor') {
      onLogin({ id: 'professor', name: 'Professor André', email: 'Britodeandrade@gmail.com', role: 'professor' });
    } else {
      setShowProfiles(true);
    }
  };

  return (
    <BackgroundWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-black">
        <div className="w-full max-w-md space-y-8 text-center">
          <Logo size="text-6xl" subSize="text-sm" />
          
          <div className="space-y-4 relative">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (e.target.value.length > 0) setShowProfiles(true);
                }}
                onFocus={() => setShowProfiles(true)}
                placeholder="E-MAIL OU 'PROFESSOR'"
                className="w-full px-8 py-6 bg-[#1a1a1a] border-2 border-transparent rounded-full text-center text-lg font-bold uppercase tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-all shadow-2xl"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white/20 animate-pulse" />
            </div>

            <button
              onClick={handleEnter}
              className="w-full py-6 bg-red-600 rounded-full text-lg font-black uppercase italic tracking-[0.2em] text-white shadow-[0_10px_40px_rgba(220,38,38,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
              Entrar no Ecossistema
            </button>

            <AnimatePresence>
              {showProfiles && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-[#121212] border border-zinc-800 rounded-[2rem] overflow-hidden z-50 shadow-2xl max-h-[400px] flex flex-col"
                >
                  <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Selecione um Perfil</span>
                  </div>
                  
                  <div className="overflow-y-auto custom-scrollbar">
                    {filteredProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => onLogin(profile)}
                        className="w-full flex items-center justify-between p-5 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50 last:border-0 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                            {profile.photoURL ? (
                              <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                              <User size={24} className="text-zinc-500" />
                            )}
                          </div>
                          <div className="text-left">
                            <h4 className="text-sm font-black uppercase italic tracking-tighter text-white group-hover:text-red-600 transition-colors">
                              {profile.name}
                            </h4>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                              {profile.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            profile.role === 'professor' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {profile.role === 'professor' ? 'Coach' : 'Aluno'}
                          </span>
                          <ChevronRight size={14} className="text-zinc-700 group-hover:text-red-600 transition-colors" />
                        </div>
                      </button>
                    ))}
                    {filteredProfiles.length === 0 && (
                      <div className="p-10 text-center">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Nenhum perfil encontrado</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-12">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] opacity-50">
              © 2025 Me. André Brito. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
}
