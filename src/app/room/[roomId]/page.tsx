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
import type { Restaurant } from '@/types/restaurant';

// --- TYPES ---

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
  const [roomStartTime, setRoomStartTime] = useState<Date | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [hasLoadedRestaurants, setHasLoadedRestaurants] = useState(false);

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

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    socketRef.current = socket;

    if (storedName) {
      socket.emit('join-room', { roomId: params.roomId, userName: storedName });
    }

    socket.on('room-state', ({ users, chatHistory, leaderboard, roomStartTime: serverRoomStartTime, restaurantSet }) => {
      setUsers(users);
      setMessages(chatHistory);
      setLeaderboard(leaderboard);
      
      if (serverRoomStartTime) {
        setRoomStartTime(new Date(serverRoomStartTime));
      } else {
        const now = new Date();
        setRoomStartTime(now);
        socket.emit('set-room-start-time', { roomId: params.roomId, startTime: now.toISOString() });
      }
      
      if (restaurantSet) {
        console.log('Received restaurant set from room-state:', restaurantSet.length);
        setRestaurants(restaurantSet);
        setHasLoadedRestaurants(true);
      } else if (!hasLoadedRestaurants) {
        loadRestaurantsForRoom();
      }
      
      const currentUserData = users.find((u: User) => u.name === storedName);
      if (currentUserData) {
        setCurrentUser(currentUserData);
      }
    });

    socket.on('restaurant-set-update', (restaurantSet) => {
      console.log('Received restaurant set update:', restaurantSet.length);
      setRestaurants(restaurantSet);
      setHasLoadedRestaurants(true);
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
      socket.off('restaurant-set-update');
      socket.disconnect();
    };
  }, [params.roomId]);

  // Timer effect - starts when roomStartTime is set
  useEffect(() => {
    if (!roomStartTime) return;

    const timer = setInterval(() => {
      const { display, isOver } = calculateTimeLeft();
      setTimeLeft(display);
      if (isOver) {
        setIsVotingFinished(true);
        clearInterval(timer);
      }
    }, 1000);

    // Initial calculation
    const { display, isOver } = calculateTimeLeft();
    setTimeLeft(display);
    if (isOver) {
      setIsVotingFinished(true);
    }

    return () => clearInterval(timer);
  }, [roomStartTime]);

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

  const calculateTimeLeft = () => {
    if (!roomStartTime) {
      return { display: "Initialisation...", isOver: false, progress: 0 };
    }

    const now = new Date();
    const endTime = new Date(roomStartTime.getTime() + 10 * 60 * 1000); // 10 minutes from start
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) {
      return { display: "Le vote est terminé !", isOver: true, progress: 100 };
    }

    const totalDuration = 10 * 60 * 1000; // 10 minutes in ms
    const elapsed = now.getTime() - roomStartTime.getTime();
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (minutes > 0) return { display: `Tirage au sort dans ${minutes}m ${seconds}s`, isOver: false, progress };
    if (seconds > 0) return { display: `Tirage au sort dans ${seconds}s`, isOver: false, progress };
    return { display: "Tirage au sort imminent !", isOver: false, progress };
  };

  const loadRestaurantsForRoom = async () => {
    if (hasLoadedRestaurants || !socketRef.current) return;
    
    setHasLoadedRestaurants(true);
    try {
      const urlParams = new URLSearchParams({
        action: 'random',
        count: '10',
        minRating: '4',
        isOpen: 'true'
      });

      const response = await fetch(`/api/restaurants?${urlParams}`);
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      
      const data = await response.json();
      console.log('Loading restaurants for room:', data.length);
      
      // Share this restaurant set with all users in the room
      socketRef.current.emit('set-restaurant-set', { roomId: params.roomId, restaurantSet: data });
    } catch (error) {
      console.error('Error loading restaurants for room:', error);
      setHasLoadedRestaurants(false);
    }
  };



  const handleVote = (restaurantName: string, vote: 'OUI' | 'NON') => {
    if (!userName || !socketRef.current) return;
    
    // Prevent voting if user has opted out
    if (hasOptedOut || (currentUser && currentUser.hasOptedOut)) {
      console.log('Cannot vote - user has opted out');
      return;
    }
    
    // Prevent voting after timer expires
    if (roomStartTime) {
      const now = new Date();
      const endTime = new Date(roomStartTime.getTime() + 10 * 60 * 1000);
      if (now >= endTime) {
        console.log('Voting is closed - timer has expired');
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
    <div className="min-h-screen bg-gradient-to-br from-orange-300 via-rose-300 to-pink-400 font-sans relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-300/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
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
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl ring-1 ring-white/20 shadow-2xl p-6 border border-white/30">
            <Leaderboard leaderboard={leaderboard} isHidden={!isVotingFinished} />
          </div>
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl ring-1 ring-white/20 shadow-2xl p-6 border border-white/30">
            <PlayersList users={users} mockRestaurantsLength={10} />
          </div>
        </div>

        {/* Center Panel: Swipe Cards */}
        <div className="lg:w-1/3 order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl ring-1 ring-white/20 shadow-2xl p-6 md:p-8 border border-white/30">
            <div className="absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(600px_circle_at_0%_0%,#ffffff60,transparent_40%),radial-gradient(800px_circle_at_100%_0%,#ffffff60,transparent_45%)]" />
            <div className="flex flex-col items-center">
              <Timer timeLeft={timeLeft} progress={calculateTimeLeft().progress} />
              <AnimatePresence>
              {!isVotingFinished ? (
                !hasOptedOut && (!currentUser || !currentUser.hasOptedOut) ? (
                  <RestaurantSelector
                    restaurants={restaurants}
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
                      <div className="mt-4 text-sm text-black/60">On remet ça demain ?</div>
                    </motion.div>
                  );
                })()
              )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="lg:w-1/3 order-3 lg:order-3">
          <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl ring-1 ring-white/20 shadow-2xl p-6 md:p-8 border border-white/30">
            <div className="absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(600px_circle_at_0%_0%,#ffffff60,transparent_40%),radial-gradient(800px_circle_at_100%_0%,#ffffff60,transparent_45%)]" />
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


