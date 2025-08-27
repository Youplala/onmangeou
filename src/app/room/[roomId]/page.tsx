"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

// Components
import RoomHeader from '@/components/room/RoomHeader';
import Timer from '@/components/room/Timer';
import RestaurantCard from '@/components/room/RestaurantCard';
import RestaurantDeck from '@/components/room/RestaurantDeck';
import WinnerCard from '@/components/room/WinnerCard';
import VotingButtons from '@/components/room/VotingButtons';
import Leaderboard from '@/components/room/Leaderboard';
import PlayersList from '@/components/room/PlayersList';
import Chat from '@/components/room/Chat';

// --- TYPES ---
interface Restaurant {
  id: string;
  name: string;
  emoji: string;
  foodType: string;
  price: string;
  walkTime: string;
  description: string;
  googleMapsUrl: string;
  menuUrl: string;
}

interface User {
  id: string;
  name: string;
  color: string;
  restaurantIndex: number;
  online: boolean;
}

interface ChatMessage {
  id: number;
  user: string;
  text: string;
  time: string;
  type?: 'vote' | 'chat';
}

interface LeaderboardEntry {
  votes: number;
  voters: User[];
}

interface Leaderboard {
  [restaurantName: string]: LeaderboardEntry;
}

interface RoomState {
  users: User[];
  currentRestaurantIndex: number;
}

// --- MOCK DATA ---
const mockRestaurants: Restaurant[] = [
  { id: '1', name: 'Pizza Hut', emoji: '🍕', foodType: '🇮🇹', price: '10-15€', walkTime: '5 min', description: 'Chaîne connue pour ses pizzas, ailes de poulet, pâtes, accompagnements et desserts, à manger sur place, à emporter ou en livraison.', googleMapsUrl: 'https://maps.app.goo.gl/HwkNRHfH5taK8E668', menuUrl: 'https://www.pizzahut.fr/huts/fr-1/96-paris-16eme-nord/&utm_source=google&utm_medium=maps&utm_campaign=menu_url?y_source=1_MTEzMzUwMDktNzE1LWxvY2F0aW9uLm1lbnVfdXJs' },
  { id: '2', name: 'Compose', emoji: '🥗', foodType: '🇫🇷', price: '10-15€', walkTime: '5 min', description: 'Salades sur mesure.', googleMapsUrl: 'https://maps.app.goo.gl/BnCfeAjHxqapsaXZ7', menuUrl: 'https://composeparis.fr/?menu-section' },
  { id: '3', name: 'Biothentique', emoji: '🍜', foodType: '🇻🇳', price: '10-15€', walkTime: '5 min', description: 'Bobuns, banh mi et plats bio.', googleMapsUrl: 'https://maps.app.goo.gl/LkrWYFesTr5RhTnX6', menuUrl: 'https://biothentique-vietnam.bykomdab.com/?order=true' },
  { id: '4', name: "Birdy", emoji: '🍔', foodType: '🇺🇸', price: '15-20€', walkTime: '5 min', description: 'Burgers et plats américains.', googleMapsUrl: 'https://maps.app.goo.gl/HHhqd7EshQrTmBi48', menuUrl: 'https://maps.app.goo.gl/HHhqd7EshQrTmBi48' },
  { id: '5', name: "Maison Lauriston", emoji: '🍝', foodType: '🇮🇹', price: '15-20€', walkTime: '5 min', description: 'Spaghetti et plats français.', googleMapsUrl: 'https://maps.app.goo.gl/42i3Efh2efZfm5xo7', menuUrl: 'https://maison-lauriston-restaurant-paris.eatbu.com/?lang=fr' },
  { id: '6', name: "Dang", emoji: '🍜', foodType: '🇻🇳', price: '10-15€', walkTime: '5 min', description: 'Traiteur vietnamien.', googleMapsUrl: 'https://maps.app.goo.gl/rZB44fwP8Tzj1srC7', menuUrl: 'https://maps.app.goo.gl/rZB44fwP8Tzj1srC7' },
  { id: '7', name: "Au P'tit Viet", emoji: '🍜', foodType: '🇻🇳', price: '10-15€', walkTime: '5 min', description: 'Restaurant vietnamien.', googleMapsUrl: 'https://maps.app.goo.gl/H4TKDoEuSFaaBDRX6', menuUrl: 'https://maps.app.goo.gl/H4TKDoEuSFaaBDRX6' },
  { id: '8', name: "Paris Follie's", emoji: '🍝', foodType: '🇫🇷', price: '10-15€', walkTime: '5 min', description: 'Brasserie simple avec tables côté rue proposant grillades, burgers, salades et plats français classiques.', googleMapsUrl: 'https://maps.app.goo.gl/H4TKDoEuSFaaBDRX6', menuUrl: 'https://maps.app.goo.gl/H4TKDoEuSFaaBDRX6' },
];

