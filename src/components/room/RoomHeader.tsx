import BrandPill from "../BrandPill";
import GitHubButton from "../GitHubButton";

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
          <BrandPill />
            
          
          {/* Desktop buttons - always visible */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={handleInviteCopy}
              className={`relative rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 ${
                isInviteCopied 
                  ? 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-emerald-500/25' 
                  : 'bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 shadow-blue-500/25 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-700'
              } before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity`}>
              <span className="relative z-10">
                {isInviteCopied ? '✅ Lien copié' : '➕ Inviter la team'}
              </span>
            </button>
            <button
              onClick={() => setHasOptedOut(true)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold shadow transition ${hasOptedOut ? 'text-white bg-gradient-to-r from-rose-500 to-pink-600' : 'bg-white/70 backdrop-blur ring-1 ring-black/10 text-black hover:bg-white'}`}>
              {hasOptedOut ? "Je ne vote plus !" : "Pas dispo"}
            </button>
            <GitHubButton />
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
            className={`relative rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 ${
              isInviteCopied 
                ? 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-emerald-500/25' 
                : 'bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 shadow-blue-500/25 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-700'
            } before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity`}>
            <span className="relative z-10">
              {isInviteCopied ? '✅ Lien copié' : '➕ Inviter la team'}
            </span>
          </button>
          <button
            onClick={() => setHasOptedOut(true)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold shadow transition ${hasOptedOut ? 'text-white bg-gradient-to-r from-rose-500 to-pink-600' : 'bg-white/70 backdrop-blur ring-1 ring-black/10 text-black hover:bg-white'}`}>
            {hasOptedOut ? "Je ne vote plus !" : "Pas dispo"}
          </button>
          <GitHubButton />
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
