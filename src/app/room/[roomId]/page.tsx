"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

// Components
import RoomHeader from '@/components/room/RoomHeader';
import Timer from '@/components/room/Timer';
import RestaurantCard from '@/components/room/RestaurantCard';
import RestaurantDeck from '@/components/room/RestaurantDeck';
import RestaurantSelector from '@/components/room/RestaurantSelector';
import WinnerCard from '@/components/room/WinnerCard';
import VotingButtons from '@/components/room/VotingButtons';
import Leaderboard from '@/components/room/Leaderboard';
import PlayersList from '@/components/room/PlayersList';
import Chat from '@/components/room/Chat';

// --- TYPES ---
interface Restaurant {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  categories: string[];
  mainCategory: string;
  address: string;
  phone: string;
  website: string;
  featuredImage: string;
  workdayTiming: string;
  closedOn: string;
  isTemporarilyClosed: boolean;
  reviewKeywords: string[];
  googleMapsLink: string;
  competitors: Array<{
    name: string;
    link: string;
    reviews: string;
  }>;
  isSpendingOnAds: boolean;
}

interface User {
  id: string;
  name: string;
  color: string;
  restaurantIndex: number;
  online: boolean;
  hasOptedOut?: boolean;
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

// Restaurant data is now loaded dynamically from the server

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
        // Sync the local hasOptedOut state with the server state
        if (currentUserData.hasOptedOut !== undefined) {
          setHasOptedOut(currentUserData.hasOptedOut);
        }
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



  const handleVote = (restaurantName: string, vote: 'OUI' | 'NON') => {
    if (!userName || !socketRef.current) return;
    
    // Prevent voting if user has opted out
    if (hasOptedOut || (currentUser && currentUser.hasOptedOut)) {
      console.log('Cannot vote - user has opted out');
      return;
    }
    
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
        setHasOptedOut={(value) => {
          setHasOptedOut(value);
          if (value && socketRef.current && userName) {
            socketRef.current.emit('user-opt-out', { roomId: params.roomId, userName });
          }
          // Also update the current user's hasOptedOut status immediately
          if (currentUser) {
            setCurrentUser({ ...currentUser, hasOptedOut: value });
          }
        }}
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
            <PlayersList users={users} mockRestaurantsLength={10} />
          </div>
        </div>

        {/* Center Panel: Swipe Cards */}
        <div className="lg:w-1/3 order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl ring-1 ring-black/10 shadow-2xl p-4 md:p-6">
            <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(600px_circle_at_0%_0%,#ffffff40,transparent_40%),radial-gradient(800px_circle_at_100%_0%,#ffffff40,transparent_45%)]" />
            <div className="flex flex-col items-center">
              <Timer timeLeft={timeLeft} />
              <AnimatePresence>
              {!isVotingFinished ? (
                !hasOptedOut && (!currentUser || !currentUser.hasOptedOut) ? (
                  <RestaurantSelector
                    socket={socketRef.current}
                    userName={userName || ''}
                    roomId={params.roomId as string}
                    currentUserIndex={currentUser?.restaurantIndex || 0}
                    onVote={handleVote}
                  />
                ) : (
                  <div className="text-center bg-rose-100/80 backdrop-blur rounded-xl ring-1 ring-rose-200 p-8 shadow-sm">
                    <div className="text-6xl mb-4">🚫</div>
                    <div className="text-rose-800 font-semibold">Vous ne participez plus au vote</div>
                    <div className="text-rose-600 text-sm mt-2">Attendez que les autres terminent</div>
                  </div>
                )
              ) : (
                (() => {
                  const sortedLeaderboard = Object.entries(leaderboard).sort(([, a], [, b]) => b.votes - a.votes);
                  const winnerEntry = sortedLeaderboard.length > 0 ? sortedLeaderboard[0] : null;

                  if (winnerEntry) {
                    const [winnerName, meta] = winnerEntry as [string, { votes: number }];
                    return <WinnerCard name={winnerName} votes={meta.votes} />;
                  }

                  return (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      className="text-center bg-white/80 backdrop-blur rounded-3xl ring-1 ring-black/10 p-8 shadow-2xl"
                    >
                      <div className="text-6xl mb-2">🕛</div>
                      <div className="text-2xl md:text-3xl font-extrabold text-black">C'est midi !</div>
                      <div className="mt-1 text-black/70 font-medium">Pas de gagnant aujourd'hui</div>
                      <div className="mt-4 text-sm text-black/60">On remet ça demain ? Invite la team 👇</div>
                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={handleInviteCopy}
                          className={`rounded-xl px-4 py-3 text-sm font-bold shadow cursor-pointer bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 ${isInviteCopied ? 'ring-2 ring-emerald-300' : ''}`}
                        >
                          {isInviteCopied ? '✅ Lien copié' : '📋 Copier le lien pour demain'}
                        </button>
                        <button
                          onClick={() => setShowChat(true)}
                          className="rounded-xl px-4 py-3 text-sm font-bold shadow cursor-pointer bg-black/80 text-white hover:bg-black"
                        >
                          💬 Ouvrir le chat
                        </button>
                      </div>
                    </motion.div>
                  );
                })()
              )}
              </AnimatePresence>
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


