interface TimerProps {
  timeLeft: string;
}

export default function Timer({ timeLeft }: TimerProps) {
  // Compute progress to noon (12:00 Europe/Paris) from start of day (00:00)
  const computePercentToNoon = () => {
    try {
      const now = new Date();
      const parisNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
      const start = new Date(parisNow);
      start.setHours(0, 0, 0, 0);
      const noon = new Date(parisNow);
      noon.setHours(12, 0, 0, 0);

      const total = (noon.getTime() - start.getTime()) / 1000; // 12h = 43200s
      const left = Math.max(0, (noon.getTime() - parisNow.getTime()) / 1000);
      const pct = Math.max(0, Math.min(100, (left / total) * 100));
      return pct;
    } catch {
      return 0;
    }
  };

  const percent = computePercentToNoon();
  return (
    <div className="mb-6 w-full max-w-sm mx-auto">
      <div className="rounded-2xl bg-white/70 backdrop-blur ring-1 ring-black/10 px-6 py-3 text-center shadow">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl" aria-hidden>⏳</span>
          <span className="text-lg md:text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-orange-600">
            {timeLeft ? timeLeft : 'Chargement...'}
          </span>
        </div>
        {/* Progress to noon */}
        <div className="mt-2 h-2 w-full rounded-full bg-black/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-rose-500 to-orange-500"
            style={{ width: `${percent}%`, transition: 'width 1s linear' }}
            aria-hidden
          />
        </div>
        <div className="mt-1 text-[11px] font-semibold text-black/60">Clôture à 12:00</div>
      </div>
    </div>
  );
}
