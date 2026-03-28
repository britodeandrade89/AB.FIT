import React, { useState } from 'react';
import { 
  Footprints, ArrowLeft, Menu, TrendingUp, 
  Play, ChevronLeft, ChevronRight, Clock,
  RefreshCw, Info
} from 'lucide-react';
import { Card } from '../components/Layout';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function RunTrack() {
  const navigate = useNavigate();
  const [currentMonth] = useState('MARÇO 2026');

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const weeklyWorkouts = [
    { day: 'SEGUNDA', type: 'REGENERATIVO', duration: '30 MIN', details: "10' AQ + 10 BLOCOS DE 1' CO 9KM/H : 2' CA + 10' REC", active: false },
    { day: 'TERÇA', type: 'LONGÃO', duration: '30 MIN', details: "10' AQ + 30' CO 6KM/H + 10' REC", note: "Caminhada continua forte", active: false },
    { day: 'QUARTA', type: 'RITMO / TEMPO', duration: '30 MIN', details: "10' AQ + 6 BLOCOS DE 3' CO 8KM/H : 3' CA + 10' REC", active: false },
    { day: 'QUINTA', type: 'LONGÃO', duration: '30 MIN', details: "10' AQ + 30' CO 6KM/H + 10' REC", note: "Caminhada continua forte", active: true },
    { day: 'SEXTA', type: 'INTERVALADO', duration: '44 MIN', details: "10' AQ + 8 BLOCOS DE 2' CO 8KM/H : 1' CA + 10' REC", active: false },
  ];

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
          <span className="text-xl font-black italic tracking-tighter uppercase">ABFIT <span className="text-red-600">RUN</span></span>
        </div>
      </header>

      {/* Weekly Volume */}
      <Card className="p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-1 h-3 bg-red-600 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">VOLUME SEMANAL</span>
            </div>
            <h2 className="text-4xl font-black italic tracking-tighter">8h 20min</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600">
            <TrendingUp size={24} />
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-8 bg-white/[0.03] border-white/10">
        <div className="flex items-center justify-between mb-8">
          <button className="text-white/40 hover:text-white"><ChevronLeft size={20} /></button>
          <h3 className="text-sm font-black italic tracking-widest uppercase">{currentMonth}</h3>
          <button className="text-white/40 hover:text-white"><ChevronRight size={20} /></button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-8">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] font-black text-white/40 mb-2">{day}</div>
          ))}
          {calendarDays.map(day => {
            const isToday = day === 22;
            const hasWorkout = [25, 26, 27, 28, 29, 30, 31].includes(day);
            return (
              <div key={day} className="aspect-square flex flex-col items-center justify-center relative group cursor-pointer">
                <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isToday ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-500' : 
                  hasWorkout ? 'bg-white/5 border border-white/10 text-white/80' : 'text-white/20'
                }`}>
                  <span className="text-[11px] font-black">{day}</span>
                  {hasWorkout && <span className="text-[6px] font-bold opacity-60">INT</span>}
                </div>
                {hasWorkout && !isToday && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-600 rounded-full border border-black" />
                )}
                {isToday && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-black" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-6 text-[8px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-600" /> TREINO</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> CONCLUÍDO</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-950" /> FALTA</div>
        </div>
      </Card>

      {/* Today's Workout */}
      <Card className="p-8 bg-gradient-to-br from-red-600/10 to-red-900/20 border-red-600/30 relative overflow-hidden group cursor-pointer">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
        <div className="flex justify-between items-center">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest">TREINO DE HOJE</div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter">LONGÃO</h3>
              <p className="text-xs font-bold text-white/60 italic">Caminhada continua forte</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/40">CLIQUE PARA REGISTRAR</span>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-black group-hover:scale-110 transition-transform">
              <Play size={24} fill="currentColor" />
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly List */}
      <div className="space-y-6 pt-8">
        <div className="flex items-center gap-3 text-white/40">
          <TrendingUp size={18} />
          <h3 className="text-sm font-black uppercase tracking-[0.3em]">SEMANA</h3>
        </div>

        <div className="space-y-4">
          {weeklyWorkouts.map((workout, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`p-8 bg-white/[0.03] border-white/10 relative overflow-hidden ${workout.active ? 'ring-2 ring-red-600/50' : ''}`}>
                {workout.active && (
                  <div className="absolute top-0 left-0 px-3 py-1 bg-red-600 rounded-br-xl text-[8px] font-black uppercase tracking-widest z-10">
                    TREINO DE HOJE
                  </div>
                )}
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-1 h-3 bg-red-600 rounded-full" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{workout.day}</span>
                    </div>
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter">{workout.type}</h4>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                    <Clock size={12} className="text-white/40" />
                    <span className="text-[10px] font-black italic tracking-tighter">{workout.duration}</span>
                  </div>
                </div>

                <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                  <p className="text-xs font-black italic tracking-widest text-center leading-relaxed">
                    {workout.details.split(' ').map((word, i) => (
                      <span key={i} className={word === '+' || word === ':' ? 'text-red-600 mx-1' : ''}>{word} </span>
                    ))}
                  </p>
                </div>

                {workout.note && (
                  <div className="mt-4 p-4 bg-white/5 rounded-xl border-l-2 border-red-600/50">
                    <p className="text-[10px] font-bold italic text-white/40">"{workout.note}"</p>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <Card className="p-8 bg-white/[0.03] border-white/10 mt-12">
        <div className="flex items-center gap-3 text-white/40 mb-6">
          <Info size={16} />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">LEGENDA</h3>
        </div>
        <div className="grid grid-cols-2 gap-y-6 gap-x-12">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">AQ</span>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">AQUECIMENTO</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">CO</span>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">CORRIDA</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">CA</span>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">CAMINHADA</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">REC</span>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">RECUPERAÇÃO</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">:</span>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">ALTERNÂNCIA</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
