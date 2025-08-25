"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function JoinRoom() {
  const params = useParams();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const roomId = params.roomId as string;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    
    setIsJoining(true);
    
    // Simulate joining delay
    setTimeout(() => {
      // Store user info in localStorage for now
      localStorage.setItem('userName', firstName.trim());
      localStorage.setItem('roomId', roomId);
      
      // Navigate to the room
      router.push(`/room/${roomId}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 max-w-md w-full text-black"
      >
        <div className="text-center space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-black mb-2">
              🚪 REJOINDRE
            </h1>
            <div className="bg-yellow-300 border-4 border-black p-3 font-mono text-lg font-bold">
              ROOM: {roomId}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="text-left">
              <label className="block text-lg font-black mb-2">
                Votre prénom :
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ex: Marie"
                className="w-full border-4 border-black p-4 text-lg font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                required
                disabled={isJoining}
              />
            </div>

            <motion.button
              type="submit"
              disabled={!firstName.trim() || isJoining}
              whileHover={{ scale: firstName.trim() ? 1.05 : 1 }}
              whileTap={{ scale: firstName.trim() ? 0.95 : 1 }}
              className={`w-full border-4 border-black font-black text-xl py-4 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                firstName.trim() && !isJoining
                  ? 'bg-green-400 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isJoining ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  CONNEXION...
                </span>
              ) : (
                '🍽️ REJOINDRE LA SESSION'
              )}
            </motion.button>
          </form>

          {/* Info */}
          <div className="bg-blue-100 border-4 border-black p-4 text-sm">
            <div className="font-bold mb-2">📋 RÈGLES DU JEU :</div>
            <ul className="text-left space-y-1">
              <li>• Swipez ❤️ ou 💔 sur les restaurants</li>
              <li>• Chattez avec vos collègues</li>
              <li>• Vote fermé à 12h00 pile !</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
