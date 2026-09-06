import { LayoutGroup, motion } from "motion/react";
import RotatingText from "./ui/rotating-text";

export default function HeroRotating() {
  return (
    <LayoutGroup>
      <motion.h1
        className="flex items-center gap-3 text-4xl -z-10 line-clamp-1"
        layout
      >
        <motion.span
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          layout
        >
          the most
        </motion.span>
        <RotatingText
          texts={["transparent", "unbiased", "reliable", "objective"]}
          mainClassName="py-1 bg-indigo-600/50 border border-main px-3 rounded-lg"
          staggerFrom={"last"}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-120%" }}
          staggerDuration={0.025}
          splitLevelClassName="overflow-hidden pb-0.5"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          rotationInterval={3500}
        />
        <motion.span
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          layout
        >
          moderation bot
        </motion.span>
      </motion.h1>
    </LayoutGroup>
  );
}
