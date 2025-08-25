"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

// --- TYPES ---
interface Restaurant {
  id: string;
  name: string;
  emoji: string;
  foodType: string;
  price: string;
  walkTime: string;
  description: string;
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
  { id: '1', name: 'Pizza del Arte', emoji: '🍕', foodType: 'Italian', price: '€€', walkTime: '10 min', description: 'Classic pizzas and pasta.' },
  { id: '2', name: 'Sushi Shop', emoji: '🍣', foodType: 'Japanese', price: '€€€', walkTime: '15 min', description: 'Fresh sushi and sashimi.' },
  { id: '3', name: 'Le Bagel qui Tue', emoji: '🥯', foodType: 'American', price: '€', walkTime: '5 min', description: 'Gourmet bagels and coffee.' },
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
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileChatContainerRef = useRef<HTMLDivElement | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);

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
        noon.setDate(noon.getDate() + 1);
      }

      let diff = noon.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000); diff -= h * 3600000;
      const m = Math.floor(diff / 60000); diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      if (h > 0) return `Tirage au sort dans ${h}h ${m}m`;
      if (m > 0) return `Tirage au sort dans ${m}m ${s}s`;
      if (s > 0) return `Tirage au sort dans ${s}s`;
      return "Tirage au sort imminent !";
    };

    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);

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

  // --- HANDLERS ---
  const handleInviteCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsInviteCopied(true);
    setTimeout(() => setIsInviteCopied(false), 2000);
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

  const renderMessage = (msg: ChatMessage) => {
    const user = users.find(u => u.name === msg.user);
    const color = user ? user.color : '#333';
    return (
      <div key={msg.id}>
        {msg.type === 'vote' ? (
          <p className="text-gray-500 italic"><strong style={{ color }}>{msg.user}</strong> {msg.text}</p>
        ) : (
          <>
            <div><strong style={{ color }}>{msg.user}</strong> <span className="font-normal text-gray-500 text-sm">{msg.time}</span></div>
            <p className="bg-white border-2 border-black px-3 py-2 break-words">{msg.text}</p>
          </>
        )}
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 font-sans">
      {/* Header */}
      <div className="bg-yellow-300 border-b-8 border-black p-4 text-black sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto gap-4">
          <h1 className="text-4xl md:text-5xl font-black text-center lg:text-left">🍽️ ON MANGE OÙ ?</h1>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="bg-white border-4 border-black px-6 py-3 font-black text-2xl text-center min-w-[300px]">
              {timeLeft ? timeLeft : "Chargement..."}
            </div>
            <button
              onClick={handleInviteCopy}
              className={`bg-blue-500 text-white border-4 border-black font-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all ${isInviteCopied ? 'bg-green-400' : ''}`}>
              {isInviteCopied ? '✅ LIEN COPIÉ' : '➕ INVITER'}
            </button>
            <button
              onClick={() => setHasOptedOut(true)}
              className={`bg-white border-4 border-black font-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all ${hasOptedOut ? 'bg-red-500 text-white' : ''}`}>
              {hasOptedOut ? "JE VOTE PLUS !" : "J'PEUX PAS AUJ"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">

        {/* Left Panel: Leaderboard & Users */}
        <div className="lg:w-1/4 order-2 lg:order-1 flex flex-col gap-8">
          {/* Leaderboard */}
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

          {/* Connected Users */}
          <div className="bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 text-black">
            <h2 className="text-2xl font-black mb-4 text-center">👥 EN LIGNE</h2>
            <div className="grid grid-cols-4 gap-4">
              {users.filter(user => user.online).map(user => (
                <div key={user.id} className="flex flex-col items-center text-center">
                  <div 
                    className="w-16 h-16 rounded-full border-4 border-black flex items-center justify-center text-white font-black text-2xl mb-2"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-sm break-all">{user.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel: Swipe Cards */}
        <div className="lg:w-1/3 order-1 lg:order-2 flex flex-col items-center justify-center">
          <AnimatePresence>
            {currentUser && currentUser.restaurantIndex < mockRestaurants.length ? (
              <motion.div
                key={mockRestaurants[currentUser.restaurantIndex].id}
                drag="x"
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                onDragEnd={(e, { offset }) => {
                  if (offset.x > 100) handleVote('OUI');
                  else if (offset.x < -100) handleVote('NON');
                  else x.set(0);
                }}
                style={{ x, rotate }}
                className="bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full max-w-sm text-black cursor-grab active:cursor-grabbing"
              >
                <div className="text-center pointer-events-none">
                  <span className="text-6xl" role="img">{mockRestaurants[currentUser.restaurantIndex].emoji}</span>
                  <h3 className="text-3xl font-black my-4">{mockRestaurants[currentUser.restaurantIndex].name}</h3>
                  <p className="text-lg font-bold text-gray-500 mb-4">{mockRestaurants[currentUser.restaurantIndex].foodType}</p>
                  <div className="flex justify-center gap-4 mb-4">
                    <span className="bg-green-200 border-2 border-black px-3 py-1 font-bold text-sm">{mockRestaurants[currentUser.restaurantIndex].price}</span>
                    <span className="bg-yellow-200 border-2 border-black px-3 py-1 font-bold text-sm">🚶 {mockRestaurants[currentUser.restaurantIndex].walkTime}</span>
                  </div>
                  <p className="text-base font-bold text-gray-700">{mockRestaurants[currentUser.restaurantIndex].description}</p>
                </div>
              </motion.div>
            ) : (
                <div className="text-center font-black text-4xl text-white bg-black p-8 border-8 border-white">C'EST FINI !</div>
            )}
          </AnimatePresence>
          {currentUser && currentUser.restaurantIndex < mockRestaurants.length && (
            <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-sm">
              <motion.button onClick={() => handleVote('NON')} className="bg-red-400 border-4 border-black font-black text-2xl py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">💔 NON</motion.button>
              <motion.button onClick={() => handleVote('OUI')} className="bg-green-400 border-4 border-black font-black text-2xl py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">💚 OUI</motion.button>
            </div>
          )}
        </div>

        {/* Right Panel: Chat (Desktop) */}
        <div className="hidden lg:block lg:w-1/3 order-3">
          <div className="bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 text-black h-[80vh] flex flex-col">
            <h2 className="text-2xl font-black mb-4 text-center">💬 CHAT</h2>
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 pr-2 space-y-4">
              {messages.map(renderMessage)}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full border-4 border-black p-3 text-lg"
                placeholder="Message..."
              />
              <button type="submit" className="bg-green-400 border-4 border-black font-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">➜</button>
            </form>
          </div>
        </div>

        </div>
      </main>

      {/* Chat Toggle Button (Mobile) */}
      <button onClick={() => setShowChat(!showChat)} className="lg:hidden fixed bottom-6 right-6 bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        💬
      </button>

      {/* Chat Modal (Mobile) */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(event, info) => {
              if (info.offset.y > 200) {
                setShowChat(false);
              }
            }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            className="lg:hidden fixed inset-0 bg-white z-20 flex flex-col p-4 pt-8"
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-4"></div>
            <button onClick={() => setShowChat(false)} className="absolute top-4 right-4 text-3xl font-black">X</button>
            <h2 className="text-2xl font-black mb-4 text-center text-black">💬 CHAT</h2>
            <div ref={mobileChatContainerRef} className="flex-grow overflow-y-auto mb-4 space-y-4">
              {messages.map(renderMessage)}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full border-4 border-black p-3 text-lg"
                placeholder="Message..."
              />
              <button type="submit" className="bg-green-400 border-4 border-black font-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">➜</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


