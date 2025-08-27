interface User {
  id: string;
  name: string;
  color: string;
  restaurantIndex: number;
  online: boolean;
}

interface PlayersListProps {
  users: User[];
  mockRestaurantsLength: number;
}

export default function PlayersList({ users, mockRestaurantsLength }: PlayersListProps) {
  return (
    <div className="text-black">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">👥 Joueurs</h2>
      <div className="space-y-2.5">
        {users.map(user => (
          <div key={user.id} className={`flex items-center gap-3 p-2.5 rounded-xl bg-white/70 backdrop-blur ring-1 ring-black/10 shadow-sm ${user.online ? '' : 'opacity-70'}`}>
            <div 
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base ring-2 ring-white shadow ${user.online ? '' : 'opacity-50 grayscale'}`}
              style={{ backgroundColor: user.color }}
            >
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className={`font-semibold text-sm md:text-base break-all ${user.online ? 'text-black' : 'text-gray-500'}`}>
                {user.name}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ring-1 ring-black/10 ${user.online ? 'bg-emerald-100/80 text-emerald-800' : 'bg-gray-100/80 text-gray-700'}`}>
                  {user.online ? '🟢 En ligne' : '⚪ Absent'}
                </span>
                <span className="text-[11px] text-gray-600">
                  {user.restaurantIndex}/{mockRestaurantsLength}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
