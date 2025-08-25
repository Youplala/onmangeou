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
    <div className="bg-yellow-300 border-b-8 border-black p-4 text-black sticky top-0 z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black">🍽️ ON MANGE OÙ ?</h1>
          
          {/* Desktop buttons - always visible */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={handleInviteCopy}
              className={`bg-blue-500 text-white border-4 border-black font-black px-6 py-3 text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all ${isInviteCopied ? 'bg-green-400' : ''}`}>
              {isInviteCopied ? '✅ LIEN COPIÉ' : '➕ INVITER'}
            </button>
            <button
              onClick={() => setHasOptedOut(true)}
              className={`bg-white border-4 border-black font-black px-6 py-3 text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all ${hasOptedOut ? 'bg-red-500 text-white' : ''}`}>
              {hasOptedOut ? "JE VOTE PLUS !" : "PAS DISPO"}
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => setIsVotingFinished(true)}
                className="bg-purple-500 text-white border-4 border-black font-black px-4 py-2 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                DEV: Finish Vote
              </button>
            )}
          </div>

          {/* Mobile toggle button */}
          <button
            onClick={() => setIsHeaderCollapsed((v) => !v)}
            className="lg:hidden bg-white border-4 border-black px-3 py-2 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            aria-label="Toggle header"
          >
            {isHeaderCollapsed ? '▼' : '▲'}
          </button>
        </div>

        {/* Mobile buttons - collapsible */}
        <div className={`lg:hidden flex flex-wrap items-center justify-center gap-3 mt-4 ${isHeaderCollapsed ? 'hidden' : 'flex'}`}>
          <button
            onClick={handleInviteCopy}
            className={`bg-blue-500 text-white border-4 border-black font-black px-4 py-2 text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all ${isInviteCopied ? 'bg-green-400' : ''}`}>
            {isInviteCopied ? '✅ LIEN COPIÉ' : '➕ INVITER'}
          </button>
          <button
            onClick={() => setHasOptedOut(true)}
            className={`bg-white border-4 border-black font-black px-4 py-2 text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all ${hasOptedOut ? 'bg-red-500 text-white' : ''}`}>
            {hasOptedOut ? "JE VOTE PLUS !" : "PAS DISPO"}
          </button>
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => setIsVotingFinished(true)}
              className="bg-purple-500 text-white border-4 border-black font-black px-4 py-2 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              DEV: Finish Vote
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
