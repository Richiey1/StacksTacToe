export default function Home() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 py-16 text-center space-y-8">
        {/* Badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-amber-200">
            🎮 Blockchain Gaming
          </span>
        </div>

        {/* Hero Section */}
        <div className="space-y-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-white">
            StacksTacToe
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto">
            Classic Tic-Tac-Toe meets blockchain technology
          </p>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Play provably fair games on the Stacks blockchain. Challenge opponents, 
            compete for glory, and experience gaming with true transparency.
          </p>
        </div>

        {/* Game Preview Grid */}
        <div className="pt-8 flex justify-center">
          <div className="inline-grid grid-cols-3 gap-3 p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 shadow-xl shadow-black/20">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-3xl sm:text-4xl font-bold text-slate-600 hover:border-amber-400/50 hover:bg-white/10 transition-all duration-200"
              >
                {i === 0 ? '✕' : i === 4 ? '○' : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 max-w-3xl mx-auto">
          <div className="rounded-xl border border-white/5 bg-white/5 px-5 py-6">
            <div className="text-3xl mb-3">⛓️</div>
            <h3 className="text-lg font-semibold text-white mb-2">On-Chain Logic</h3>
            <p className="text-sm text-slate-400">
              All game moves verified and stored on the blockchain
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 px-5 py-6">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="text-lg font-semibold text-white mb-2">Provably Fair</h3>
            <p className="text-sm text-slate-400">
              Transparent outcomes with immutable game history
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 px-5 py-6">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg font-semibold text-white mb-2">Multiplayer</h3>
            <p className="text-sm text-slate-400">
              Challenge friends or compete against other players
            </p>
          </div>
        </div>

        {/* Coming Soon Badge */}
        <div className="pt-8">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-400/10 via-amber-500/10 to-amber-600/10 border border-amber-400/20 px-6 py-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="text-sm font-semibold text-amber-200">
              Game features coming soon
            </span>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="pt-8 text-xs uppercase tracking-[0.14em] text-slate-500">
          Built with Stacks • Clarity • Next.js
        </div>
      </div>
    </div>
  );
}
