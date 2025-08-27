interface User {
  id: string;
  name: string;
  color: string;
  restaurantIndex: number;
  online: boolean;
}

interface LeaderboardEntry {
  votes: number;
  voters: User[];
}

interface Leaderboard {
  [restaurantName: string]: LeaderboardEntry;
}

interface LeaderboardProps {
  leaderboard: Leaderboard;
  isHidden: boolean;
}

export default function Leaderboard({ leaderboard, isHidden }: LeaderboardProps) {
  return (
    <div className="text-black">
      <h2 className="text-xl font-semibold mb-3 text-center">🏆 Classement</h2>
      <div className="space-y-3">
        {Object.entries(leaderboard)
          .sort(([, a], [, b]) => b.votes - a.votes)
          .map(([name, { votes, voters }]) => (
            <div key={name}>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="truncate">{name}</span>
                <span className="rounded-full bg-white/70 backdrop-blur ring-1 ring-black/10 px-2.5 py-0.5 text-xs shadow font-bold">
                  {isHidden ? '?' : votes}
                </span>
              </div>
              {!isHidden && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {voters.map(v => (
                    <div 
                      key={v.id} 
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow ring-2 ring-white/80"
                      style={{ backgroundColor: v.color }}
                      title={v.name}
                    >
                      {v.name.substring(0, 1).toUpperCase()}
                    </div>
                  ))}
                </div>
              )}
            </div>
        ))}
      </div>
    </div>
  );
}
