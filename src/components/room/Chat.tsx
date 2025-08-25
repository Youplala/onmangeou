import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';

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

  useEffect(() => {
    const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
      if (ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }
    scrollToBottom(chatContainerRef);
    scrollToBottom(mobileChatContainerRef);
  }, [messages]);

  const renderMessage = (msg: ChatMessage) => {
    const user = users.find(u => u.name === msg.user);
    const color = user ? user.color : '#333';
    return (
      <div key={msg.id}>
        {msg.type === 'vote' ? (
          <p className="text-gray-600 italic"><strong style={{ color }}>{msg.user}</strong> {msg.text}</p>
        ) : (
          <>
            <div><strong style={{ color }}>{msg.user}</strong> <span className="font-normal text-gray-600 text-sm">{msg.time}</span></div>
            <p className="bg-white border-2 border-black px-3 py-2 break-words text-black">{msg.text}</p>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Chat */}
      <div className="hidden lg:block lg:w-1/3 order-3">
        <div className="bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 text-black h-[80vh] flex flex-col">
          <h2 className="text-2xl font-black mb-4 text-center">💬 CHAT</h2>
          <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 pr-2 space-y-4">
            {messages.map((msg) => renderMessage(msg))}
          </div>
          <form onSubmit={onSendMessage} className="flex gap-2">
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

      {/* Mobile Chat Toggle Button */}
      <div className="lg:hidden fixed inset-0 pointer-events-none z-40">
        <button
          onClick={() => setShowChat(!showChat)}
          className="absolute bottom-4 right-4 bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] pointer-events-auto"
          aria-label="Open chat"
        >
          💬
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white border-2 border-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-black">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Chat Modal */}
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
            className="lg:hidden fixed inset-0 bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 z-20 flex flex-col"
          >
            {/* Chat Container with Neo-brutalistic styling */}
            <div className="bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] m-4 mt-8 flex-1 flex flex-col">
              {/* Header */}
              <div className="bg-yellow-300 border-b-8 border-black p-4 flex items-center justify-between">
                <div className="w-8"></div> {/* Spacer */}
                <h2 className="text-2xl font-black text-center text-black">💬 CHAT</h2>
                <button 
                  onClick={() => setShowChat(false)} 
                  className="bg-red-500 text-white border-4 border-black font-black w-8 h-8 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  ✕
                </button>
              </div>
              
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-gray-400 rounded-full self-center mt-2 mb-2"></div>
              
              {/* Messages */}
              <div ref={mobileChatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => renderMessage(msg))}
              </div>
              
              {/* Input */}
              <div className="p-4 border-t-4 border-black bg-gray-50">
                <form onSubmit={onSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border-4 border-black p-3 text-lg font-bold"
                    placeholder="Écris ton message..."
                  />
                  <button 
                    type="submit" 
                    className="bg-green-400 border-4 border-black font-black px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    ➜
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
