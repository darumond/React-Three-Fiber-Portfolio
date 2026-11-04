import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

export const ScrollManager = ({ section, onSectionChange }) => {
  const data = useScroll();
  const isAnimating = useRef(false);
  const currentSection = useRef(section);
  currentSection.current = section;

  useEffect(() => {
    data.fill.classList.add("top-0", "absolute");
    isAnimating.current = true;
    const tween = gsap.to(data.el, {
      duration: 1,
      scrollTop: section * data.el.clientHeight,
      onStart: () => { isAnimating.current = true; },
      onComplete: () => { isAnimating.current = false; },
    });
    return () => { tween.kill(); isAnimating.current = false; };
  }, [section, data]);

  useEffect(() => {
    let height = data.el.clientHeight;
    const observer = new ResizeObserver(() => {
      if (height === data.el.clientHeight) return;
      height = data.el.clientHeight;
      gsap.killTweensOf(data.el);
      isAnimating.current = false;
      data.el.scrollTop = currentSection.current * height;
    });
    observer.observe(data.el);
    return () => observer.disconnect();
  }, [data]);

  useFrame(() => {
    // Drei caches its scroll range; keep it in sync when the viewport resizes.
    const scrollRange = data.el.scrollHeight - data.el.clientHeight;
    data.scroll.current = scrollRange > 0 ? data.el.scrollTop / scrollRange : 0;
    if (isAnimating.current) return;
    const nextSection = Math.max(0, Math.min(data.pages - 1,
      Math.round(data.el.scrollTop / data.el.clientHeight)));
    if (nextSection !== section) onSectionChange(nextSection);
  });

  return null;
};
