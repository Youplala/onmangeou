import BrandPill from "../BrandPill";

interface RoomHeaderProps {
  isHeaderCollapsed: boolean;
  setIsHeaderCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
  isInviteCopied: boolean;
  handleInviteCopy: () => void;
  hasOptedOut: boolean;
  setHasOptedOut: (value: boolean) => void;
  setIsVotingFinished: (value: boolean) => void;
}

export default function RoomHeader({
  isHeaderCollapsed,
  setIsHeaderCollapsed,
  isInviteCopied,
  handleInviteCopy,
  hasOptedOut,
  setHasOptedOut,
  setIsVotingFinished,
}: RoomHeaderProps) {
  return (
    <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/40 ring-1 ring-black/10">
      <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(600px_circle_at_0%_0%,#ffffff40,transparent_40%),radial-gradient(800px_circle_at_100%_0%,#ffffff40,transparent_45%)]" />
      <div className="p-3 md:p-4 text-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandPill />
            <a
              href="https://github.com/youplala/onmangeou"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Voir le code sur GitHub"
              className="rounded-full bg-white/70 backdrop-blur ring-1 ring-black/10 p-2 text-black hover:bg-white transition shadow-sm"
              title="GitHub"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.46-1.2-1.12-1.52-1.12-1.52-.92-.64.07-.63.07-.63 1.02.07 1.56 1.07 1.56 1.07.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.1 0-1.13.39-2.05 1.03-2.77-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.06a9.3 9.3 0 0 1 2.5-.34c.85 0 1.7.11 2.5.34 1.9-1.33 2.74-1.06 2.74-1.06.55 1.41.21 2.45.1 2.71.64.72 1.03 1.64 1.03 2.77 0 3.97-2.34 4.84-4.57 5.1.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.59.69.49A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" /> 
              </svg>
            </a>
          </div>
          
          {/* Desktop buttons - always visible */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={handleInviteCopy}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow transition bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 ${isInviteCopied ? 'from-emerald-500 to-green-600' : ''}`}>
              {isInviteCopied ? '✅ Lien copié' : '➕ Inviter la team'}
            </button>
            <button
              onClick={() => setHasOptedOut(true)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold shadow transition ${hasOptedOut ? 'text-white bg-gradient-to-r from-rose-500 to-pink-600' : 'bg-white/70 backdrop-blur ring-1 ring-black/10 text-black hover:bg-white'}`}>
              {hasOptedOut ? "Je ne vote plus !" : "Pas dispo"}
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => setIsVotingFinished(true)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-white shadow transition bg-gradient-to-r from-purple-500 to-fuchsia-600">
                DEV: Finir le vote
              </button>
            )}
          </div>

          {/* Mobile toggle button */}
          <button
            onClick={() => setIsHeaderCollapsed((v) => !v)}
            className="lg:hidden rounded-xl bg-white/70 backdrop-blur ring-1 ring-black/10 px-3 py-2 font-semibold shadow"
            aria-label="Basculer l'en-tête"
          >
            {isHeaderCollapsed ? '▼' : '▲'}
          </button>
        </div>

        {/* Mobile buttons - collapsible */}
        <div className={`lg:hidden flex flex-wrap items-center justify-center gap-3 mt-3 ${isHeaderCollapsed ? 'hidden' : 'flex'}`}>
          <button
            onClick={handleInviteCopy}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow transition bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 ${isInviteCopied ? 'from-emerald-500 to-green-600' : ''}`}>
            {isInviteCopied ? '✅ Lien copié' : '➕ Inviter la team'}
          </button>
          <button
            onClick={() => setHasOptedOut(true)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold shadow transition ${hasOptedOut ? 'text-white bg-gradient-to-r from-rose-500 to-pink-600' : 'bg-white/70 backdrop-blur ring-1 ring-black/10 text-black hover:bg-white'}`}>
            {hasOptedOut ? "Je ne vote plus !" : "Pas dispo"}
          </button>
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => setIsVotingFinished(true)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-white shadow transition bg-gradient-to-r from-purple-500 to-fuchsia-600">
              DEV: Finir le vote
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
