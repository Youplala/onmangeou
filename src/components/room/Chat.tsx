import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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

interface ChatProps {
  // Desktop chat props
  messages: ChatMessage[];
  users: User[];
  newMessage: string;
  setNewMessage: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  
  // Mobile chat props
  showChat: boolean;
  setShowChat: (value: boolean) => void;
  unreadCount: number;
}

export default function Chat({
  messages,
  users,
  newMessage,
  setNewMessage,
  onSendMessage,
  showChat,
  setShowChat,
  unreadCount,
}: ChatProps) {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileChatContainerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
      if (ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      scrollToBottom(chatContainerRef);
      scrollToBottom(mobileChatContainerRef);
    }, 0);
  }, [messages]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderMessage = (msg: ChatMessage) => {
    const user = users.find(u => u.name === msg.user);
    const color = user ? user.color : '#333';
    return (
      <div>
        {msg.type === 'vote' ? (
          <p className="text-gray-700/80 italic"><strong style={{ color }}>{msg.user}</strong> {msg.text}</p>
        ) : (
          <>
            <div className="mb-1"><strong style={{ color }}>{msg.user}</strong> <span className="font-normal text-gray-600 text-xs align-middle">{msg.time}</span></div>
            <p className="bg-white/70 backdrop-blur rounded-xl ring-1 ring-black/10 px-3 py-2 break-words text-black shadow-sm">
              {msg.text}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Chat (outer container provides glass on room page) */}
      <div className="hidden lg:block lg:w-full">
        <div className="text-black h-[70vh] flex flex-col">
          <h2 className="text-xl font-bold mb-3 text-center">💬 Chat</h2>
          <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-3 pr-2 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                {renderMessage(msg)}
              </div>
            ))}
          </div>
          <form onSubmit={onSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full rounded-xl bg-white/70 backdrop-blur ring-1 ring-black/10 px-3 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              placeholder="Écris ton message..."
            />
            <button type="submit" className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold px-5 py-3 shadow hover:opacity-95 transition">
              ➜
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Chat Toggle Button (portal to escape clipping) */}
      {mounted && !showChat && createPortal(
        <button
          onClick={() => setShowChat(!showChat)}
          className="lg:hidden fixed bottom-5 right-5 z-50 rounded-full bg-white/70 backdrop-blur ring-1 ring-black/10 shadow-xl w-14 h-14 flex items-center justify-center text-2xl cursor-pointer"
          aria-label="Ouvrir le chat"
        >
          💬
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold ring-2 ring-white shadow">
              {unreadCount}
            </span>
          )}
        </button>,
        document.body
      )}

      {/* Mobile Chat Modal (portal) */}
      {mounted && createPortal(
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
              className="lg:hidden fixed inset-0 bg-gradient-to-br from-orange-300 via-rose-300 to-pink-400 z-40 flex flex-col"
            >
              {/* Chat Container with glass styling */}
              <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl ring-1 ring-black/10 shadow-2xl m-4 mt-8 flex-1 flex flex-col">
                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-black/10 bg-white/50 backdrop-blur">
                  <div className="w-8"></div>
                  <h2 className="text-xl font-semibold text-black">💬 Chat</h2>
                  <button 
                    onClick={() => setShowChat(false)} 
                    className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white w-8 h-8 flex items-center justify-center shadow hover:opacity-95 transition"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Drag Handle */}
                <div className="w-12 h-1.5 bg-gray-400/70 rounded-full self-center mt-2 mb-2"></div>
                
                {/* Messages */}
                <div ref={mobileChatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id}>
                      {renderMessage(msg)}
                    </div>
                  ))}
                </div>
                
                {/* Input */}
                <div className="p-4 border-t border-black/10 bg-white/40 backdrop-blur">
                  <form onSubmit={onSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 rounded-xl bg-white/70 backdrop-blur ring-1 ring-black/10 px-3 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                      placeholder="Écris ton message..."
                    />
                    <button 
                      type="submit" 
                      className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold px-4 py-3 shadow hover:opacity-95 transition"
                    >
                      ➜
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
