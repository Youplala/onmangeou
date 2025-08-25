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
}

export default function Leaderboard({ leaderboard }: LeaderboardProps) {
  return (
    <div className="bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 text-black">
      <h2 className="text-2xl font-black mb-4 text-center">🏆 CLASSEMENT</h2>
      <div className="space-y-4">
        {Object.entries(leaderboard)
          .sort(([, a], [, b]) => b.votes - a.votes)
          .map(([name, { votes, voters }]) => (
            <div key={name}>
              <div className="flex justify-between items-center font-black text-lg">
                <span>{name}</span>
                <span>{votes} VOTE{votes > 1 ? 'S' : ''}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {voters.map(v => (
                  <div 
                    key={v.id} 
                    className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-white font-black text-xs"
                    style={{ backgroundColor: v.color }}
                    title={v.name}
                  >
                    {v.name.substring(0, 1).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
        ))}
      </div>
    </div>
  );
}
