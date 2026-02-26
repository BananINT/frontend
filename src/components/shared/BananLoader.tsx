interface BananLoaderProps {
  message?: string;
}

export default function BananLoader({ message = "CHARGEMENT..." }: BananLoaderProps) {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center font-mono py-20">
      <div className="text-banan-primary text-xl animate-pulse tracking-[0.5em] mb-4">
        {message}
      </div>
      <div className="w-48 h-1 bg-white/10 relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-banan-primary animate-[shimmer_2s_infinite]" 
          style={{ width: '40%' }}
        />
      </div>
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}
      </style>
    </div>
  );
}
