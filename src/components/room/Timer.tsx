interface TimerProps {
  timeLeft: string;
}

export default function Timer({ timeLeft }: TimerProps) {
  return (
    <div className="mb-6 w-full max-w-sm mx-auto">
      <div className="rounded-2xl bg-white/70 backdrop-blur ring-1 ring-black/10 px-6 py-3 text-center shadow">
        <span className="text-lg md:text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-600">
          {timeLeft ? timeLeft : 'Chargement...'}
        </span>
      </div>
    </div>
  );
}
