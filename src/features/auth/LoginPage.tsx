import React from 'react';
import { useAuth } from '@app/context/AuthContext';
import { Navigate, useLocation } from 'react-router';
import { ShieldAlert, Fingerprint, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import BananLoader from '@app/components/shared/BananLoader';

const LoginPage: React.FC = () => {
  const { authenticated, login, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/clicker';

  if (loading) return <BananLoader message="AUTHENTIFICATION..." />;

  if (authenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 relative overflow-hidden banan-grid">
      {/* Structural Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-banan-primary/20 to-transparent"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full relative"
      >
        {/* Corner Brackets */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-banan-primary z-10"></div>
        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-banan-primary z-10"></div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-banan-primary z-10"></div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-banan-primary z-10"></div>

        <div className="bg-banan-black border border-white/10 p-10 text-center relative overflow-hidden">
          {/* Internal Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none banan-grid"></div>
          
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse bg-banan-primary/20 blur-xl rounded-full"></div>
              <div className="relative p-5 bg-white/5 border border-white/10 rounded-full">
                <Fingerprint className="w-12 h-12 text-banan-primary" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-banan-primary" />
              <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-banan-primary/60">Protocole de Sécurité v4.20</span>
            </div>
            <h1 className="text-2xl font-sans font-black uppercase tracking-tighter leading-none text-white">
              Authentification <span className="text-banan-primary">Requise</span>
            </h1>
            <p className="font-mono text-xs text-white/60 uppercase tracking-widest mt-4">
              Accès réservé au personnel autorisé. La connexion via le service CAS est nécessaire pour accéder aux protocoles bananiers.
            </p>
          </div>

          <div className="relative group">
            <button
              onClick={login}
              className="w-full bg-transparent hover:bg-banan-primary border border-banan-primary text-banan-primary hover:text-black font-mono font-bold py-5 px-6 transition-all flex items-center justify-center gap-4 active:scale-[0.98] uppercase tracking-widest text-sm relative"
            >
              <Lock className="w-4 h-4" />
              S'authentifier
              <div className="absolute top-0 right-0 p-1">
                <div className="w-1 h-1 bg-banan-primary group-hover:bg-black transition-colors"></div>
              </div>
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-2">
            <div className="w-full h-px bg-white/5"></div>
            <div className="flex justify-between items-center font-mono text-[11px] uppercase tracking-tighter text-white/60">
              <span>Statut : En attente d'authentification</span>
              <span>Enc: OIDC/S256</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative Floor Label */}
      <div className="absolute bottom-10 left-10 hidden md:block opacity-20">
        <div className="font-mono text-[10px] uppercase tracking-[0.5em] vertical-text transform -rotate-90 origin-left">
          BANAN-INT // SECTEUR_67 // SIX-SEVEN MDR
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
