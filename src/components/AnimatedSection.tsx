// components/AnimatedSection.tsx
"use client";

import React, { ReactNode } from "react";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";

type AnimationDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "fade"
  | "scale"
  | "none";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationDirection;
  delay?: number;
  threshold?: number;
  rootMargin?: string;
  duration?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  animation = "up",
  delay = 0,
  threshold = 0.1,
  rootMargin = "-50px",
  duration = 800,
}) => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
  });

  // Initial styles for different animation types
  const getInitialStyles = (): React.CSSProperties => {
    switch (animation) {
      case "up":
        return { transform: "translateY(40px)", opacity: 0 };
      case "down":
        return { transform: "translateY(-40px)", opacity: 0 };
      case "left":
        return { transform: "translateX(40px)", opacity: 0 };
      case "right":
        return { transform: "translateX(-40px)", opacity: 0 };
      case "fade":
        return { opacity: 0 };
      case "scale":
        return { transform: "scale(0.8)", opacity: 0 };
      case "none":
        return {};
      default:
        return { transform: "translateY(20px)", opacity: 0 };
    }
  };

  // Animated styles after intersection
  const getAnimatedStyles = (): React.CSSProperties => {
    if (isIntersecting) {
      return {
        transform: "translate(0) scale(1)",
        opacity: 1,
      };
    }
    return getInitialStyles();
  };

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        ...getInitialStyles(),
        ...getAnimatedStyles(),
        transition: `all ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
