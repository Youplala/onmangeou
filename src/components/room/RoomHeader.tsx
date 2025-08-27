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
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow transition bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 ${isInviteCopied ? 'from-emerald-500 to-green-600' : ''}`}>
              {isInviteCopied ? '✅ Lien copié' : '➕ Inviter la team'}
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
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow transition bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 ${isInviteCopied ? 'from-emerald-500 to-green-600' : ''}`}>
            {isInviteCopied ? '✅ Lien copié' : '➕ Inviter la team'}
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
