import React, { useState } from 'react';
import { 
  ArrowLeft, Menu, TrendingUp, 
  Target, Calendar, ChevronRight,
  RefreshCw, Info
} from 'lucide-react';
import { Card } from '../components/Layout';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Periodization() {
  const navigate = useNavigate();

  const timeline = [
    { month: '03', name: 'MARÇO', phase: 'BASE', details: 'Foco em resistência aeróbica e técnica de corrida.', active: true },
    { month: '04', name: 'ABRIL', phase: 'TRANSIÇÃO', details: 'Aumento gradual de intensidade e volume.', active: false },
    { month: '05', name: 'MAIO', phase: 'POLIMENTO', details: 'Ajustes finos e redução de volume para o pico.', active: false },
    { month: '06', name: 'JUNHO', phase: 'PICO', details: 'Semana da competição principal.', active: false },
  ];

  const objectives = [
    { title: 'MEIA MARATONA', date: '22 JUN 2026', progress: 65 },
    { title: '5KM RECORD', date: '15 MAI 2026', progress: 40 },
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
          <span className="text-xl font-black italic tracking-tighter uppercase">PERIODIZAÇÃO <span className="text-red-600">MESTRE</span></span>
        </div>
      </header>

      {/* Current Status */}
      <Card className="p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-1 h-3 bg-red-600 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">ESTADO ATUAL</span>
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">PRÉ-COMPETITIVO</h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Faltam 4 semanas para o pico de performance</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600">
            <TrendingUp size={24} />
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <div className="space-y-6 pt-8">
        <div className="flex items-center gap-3 text-white/40">
          <Calendar size={18} />
          <h3 className="text-sm font-black uppercase tracking-[0.3em]">CRONOGRAMA</h3>
        </div>

        <div className="space-y-12 relative before:absolute before:left-[2.5rem] before:top-0 before:bottom-0 before:w-px before:bg-white/10">
          {timeline.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-20"
            >
              {/* Large Number Background */}
              <div className="absolute left-0 top-0 flex items-center gap-4">
                <span className={`text-6xl font-black italic tracking-tighter leading-none ${item.active ? 'text-red-600' : 'text-white/10'}`}>
                  {item.month}
                </span>
                <span className="writing-vertical text-[10px] font-black tracking-widest text-white/20 uppercase">
                  {item.name}
                </span>
              </div>

              <Card className={`p-8 bg-white/[0.03] border-white/10 relative overflow-hidden ${item.active ? 'ring-2 ring-red-600/50' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-1 h-3 bg-red-600 rounded-full" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">FASE</span>
                    </div>
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter">{item.phase}</h4>
                  </div>
                  {item.active && (
                    <div className="px-3 py-1 bg-red-600 rounded-lg text-[8px] font-black uppercase tracking-widest">ATUAL</div>
                  )}
                </div>
                <p className="text-xs font-bold text-white/40 leading-relaxed">{item.details}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Objectives */}
      <div className="space-y-6 pt-12">
        <div className="flex items-center gap-3 text-white/40">
          <Target size={18} />
          <h3 className="text-sm font-black uppercase tracking-[0.3em]">OBJETIVOS</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {objectives.map((obj, idx) => (
            <div key={idx}>
              <Card className="p-6 bg-white/[0.03] border-white/10 group cursor-pointer hover:bg-white/[0.05] transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <h4 className="text-lg font-black italic uppercase tracking-tighter">{obj.title}</h4>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{obj.date}</p>
                  </div>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-red-600 transition-colors" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                    <span className="text-white/40">PROGRESSO</span>
                    <span className="text-red-600">{obj.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]" 
                      style={{ width: `${obj.progress}%` }}
                    />
                  </div>
                </div>
              </Card>
            </div>
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
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">BASE</span>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">ADAPTAÇÃO E TÉCNICA</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">TRANSIÇÃO</span>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">AUMENTO DE CARGA</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">POLIMENTO</span>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">RECUPERAÇÃO ATIVA</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">PICO</span>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">MÁXIMA PERFORMANCE</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
