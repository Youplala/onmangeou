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
    <div className="bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-3 md:p-6 text-black">
      <h2 className="text-xl md:text-2xl font-black mb-3 md:mb-4 text-center">👥 JOUEURS</h2>
      <div className="space-y-2">
        {users.map(user => (
          <div key={user.id} className={`flex items-center gap-3 p-2 rounded-lg border-2 border-black ${user.online ? 'bg-green-50' : 'bg-gray-100'}`}>
            <div 
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-3 border-black flex items-center justify-center text-white font-black text-sm md:text-base ${user.online ? '' : 'opacity-50 grayscale'}`}
              style={{ backgroundColor: user.color }}
            >
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className={`font-bold text-sm md:text-base break-all ${user.online ? 'text-black' : 'text-gray-500'}`}>
                {user.name}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full border border-black font-bold ${user.online ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                  {user.online ? '🟢 EN LIGNE' : '⚪ ABSENT'}
                </span>
                <span className="text-xs text-gray-600">
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
