export default function LuxuryShowroomPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black overflow-hidden">
      {/* Cinematographic background with gradient and spotlight effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-black to-slate-950" />
        
        {/* Spotlight effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl opacity-25" />
      </div>
    </div>
  );
}
