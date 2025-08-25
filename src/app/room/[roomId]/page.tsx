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
  { id: '1', name: 'Pizza del Arte', emoji: '🍕', foodType: 'Italian', price: '€€', walkTime: '10 min', description: 'Classic pizzas and pasta.', googleMapsUrl: 'https://goo.gl/maps/pizadelarte', menuUrl: '#' },
  { id: '2', name: 'Sushi Shop', emoji: '🍣', foodType: 'Japanese', price: '€€€', walkTime: '15 min', description: 'Fresh sushi and sashimi.', googleMapsUrl: 'https://goo.gl/maps/sushishop', menuUrl: '#' },
  { id: '3', name: 'Le Bagel qui Tue', emoji: '🥯', foodType: 'American', price: '€', walkTime: '5 min', description: 'Gourmet bagels and coffee.', googleMapsUrl: 'https://goo.gl/maps/bagelquitue', menuUrl: '#' },
];

// --- COMPONENT ---
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
        return { display: "Le vote est terminé !", isOver: true };
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

    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    if (storedName) {
      socket.emit('join-room', { roomId: params.roomId, userName: storedName });
    }



    socket.on('chat-history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on('update-user-list', (userList: User[]) => {
      setUsers(userList);
      const me = userList.find(u => u.name === localStorage.getItem('userName'));
      if (me) {
        setCurrentUser(me);
      }
    });
    
    socket.on('chat-message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      if (!showChatRef.current && message.type !== 'vote') {
        setUnreadCount((c) => Math.min(99, c + 1));
      }
    });

    socket.on('update-leaderboard', (newLeaderboard: Leaderboard) => {
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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 font-sans">
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
      <main className="p-4 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">

        {/* Left Panel: Leaderboard & Users */}
        <div className="lg:w-1/4 order-2 lg:order-1 flex flex-col gap-8">
          <Leaderboard leaderboard={leaderboard} />
          <PlayersList users={users} mockRestaurantsLength={mockRestaurants.length} />
        </div>

        {/* Center Panel: Swipe Cards */}
        <div className="lg:w-1/3 order-1 lg:order-2 flex flex-col items-center justify-center">
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
                const sortedLeaderboard = Object.entries(leaderboard).sort(([, a], [, b]) => b.votes - a.votes);
                const winnerEntry = sortedLeaderboard.length > 0 ? sortedLeaderboard[0] : null;
                const winnerRestaurant = winnerEntry ? mockRestaurants.find(r => r.name === winnerEntry[0]) : null;

                if (winnerRestaurant) {
                  return <WinnerCard restaurant={winnerRestaurant} />;
                }

                return <div className="text-center font-black text-4xl text-white bg-black p-8 border-8 border-white">C'EST FINI !</div>;
              })()
            )}
          </AnimatePresence>
          {!isVotingFinished && currentUser && currentUser.restaurantIndex < mockRestaurants.length && (
            <VotingButtons
              onVoteYes={() => triggerVoteWithAnimation('OUI')}
              onVoteNo={() => triggerVoteWithAnimation('NON')}
              isVotingAnimation={isVotingAnimation}
            />
          )}
        </div>

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
      </main>
    </div>
  );
};


