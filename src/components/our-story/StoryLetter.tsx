"use client";

import { useCallback, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  EASE,
  STORY_LETTER,
  STORY_TITLE,
  TIMING,
  type LetterPhase,
} from "./constants";
import { useTypewriter } from "./useTypewriter";

type StoryLetterProps = {
  letterPhase: LetterPhase;
  onTypingComplete?: () => void;
};

function StableTypeBlock({
  tag: Tag,
  fullText,
  visibleText,
  className,
  ghostClassName,
  cursor,
}: {
  tag: "h2" | "p";
  fullText: string;
  visibleText: string;
  className?: string;
  ghostClassName?: string;
  cursor?: ReactNode;
}) {
  return (
    <Tag className={`grid ${className ?? ""}`}>
      <span
        aria-hidden
        className={`invisible col-start-1 row-start-1 select-none pointer-events-none ${ghostClassName ?? ""}`}
      >
        {fullText}
      </span>
      <span className={`col-start-1 row-start-1 ${ghostClassName ?? ""}`}>
        {visibleText}
        {cursor}
      </span>
    </Tag>
  );
}

export default function StoryLetter({
  letterPhase,
  onTypingComplete,
}: StoryLetterProps) {
  const [titleTypingDone, setTitleTypingDone] = useState(false);

  const handleTitleComplete = useCallback(() => {
    setTitleTypingDone(true);
  }, []);

  const handleBodyComplete = useCallback(() => {
    onTypingComplete?.();
  }, [onTypingComplete]);

  const typedTitle = useTypewriter(
    STORY_TITLE,
    letterPhase === "typing" && !titleTypingDone,
    TIMING.typeTitleSpeed,
    handleTitleComplete
  );

  const typedBody = useTypewriter(
    STORY_LETTER,
    letterPhase === "typing" && titleTypingDone,
    TIMING.typeBodySpeed,
    handleBodyComplete
  );

  if (letterPhase === "hidden") return null;

  const isTyping = letterPhase === "typing";

  const visibleTitle =
    letterPhase === "complete" || titleTypingDone ? STORY_TITLE : typedTitle;
  const visibleBody =
    letterPhase === "complete" ? STORY_LETTER : typedBody;

  return (
    <motion.article
      className="relative z-10 w-[280px] md:w-[400px] shrink-0 isolate px-6 py-7 md:px-8 md:py-9 rounded-sm text-center border border-sage/25 bg-[#faf8f4] shadow-lg"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: TIMING.letterAppear / 1000, ease: EASE }}
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(74,102,79,0.04) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(184,158,104,0.06) 0%, transparent 45%)
        `,
      }}
    >
      <StableTypeBlock
        tag="h2"
        fullText={STORY_TITLE}
        visibleText={visibleTitle}
        className="font-serif text-2xl md:text-4xl text-accent-primary mb-5 md:mb-7"
        cursor={
          isTyping && !titleTypingDone ? (
            <span className="inline-block w-[2px] h-[0.85em] bg-accent-primary/60 ml-0.5 animate-pulse align-middle" />
          ) : undefined
        }
      />
      <StableTypeBlock
        tag="p"
        fullText={STORY_LETTER}
        visibleText={visibleBody}
        className="font-serif text-sm md:text-lg text-foreground/75 leading-relaxed md:leading-loose font-light"
        cursor={
          isTyping &&
          titleTypingDone &&
          visibleBody.length < STORY_LETTER.length ? (
            <span className="inline-block w-[2px] h-[0.85em] bg-foreground/40 ml-0.5 animate-pulse align-middle" />
          ) : undefined
        }
      />
    </motion.article>
  );
}