// --- COMPONENT
export default function RoomPage() {
  const params = useParams();
  const [userName, setUserName] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [leaderboard, setLeaderboard] = useState<Leaderboard>({});
  const [hasOptedOut, setHasOptedOut] = useState(false);
  const [isInviteCopied, setIsInviteCopied] = useState(false);
  const [isVotingFinished, setIsVotingFinished] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileChatContainerRef = useRef<HTMLDivElement | null>(null);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);
  const [playSwipeHint, setPlaySwipeHint] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const showChatRef = useRef(false);
  const [isVotingAnimation, setIsVotingAnimation] = useState(false);

  // Sound notification function
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant notification sound (two quick beeps)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.08);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.11);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.18);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };



  // --- EFFECTS ---
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
    else window.location.href = `/join/${params.roomId}`;

    const calculateTimeLeft = () => {
      // Get current time in Paris timezone
      const now = new Date();
      const parisTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
      
      // Create noon time in Paris timezone
      const noon = new Date(parisTime);
      noon.setHours(12, 0, 0, 0);

      const diff = noon.getTime() - parisTime.getTime();
      
      if (diff <= 0) {
        return { display: "Le vote est terminé !", isOver: true };
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) return { display: `Tirage au sort dans ${hours}h ${minutes}m`, isOver: false };
      if (minutes > 0) return { display: `Tirage au sort dans ${minutes}m ${seconds}s`, isOver: false };
      if (seconds > 0) return { display: `Tirage au sort dans ${seconds}s`, isOver: false };
      return { display: "Tirage au sort imminent !", isOver: false };
    };

    const timer = setInterval(() => {
      const { display, isOver } = calculateTimeLeft();
      setTimeLeft(display);
      // Auto-finish the vote when time is up in production
      if (isOver && process.env.NODE_ENV === 'production') {
        setIsVotingFinished(true);
        clearInterval(timer);
      }
    }, 1000);

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    socketRef.current = socket;

    if (storedName) {
      socket.emit('join-room', { roomId: params.roomId, userName: storedName });
    }

    socket.on('room-state', ({ users, chatHistory, leaderboard }) => {
      setUsers(users);
      setMessages(chatHistory);
      setLeaderboard(leaderboard);
      const currentUserData = users.find((u: User) => u.name === storedName);
      if (currentUserData) {
        setCurrentUser(currentUserData);
      }
    });

    socket.on('user-joined', (userList: User[]) => {
      setUsers(userList);
      const currentUserData = userList.find((u: User) => u.name === storedName);
      if (currentUserData) {
        setCurrentUser(currentUserData);
      }
    });

    socket.on('user-update', (userList: User[]) => {
      setUsers(userList);
      const currentUserData = userList.find((u: User) => u.name === storedName);
      if (currentUserData) {
        setCurrentUser(currentUserData);
      }
    });

    socket.on('new-message', (message: ChatMessage) => {
      setMessages(prev => {
        const updated = [...prev, message];
        if (updated.length > 100) {
          return updated.slice(-50);
        }
        return updated;
      });
      if (!showChatRef.current && message.type !== 'vote') {
        setUnreadCount((c) => Math.min(99, c + 1));
      }
      
      // Play notification sound for new chat messages (not vote messages)
      if (message.type !== 'vote' && message.user !== storedName) {
        playNotificationSound();
      }
    });

    socket.on('leaderboard-update', (newLeaderboard: Leaderboard) => {
      setLeaderboard(newLeaderboard);
    });

    return () => {
      clearInterval(timer);
      socket.disconnect();
    };
  }, [params.roomId]);

  useEffect(() => {
    const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
      if (ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }
    scrollToBottom(chatContainerRef);
    scrollToBottom(mobileChatContainerRef);
  }, [messages]);

  useEffect(() => {
    showChatRef.current = showChat;
    if (showChat) setUnreadCount(0);
  }, [showChat]);

  useEffect(() => {
    const t = setTimeout(() => setPlaySwipeHint(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // --- HANDLERS ---
  const handleInviteCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsInviteCopied(true);
    setTimeout(() => setIsInviteCopied(false), 2000);
  };



  const handleVote = (vote: 'OUI' | 'NON') => {
    if (!userName || !socketRef.current || !currentUser || currentUser.restaurantIndex >= mockRestaurants.length) return;
    
    // Prevent voting after noon in production
    if (process.env.NODE_ENV === 'production') {
      const now = new Date();
      const noon = new Date(now);
      noon.setHours(12, 0, 0, 0);
      if (now >= noon) {
        console.log('Voting is closed - deadline has passed');
        return;
      }
    }
    
    setPlaySwipeHint(false);
    const restaurantName = mockRestaurants[currentUser.restaurantIndex].name;
    socketRef.current.emit('vote', { roomId: params.roomId, userName, restaurantName, vote });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && userName && socketRef.current) {
      const message: Omit<ChatMessage, 'id' | 'time'> = {
        user: userName,
        text: newMessage.trim(),
        type: 'chat',
      };
      socketRef.current.emit('send-message', { roomId: params.roomId, userName, message: newMessage.trim() });
      setNewMessage('');
    }
  };



  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-300 via-rose-300 to-pink-400 font-sans">
      <RoomHeader
        isHeaderCollapsed={isHeaderCollapsed}
        setIsHeaderCollapsed={setIsHeaderCollapsed}
        isInviteCopied={isInviteCopied}
        handleInviteCopy={handleInviteCopy}
        hasOptedOut={hasOptedOut}
        setHasOptedOut={setHasOptedOut}
        setIsVotingFinished={setIsVotingFinished}
      />

      {/* Main Content */}
      <main className="p-6 md:p-10">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">

        {/* Left Panel: Leaderboard & Users */}
        <div className="lg:w-1/4 order-2 lg:order-1 flex flex-col gap-6">
          <div className="rounded-2xl bg-white/60 backdrop-blur ring-1 ring-black/10 shadow-xl p-4">
            <Leaderboard leaderboard={leaderboard} isHidden={!isVotingFinished} />
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur ring-1 ring-black/10 shadow-xl p-4">
            <PlayersList users={users} mockRestaurantsLength={mockRestaurants.length} />
          </div>
        </div>

        {/* Center Panel: Swipe Cards */}
        <div className="lg:w-1/3 order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl ring-1 ring-black/10 shadow-2xl p-4 md:p-6">
            <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(600px_circle_at_0%_0%,#ffffff40,transparent_40%),radial-gradient(800px_circle_at_100%_0%,#ffffff40,transparent_45%)]" />
            <div className="flex flex-col items-center">
              <Timer timeLeft={timeLeft} />
              <AnimatePresence>
              {!isVotingFinished && currentUser && currentUser.restaurantIndex < mockRestaurants.length ? (
                <RestaurantDeck
                  restaurants={mockRestaurants}
                  currentIndex={currentUser.restaurantIndex}
                  onVote={handleVote}
                  isVotingAnimation={isVotingAnimation}
                  playSwipeHint={playSwipeHint}
                />
              ) : (
                (() => {
                  // If the vote is not finished yet (e.g., user has swiped all cards but countdown not over),
                  // do NOT reveal the winner. Show a waiting message instead.
                  if (!isVotingFinished) {
                    return (
                      <div className="text-center bg-white/70 backdrop-blur rounded-2xl ring-1 ring-black/10 p-8 shadow-xl">
                        <div className="text-2xl md:text-3xl font-extrabold text-black mb-1">En attente des autres votes…</div>
                        <div className="text-black/70 font-semibold">Le gagnant sera révélé à la fin du compte à rebours.</div>
                      </div>
                    );
                  }

                  const sortedLeaderboard = Object.entries(leaderboard).sort(([, a], [, b]) => b.votes - a.votes);
                  const winnerEntry = sortedLeaderboard.length > 0 ? sortedLeaderboard[0] : null;
                  const winnerRestaurant = winnerEntry ? mockRestaurants.find(r => r.name === winnerEntry[0]) : null;

                  if (winnerRestaurant) {
                    return <WinnerCard restaurant={winnerRestaurant} />;
                  }

                  return (
                    <div className="text-center font-extrabold text-3xl md:text-4xl text-black bg-white/70 backdrop-blur rounded-2xl ring-1 ring-black/10 p-8 shadow-xl">
                      Reviens demain !
                    </div>
                  );
                })()
              )}
              </AnimatePresence>
              {!isVotingFinished && currentUser && currentUser.restaurantIndex < mockRestaurants.length && (
                <div className="mt-4 w-full flex justify-center relative z-20">
                  <VotingButtons
                    onVoteYes={() => handleVote('OUI')}
                    onVoteNo={() => handleVote('NON')}
                    isVotingAnimation={isVotingAnimation}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:w-1/3 order-3 lg:order-3">
          <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl ring-1 ring-black/10 shadow-2xl p-4 md:p-6">
            <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(600px_circle_at_0%_0%,#ffffff40,transparent_40%),radial-gradient(800px_circle_at_100%_0%,#ffffff40,transparent_45%)]" />
            <Chat
              messages={messages}
              users={users}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={handleSendMessage}
              showChat={showChat}
              setShowChat={(value) => {
                setShowChat(value);
                if (value) setUnreadCount(0);
              }}
              unreadCount={unreadCount}
            />
          </div>
        </div>

        </div>
      </main>
    </div>
  );
};


