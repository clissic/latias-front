import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated } from "@react-spring/web";

export function FadeIn({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, 200);
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  const fadeInUp = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : "translateY(20px)",
    config: { tension: 200, friction: 20 },
  });

  return (
    <animated.div ref={elementRef} style={fadeInUp}>
      {children}
    </animated.div>
  );
};
