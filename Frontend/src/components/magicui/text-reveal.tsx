"use client";

import { motion, MotionValue, useScroll, useTransform } from "motion/react";
import { type ComponentPropsWithoutRef, type FC, type ReactNode, useRef } from "react";

import { cn } from "../../lib/utils";

export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  children: string;
}

export const TextReveal: FC<TextRevealProps> = ({ children, className }) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  if (typeof children !== "string") {
    throw new Error("TextReveal: children must be a string");
  }

  const words = children.split(" ");

  return (
    <div ref={targetRef} className={cn("relative z-0 h-[100vh]", className)}>
      <div
        className={
          "sticky top-0 mx-auto flex h-screen max-w-4xl items-center bg-transparent px-[1rem] py-[2rem] sm:px-[2rem] lg:px-[3rem]"
        }
      >
        <span
          ref={targetRef}
          className={
            "flex flex-wrap p-4 text-lg font-bold text-gray-400 md:p-6 md:text-xl lg:p-8 lg:text-2xl xl:text-3xl"
          }
        >
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </span>
      </div>
    </div>
  );
};

interface WordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative mx-1 lg:mx-1.5">
      {/* Removed duplicate background text to fix "ExperienceExperience" issue */}
      <motion.span
        style={{ opacity: opacity }}
        className={"bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"}
      >
        {children}
      </motion.span>
    </span>
  );
};
