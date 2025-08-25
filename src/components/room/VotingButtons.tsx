import { motion } from 'framer-motion';

interface VotingButtonsProps {
  onVoteYes: () => void;
  onVoteNo: () => void;
  isVotingAnimation: boolean;
}

export default function VotingButtons({ onVoteYes, onVoteNo, isVotingAnimation }: VotingButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-sm">
      <motion.button
        onClick={onVoteNo}
        disabled={isVotingAnimation}
        className="bg-red-400 border-4 border-black font-black text-2xl py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-70"
      >
        💔 NON
      </motion.button>
      <motion.button
        onClick={onVoteYes}
        disabled={isVotingAnimation}
        className="bg-green-400 border-4 border-black font-black text-2xl py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-70"
      >
        💚 OUI
      </motion.button>
    </div>
  );
}
