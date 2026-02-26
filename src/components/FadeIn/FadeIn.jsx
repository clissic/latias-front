import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated } from "@react-spring/web";

export function FadeIn({ children, inline }) {
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
      { threshold: 0.1 }
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

  const baseStyle = {
    ...fadeInUp,
    width: '100%',
    maxWidth: '100%',
  };

  const wrapperStyle = inline
    ? { ...baseStyle, display: 'block' }
    : { ...baseStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' };

  return (
    <animated.div ref={elementRef} style={wrapperStyle}>
      {children}
    </animated.div>
  );
}
