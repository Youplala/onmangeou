"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BrandPill from "../../../components/BrandPill";

export default function JoinRoom() {
  const params = useParams();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const roomId = params.roomId as string;

  const tryHaptic = () => {
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(15);
      }
    } catch {}
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    
    setIsJoining(true);
    tryHaptic();
    
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
    <div className="min-h-screen bg-gradient-to-br from-orange-300 via-rose-300 to-pink-400 pt-20 flex items-center justify-center p-6 md:p-10 font-sans">
      {/* Glass pill header with logo */}
      <div className="fixed top-0 left-0 right-0 z-30 backdrop-blur-xl bg-white/40 ring-1 ring-black/10">
        <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(600px_circle_at_0%_0%,#ffffff40,transparent_40%),radial-gradient(800px_circle_at_100%_0%,#ffffff40,transparent_45%)]" />
        <div className="p-3 md:p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <BrandPill />
          </div>
        </div>
      </div>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl ring-1 ring-black/10 shadow-2xl p-8 md:p-12 max-w-md w-full text-black"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
          const py = (e.clientY - r.top) / r.height - 0.5;
          setTilt({ rx: -(py * 10), ry: px * 10 });
        }}
        onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
        style={{ transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
      >
        <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(600px_circle_at_0%_0%,#ffffff40,transparent_40%),radial-gradient(800px_circle_at_100%_0%,#ffffff40,transparent_45%)]" />
        <div className="text-center space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-2 tracking-tight">
              <span className="bg-gradient-to-r from-black via-gray-700 to-black bg-clip-text text-transparent">🚪 Rejoindre</span>
            </h1>
            <div className="rounded-lg bg-gray-100 ring-1 ring-black/10 p-3 font-mono text-sm break-all text-black">
              Room: {roomId}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="text-left">
              <label className="block text-lg font-extrabold mb-2 text-black">Votre prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ex: Marie"
                className="w-full rounded-xl bg-white/80 backdrop-blur ring-1 ring-black/10 p-4 text-lg font-semibold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black/20 transition"
                required
                disabled={isJoining}
              />
            </div>

            <motion.button
              type="submit"
              disabled={!firstName.trim() || isJoining}
              whileHover={{ scale: firstName.trim() ? 1.02 : 1 }}
              whileTap={{ scale: firstName.trim() ? 0.98 : 1 }}
              className={`w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg py-4 px-6 shadow-lg hover:from-emerald-600 hover:to-green-700 transition-colors ${
                firstName.trim() && !isJoining ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
              }`}
            >
              {isJoining ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
                  Connexion...
                </span>
              ) : (
                '🍽️ Rejoindre la session'
              )}
            </motion.button>
          </form>

          {/* Info */}
          <div className="rounded-2xl bg-white/70 backdrop-blur ring-1 ring-black/10 p-4 text-sm text-black">
            <div className="font-extrabold mb-2">📋 Règles du jeu</div>
            <ul className="text-left space-y-1 text-black/80">
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
