"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import GitHubButton from "../components/GitHubButton";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [roomUrl, setRoomUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [enableTilt, setEnableTilt] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [slackEnabled, setSlackEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mqHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(!!mqReduced.matches);
      setEnableTilt(!!mqHover.matches && !mqReduced.matches);
    };
    update();
    mqHover.addEventListener?.("change", update);
    mqReduced.addEventListener?.("change", update);
    return () => {
      mqHover.removeEventListener?.("change", update);
      mqReduced.removeEventListener?.("change", update);
    };
  }, []);

  const tryHaptic = () => {
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        // Subtle vibration on supported devices (mostly Android)
        navigator.vibrate?.(20);
      }
    } catch {}
  };

  // Lightweight, dependency-free confetti burst
  const launchConfetti = () => {
    tryHaptic();
    const particleCount = reducedMotion ? 30 : 80;
    const container = document.createElement("div");
    Object.assign(container.style, {
      position: "fixed",
      inset: "0",
      pointerEvents: "none",
      zIndex: "9999",
    } as CSSStyleDeclaration);
    document.body.appendChild(container);

    const colors = ["#34d399", "#10b981", "#f43f5e", "#f59e0b", "#60a5fa"];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.25;
    const particles: Array<{
      el: HTMLSpanElement;
      x: number;
      y: number;
      vx: number;
      vy: number;
      ay: number;
      r: number;
      vr: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const el = document.createElement("span");
      Object.assign(el.style, {
        position: "absolute",
        left: "0px",
        top: "0px",
        width: `${6 + Math.random() * 6}px`,
        height: `${10 + Math.random() * 10}px`,
        background: colors[Math.floor(Math.random() * colors.length)],
        borderRadius: "2px",
        transform: `translate(${cx}px, ${cy}px) rotate(0deg)`,
        willChange: "transform",
      } as CSSStyleDeclaration);
      container.appendChild(el);
      particles.push({
        el,
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 10,
        vy: -4 - Math.random() * 8,
        ay: 0.18,
        r: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
      });
    }

    const start = performance.now();
    const maxDuration = reducedMotion ? 900 : 1600;
    const step = (t: number) => {
      const dt = 1 / 60; // approx
      particles.forEach((p) => {
        p.vy += p.ay * dt * 60;
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.r += p.vr * dt * 60;
        p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg)`;
      });
      if (t - start < maxDuration) requestAnimationFrame(step);
      else container.remove();
    };
    requestAnimationFrame(step);
  };

  const withUtm = (url: string, source: string) =>
    `${url}?utm_source=${source}&utm_medium=share_button&utm_campaign=room_invites`;
  const shareMessage = (url: string) =>
    `On mange où ? Rejoins ma session et vote en 1 min: ${url}`;

  const shareTo = (target: "system" | "whatsapp" | "slack") => {
    const url = withUtm(roomUrl, target);
    const text = shareMessage(url);
    if (target === "system" && navigator.share) {
      navigator.share({ title: "On mange où ?", text, url }).catch(() => {});
      return;
    }
    const open = (href: string) => window.open(href, "_blank");
    switch (target) {
      case "whatsapp":
        open(`https://wa.me/?text=${encodeURIComponent(text)}`);
        break;
      case "slack":
        // Copy the message so user can paste in Slack
        navigator.clipboard.writeText(text).catch(() => {});
        // Try to open the Slack app via deep link. If it likely fails, hide the Slack button for this session.
        try {
          let resolved = false;
          const onVisibility = () => { resolved = true; cleanup(); };
          const onBlur = () => { resolved = true; cleanup(); };
          const cleanup = () => {
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('blur', onBlur);
          };
          document.addEventListener('visibilitychange', onVisibility, { once: true });
          window.addEventListener('blur', onBlur, { once: true });
          const timer = setTimeout(() => {
            if (!resolved) {
              setSlackEnabled(false);
              // Optional fallback: open help article in a new tab
              open(`https://slack.com/intl/en-gb/help/articles/201330736-Add-apps-to-your-Slack-workspace#share-links-in-slack`);
            }
            cleanup();
            clearTimeout(timer);
          }, 900);
          // Attempt deep link
          window.location.href = 'slack://open';
        } catch {
          setSlackEnabled(false);
        }
        break;
      default:
        // Fallback to copy
        navigator.clipboard.writeText(text);
    }
  };

  const createRoom = () => {
    const roomId = nanoid(6).toUpperCase();
    const url = `${window.location.origin}/join/${roomId}`;
    setRoomUrl(url);
    setShowModal(true);
    launchConfetti();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(roomUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-300 via-rose-300 to-pink-400 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="mx-auto rounded-full bg-white/60 backdrop-blur px-4 py-2 ring-1 ring-black/10 shadow-sm flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="On mange où ? logo"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="font-black text-lg md:text-2xl tracking-tight text-black">On mange où ?</span>
              <span className="ml-1 hidden md:inline-flex items-center rounded-full bg-black text-white text-[10px] px-2 py-0.5 font-bold">v1</span>
            </div>
            <GitHubButton className="absolute right-4" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center p-6 md:p-10 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-4xl">
          {/* Main Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl ring-1 ring-black/10 shadow-2xl p-8 md:p-12"
            onMouseMove={(e) => {
              if (!enableTilt) return;
              const r = e.currentTarget.getBoundingClientRect();
              const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
              const py = (e.clientY - r.top) / r.height - 0.5;
              setTilt({ rx: -(py * 10), ry: px * 10 });
            }}
            onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
            style={{ transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
          >
            <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(600px_circle_at_0%_0%,#ffffff40,transparent_40%),radial-gradient(800px_circle_at_100%_0%,#ffffff40,transparent_45%)]" />
            <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-rose-200/60 blur-3xl -z-10" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-emerald-200/60 blur-3xl -z-10" />
            <div className="pointer-events-none absolute inset-0 opacity-15 -z-10 [background:repeating-linear-gradient(45deg,rgba(0,0,0,0.06)_0_10px,transparent_10px_20px)]" />
            <div className="text-center space-y-8">
              {/* Subtitle */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 mx-auto bg-black/80 text-white text-[11px] md:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ring-1 ring-white/10">
                  Nouveau <span className="opacity-80">•</span> Gratuit
                </div>
                <h2 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
                  <span className="text-black">Décidez où</span>
                  <span className="mx-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-rose-500 to-orange-500">on mange</span>
                  <span className="text-black">,</span>
                  <br />
                  <span className="text-black/80">sans débat.</span>
                </h2>
                <p className="text-base md:text-xl font-medium text-black/70 max-w-2xl mx-auto">
                  Crée une session, invite l’équipe, et choisissez le resto en 1 minute.
                </p>
              </div>
              
              {/* Main Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createRoom}
                className="w-full max-w-md mx-auto block cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-xl md:text-2xl py-5 px-8 shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:from-emerald-600 hover:to-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                🚀 Lancer une session
              </motion.button>

              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="mx-auto block text-sm font-semibold text-black/70 hover:text-black cursor-pointer"
                aria-label="Comment ça marche ?"
              >
                Comment ça marche ? ↓
              </button>
              
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                <div className="rounded-2xl bg-white/70 backdrop-blur ring-1 ring-black/10 p-6 shadow-lg text-center transform-gpu transition-transform hover:-translate-y-0.5 hover:scale-[1.01]">
                  <div className="text-4xl mb-3">⏰</div>
                  <div className="font-extrabold text-lg mb-1 text-black">Clôture à midi</div>
                  <div className="text-sm text-black/70">Fin des votes à midi</div>
                </div>
                <div className="rounded-2xl bg-white/70 backdrop-blur ring-1 ring-black/10 p-6 shadow-lg text-center transform-gpu transition-transform hover:-translate-y-0.5 hover:scale-[1.01]">
                  <div className="text-4xl mb-3">💬</div>
                  <div className="font-extrabold text-lg mb-1 text-black">Chat en direct</div>
                  <div className="text-sm text-black/70">Remettez en question les choix des autres</div>
                </div>
                <div className="rounded-2xl bg-white/70 backdrop-blur ring-1 ring-black/10 p-6 shadow-lg text-center transform-gpu transition-transform hover:-translate-y-0.5 hover:scale-[1.01]">
                  <div className="text-4xl mb-3">📱</div>
                  <div className="font-extrabold text-lg mb-1 text-black">Vote par swipe</div>
                  <div className="text-sm text-black/70">Voter en glissant, facile.</div>
                </div>
                <div className="rounded-2xl bg-white/70 backdrop-blur ring-1 ring-black/10 p-6 shadow-lg text-center transform-gpu transition-transform hover:-translate-y-0.5 hover:scale-[1.01]">
                  <div className="text-4xl mb-3">🏆</div>
                  <div className="font-extrabold text-lg mb-1 text-black">Résultat</div>
                  <div className="text-sm text-black/70">QR code pour y aller direct</div>
                </div>
              </div>

              {/* How it works */}
              <div id="how-it-works" className="rounded-2xl bg-white/70 backdrop-blur ring-1 ring-black/10 p-6 mt-10 text-left">
                <h3 className="font-extrabold text-xl mb-4 text-black">🎯 Comment ça marche</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="flex items-start gap-3">
                    <span className="bg-black text-white font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    <div>
                      <div className="font-extrabold text-sm text-black">Crée & partage</div>
                      <div className="text-xs text-black/70">Génère un lien et invite la team</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-black text-white font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    <div>
                      <div className="font-extrabold text-sm text-black">Votez ensemble</div>
                      <div className="text-xs text-black/70">Swipe les restos jusqu’à midi</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-black text-white font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    <div>
                      <div className="font-extrabold text-sm text-black">Découvre le gagnant</div>
                      <div className="text-xs text-black/70">QR code pour y aller direct</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl bg-white/90 backdrop-blur-xl ring-1 ring-black/10 shadow-2xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
              <div className="w-8" /> {/* Spacer */}
              <h2 className="text-xl md:text-2xl font-extrabold text-center text-black">
                🎉 Session prête !
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-black/80 text-white font-bold w-8 h-8 rounded-md flex items-center justify-center shadow hover:bg-black transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            <div className="p-5 md:p-6 space-y-4">
              {/* Explanation text */}
              <div className="text-center text-gray-600 text-sm">
                Envoie le lien à la team et mettez tout le monde d'accord
              </div>

              {/* URL with inline copy button */}
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg bg-gray-100 ring-1 ring-black/10 p-3 font-mono text-sm break-all text-black">
                  {roomUrl}
                </div>
                <button 
                  onClick={handleCopy} 
                  className={`rounded-lg px-3 py-2 text-sm font-bold shadow transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${isCopied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {isCopied ? '✅' : '📋'}
                  <span className="hidden sm:inline">{isCopied ? 'Copié' : 'Copier'}</span>
                </button>
              </div>

              {/* Quick Share Options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  aria-label="Partager via WhatsApp"
                  onClick={() => shareTo("whatsapp")}
                  className="rounded-xl bg-[#25D366] text-white px-4 py-3 text-sm font-bold shadow hover:brightness-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {/* WhatsApp logo */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.44 0 .06 5.38.06 12a11.9 11.9 0 0 0 1.6 6l-1.66 6 6.16-1.62A11.93 11.93 0 0 0 12.06 24c6.62 0 12-5.38 12-12 0-3.2-1.25-6.2-3.54-8.52Z" fill="white" fillOpacity=".2"/>
                    <path d="M12.06 2.4a9.6 9.6 0 0 0-8.2 14.5l.26.44-1.03 3.72 3.8-1 .44.26a9.6 9.6 0 1 0 4.73-17.92Z" fill="currentColor"/>
                    <path d="M17.4 14.08c-.3-.15-1.78-.88-2.06-.98-.28-.1-.49-.15-.7.15-.2.3-.8.98-.98 1.18-.18.2-.36.22-.66.07-.3-.15-1.25-.46-2.38-1.48-.88-.78-1.47-1.73-1.64-2.02-.17-.29-.02-.45.13-.6.14-.14.3-.36.45-.54.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.7-1.68-.96-2.3-.25-.6-.5-.52-.7-.53-.18-.01-.38-.01-.58-.01-.2 0-.53.08-.8.38-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49 2.99 1.28 2.99.86 3.53.82.54-.05 1.78-.72 2.03-1.42.25-.7.25-1.3.17-1.46-.08-.16-.27-.25-.58-.4Z" fill="white"/>
                  </svg>
                  WhatsApp
                </button>
                {slackEnabled && (
                  <button
                    aria-label="Partager sur Slack"
                    onClick={() => shareTo("slack")}
                    className="rounded-xl bg-[#4A154B] text-white px-4 py-3 text-sm font-bold shadow hover:brightness-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {/* Slack logo */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="currentColor"/>
                    </svg>
                    Slack
                  </button>
                )}
              </div>
              
              {/* Full width join button */}
              <button
                onClick={() => window.open(roomUrl, '_blank')}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg py-4 shadow-lg hover:from-emerald-600 hover:to-green-700 transition-colors cursor-pointer"
              >
                🚀 Rejoindre maintenant
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
