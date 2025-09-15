interface User {
  id: string;
  name: string;
  color: string;
  restaurantIndex: number;
  online: boolean;
  hasOptedOut?: boolean;
}

interface PlayersListProps {
  users: User[];
  mockRestaurantsLength: number;
}

export default function PlayersList({ users, mockRestaurantsLength }: PlayersListProps) {
  return (
    <div className="text-black">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">👥 Joueurs ({users.length})</h2>
      <div className="space-y-2.5">
        {users.map((user, index) => (
          <div key={user.id} className={`flex items-center gap-3 p-3 rounded-xl bg-white/80 backdrop-blur ring-1 ring-black/10 shadow-sm hover:shadow-md transition-all ${user.online ? '' : 'opacity-70'}`}>
            <div className="relative">
              <div 
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base ring-2 ring-white shadow ${user.online ? '' : 'opacity-50 grayscale'}`}
                style={{ backgroundColor: user.color }}
              >
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              {user.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-1 ring-white"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-semibold text-sm md:text-base break-all ${user.online ? 'text-black' : 'text-gray-500'}`}>
                  {user.name}
                </span>
                {index === 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 font-medium">
                    Host
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-medium ${
                  user.online 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {user.online ? 'En ligne' : 'Absent'}
                </span>
                {user.hasOptedOut && (
                  <span className="px-2 py-0.5 rounded-full font-medium bg-rose-100 text-rose-700">
                    Pas dispo
                  </span>
                )}
                <span className="text-gray-600 ml-auto">
                  {user.restaurantIndex}/{mockRestaurantsLength}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {users.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <div className="text-3xl mb-2">👻</div>
            <p className="text-sm">Aucun joueur pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
}
