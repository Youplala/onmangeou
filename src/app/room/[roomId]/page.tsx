"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

// Components
import RoomHeader from '@/components/room/RoomHeader';
import Timer from '@/components/room/Timer';
import RestaurantCard from '@/components/room/RestaurantCard';
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
  { id: '1', name: 'Pizza Hut', emoji: '🍕', foodType: '🇮🇹', price: '10-15€', walkTime: '5 min', description: 'Pizzas classiques.', googleMapsUrl: 'https://maps.app.goo.gl/HwkNRHfH5taK8E668', menuUrl: 'https://www.pizzahut.fr/huts/fr-1/96-paris-16eme-nord/&utm_source=google&utm_medium=maps&utm_campaign=menu_url?y_source=1_MTEzMzUwMDktNzE1LWxvY2F0aW9uLm1lbnVfdXJs' },
  { id: '2', name: 'Compose', emoji: '🥗', foodType: '🇫🇷', price: '10-15€', walkTime: '5 min', description: 'Salades sur mesure.', googleMapsUrl: 'https://maps.app.goo.gl/BnCfeAjHxqapsaXZ7', menuUrl: 'https://composeparis.fr/?menu-section' },
  { id: '3', name: 'Biothentique', emoji: '🍜', foodType: '🇻🇳', price: '10-15€', walkTime: '5 min', description: 'Bobuns, banh mi et plats bio.', googleMapsUrl: 'https://maps.app.goo.gl/LkrWYFesTr5RhTnX6', menuUrl: 'https://biothentique-vietnam.bykomdab.com/?order=true' },
  { id: '4', name: "Birdy", emoji: '🍔', foodType: '🇺🇸', price: '15-20€', walkTime: '5 min', description: 'Burgers et plates américains.', googleMapsUrl: 'https://maps.app.goo.gl/HHhqd7EshQrTmBi48', menuUrl: 'https://maps.app.goo.gl/HHhqd7EshQrTmBi48' },
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

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const overlayGreen = useTransform(x, [0, 60, 200], [0, 0.15, 0.35]);
  const overlayRed = useTransform(x, [-200, -60, 0], [0.35, 0.15, 0]);
  const crossOpacity = useTransform(x, [-200, -60, 0], [1, 0.6, 0]);
  const checkOpacity = useTransform(x, [0, 60, 200], [0, 0.6, 1]);

  // --- EFFECTS ---
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
    else window.location.href = `/join/${params.roomId}`;

    const calculateTimeLeft = () => {
      const now = new Date();
      let noon = new Date(now);
      noon.setHours(12, 0, 0, 0);

      if (now > noon) {
        return { display: "Le vote est terminé ! Revenez demain !", isOver: true };
      }

      let diff = noon.getTime() - now.getTime();
      if (diff <= 0) {
        return { display: "Le vote est terminé !", isOver: true };
      }
      const h = Math.floor(diff / 3600000); diff -= h * 3600000;
      const m = Math.floor(diff / 60000); diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      if (h > 0) return { display: `Tirage au sort dans ${h}h ${m}m`, isOver: false };
      if (m > 0) return { display: `Tirage au sort dans ${m}m ${s}s`, isOver: false };
      if (s > 0) return { display: `Tirage au sort dans ${s}s`, isOver: false };
      return { display: "Tirage au sort imminent !", isOver: false };
    };

    const timer = setInterval(() => {
      const { display, isOver } = calculateTimeLeft();
      setTimeLeft(display);
      // Only auto-finish the vote in production. In dev, use the button.
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



    // Handle initial room state
    socket.on('room-state', ({ users, chatHistory, leaderboard }) => {
      setUsers(users);
      setMessages(chatHistory);
      setLeaderboard(leaderboard);
      const me = users.find((u: User) => u.name === localStorage.getItem('userName'));
      if (me) {
        setCurrentUser(me);
      }
    });

    // Handle user updates
    socket.on('user-joined', (userList: User[]) => {
      setUsers(userList);
      const me = userList.find(u => u.name === localStorage.getItem('userName'));
      if (me) {
        setCurrentUser(me);
      }
    });

    socket.on('user-update', (userList: User[]) => {
      setUsers(userList);
      const me = userList.find(u => u.name === localStorage.getItem('userName'));
      if (me) {
        setCurrentUser(me);
      }
    });
    
    socket.on('new-message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
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

  const triggerVoteWithAnimation = (vote: 'OUI' | 'NON') => {
    if (isVotingAnimation) return;
    setIsVotingAnimation(true);
    setPlaySwipeHint(false);
    const to = vote === 'OUI' ? 350 : -350;
    animate(x, to, {
      duration: 0.28,
      ease: 'easeInOut',
      onComplete: () => {
        handleVote(vote);
        setIsVotingAnimation(false);
      },
    });
  };

  const handleVote = (vote: 'OUI' | 'NON') => {
    if (!userName || !socketRef.current || !currentUser || currentUser.restaurantIndex >= mockRestaurants.length) return;
    const restaurantName = mockRestaurants[currentUser.restaurantIndex].name;
    socketRef.current.emit('vote', { roomId: params.roomId, userName, restaurantName, vote });
    x.set(0);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && userName && socketRef.current) {
      const message: Omit<ChatMessage, 'id' | 'time'> = {
        user: userName,
        text: newMessage.trim(),
        type: 'chat',
      };
      socketRef.current.emit('chat-message', { roomId: params.roomId, message });
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
                <RestaurantCard
                  restaurant={mockRestaurants[currentUser.restaurantIndex]}
                  isVotingAnimation={isVotingAnimation}
                  playSwipeHint={playSwipeHint}
                  onDragEnd={(e, { offset }) => {
                    if (offset.x > 100) triggerVoteWithAnimation('OUI');
                    else if (offset.x < -100) triggerVoteWithAnimation('NON');
                    else x.set(0);
                  }}
                  x={x}
                  rotate={rotate}
                  overlayGreen={overlayGreen}
                  overlayRed={overlayRed}
                  crossOpacity={crossOpacity}
                  checkOpacity={checkOpacity}
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
                      C'EST FINI !
                    </div>
                  );
                })()
              )}
              </AnimatePresence>
              {!isVotingFinished && currentUser && currentUser.restaurantIndex < mockRestaurants.length && (
                <div className="mt-4 w-full flex justify-center">
                  <VotingButtons
                    onVoteYes={() => triggerVoteWithAnimation('OUI')}
                    onVoteNo={() => triggerVoteWithAnimation('NON')}
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


