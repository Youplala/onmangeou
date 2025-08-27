import { motion } from 'framer-motion';

interface VotingButtonsProps {
  onVoteYes: () => void;
  onVoteNo: () => void;
  isVotingAnimation: boolean;
}

export default function VotingButtons({ onVoteYes, onVoteNo, isVotingAnimation }: VotingButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 mt-4 w-full max-w-sm">
      <motion.button
        onClick={onVoteNo}
        disabled={isVotingAnimation}
        className="rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold text-lg py-3 md:py-4 shadow disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-400/60 transition"
        aria-label="Pas chaud"
      >
        ✕ Pas chaud
      </motion.button>
      <motion.button
        onClick={onVoteYes}
        disabled={isVotingAnimation}
        className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-lg py-3 md:py-4 shadow disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-400/60 transition"
        aria-label="Allez"
      >
        ✅ Allez
      </motion.button>
    </div>
  );
}
