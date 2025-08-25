interface TimerProps {
  timeLeft: string;
}

export default function Timer({ timeLeft }: TimerProps) {
  return (
    <div className="bg-yellow-300 border-4 border-black px-6 py-4 font-black text-xl md:text-2xl text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 w-full max-w-sm text-black">
      {timeLeft ? timeLeft : "Chargement..."}
    </div>
  );
}
