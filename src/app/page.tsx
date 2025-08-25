"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { motion } from "framer-motion";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [roomUrl, setRoomUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const createRoom = () => {
    const roomId = nanoid(6).toUpperCase();
    const url = `${window.location.origin}/join/${roomId}`;
    setRoomUrl(url);
    setShowModal(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(roomUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-yellow-300 to-blue-400 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12"
        >
          <div className="text-center space-y-8">
            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-black text-black leading-tight">
              ON MANGE<br />
              <span className="text-pink-500">OÙ ?</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              Créez une session de vote pour choisir votre restaurant !
            </p>
            
            {/* Main Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={createRoom}
              className="w-full bg-yellow-400 border-4 border-black text-black font-black text-2xl md:text-3xl py-6 px-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 uppercase"
            >
              Créer une session
            </motion.button>
            
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-blue-300 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-2xl mb-2">⏰</div>
                <div className="font-bold text-sm">Vote jusqu'à midi</div>
              </div>
              <div className="bg-green-300 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-bold text-sm">Chat en temps réel</div>
              </div>
              <div className="bg-orange-300 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-2xl mb-2">📱</div>
                <div className="font-bold text-sm">Swipe comme Tinder</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      {showModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-black mb-4 text-center text-black">
              Session créée !
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-100 border-2 border-black p-3 font-mono text-sm break-all  text-black">
                {roomUrl}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleCopy} 
                  className={`border-4 border-black font-black text-xl py-4 w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 ${isCopied ? 'bg-green-400' : 'bg-blue-500 text-white'}`}>
                  {isCopied ? '✅ Copié !' : '📋 Copier'}
                </button>
                <button
                  onClick={() => window.open(roomUrl, '_blank')}
                  className="bg-green-400 border-3 border-black text-black font-bold py-3 px-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Rejoindre
                </button>
              </div>
              
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-red-400 border-3 border-black text-black font-bold py-2 px-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                ✕ Fermer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
