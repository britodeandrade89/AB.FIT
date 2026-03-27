import React from 'react';
import { auth } from '../services/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Logo, BackgroundWrapper } from '../components/Layout';
import { LogIn } from 'lucide-react';

export default function Login() {
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <BackgroundWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md space-y-12 text-center">
          <Logo size="text-6xl" subSize="text-sm" />
          
          <div className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
              Acesse sua <span className="text-red-600">Performance</span>
            </h2>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
              Entre com sua conta Google para acessar seus treinos, avaliações e planos nutricionais.
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="group relative w-full flex items-center justify-center gap-4 px-8 py-5 bg-card border border-border rounded-[2rem] shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <LogIn className="text-red-600 group-hover:rotate-12 transition-transform" size={24} />
            <span className="text-lg font-black uppercase italic tracking-widest text-foreground">Entrar com Google</span>
          </button>

          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-50">
            © 2025 Me. André Brito. All Rights Reserved.
          </p>
        </div>
      </div>
    </BackgroundWrapper>
  );
}
