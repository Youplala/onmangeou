interface TimerProps {
  timeLeft: string;
  progress?: number;
}

export default function Timer({ timeLeft, progress = 0 }: TimerProps) {
  return (
    <div className="mb-4 w-full max-w-sm mx-auto">
      <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-black/10 px-4 py-3 text-center shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg" aria-hidden>⏳</span>
          <span className="text-base md:text-lg font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
            {timeLeft ? timeLeft : 'Initialisation...'}
          </span>
        </div>
        
        {/* Simple progress bar */}
        <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-rose-500 to-orange-500"
            style={{ width: `${100 - progress}%`, transition: 'width 1s linear' }}
            aria-hidden
          />
        </div>
        <div className="mt-1 text-xs font-semibold text-black/60">Temps restant</div>
      </div>
    </div>
  );
}
