import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { clamp, wheelDestination } from "./sceneTransition";

export const ScrollManager = ({ section, onSectionChange, menuOpened }) => {
  const data = useScroll();
  const isAnimating = useRef(false);
  const currentSection = useRef(section);
  const gesture = useRef({ lastAt: -Infinity, consumed: false, total: 0 });
  currentSection.current = section;

  useEffect(() => {
    data.fill.classList.add("top-0", "absolute");
    data.el.style.overscrollBehavior = "contain";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    isAnimating.current = true;
    const tween = gsap.to(data.el, {
      duration: reduced || Math.abs(data.el.scrollTop - section * data.el.clientHeight) < 2 ? 0 : 1.65,
      ease: "sine.inOut",
      scrollTop: section * data.el.clientHeight,
      onComplete: () => { isAnimating.current = false; },
    });
    return () => { tween.kill(); isAnimating.current = false; };
  }, [section, data]);

  useEffect(() => {
    const editable = (target) => target instanceof HTMLElement &&
      (target.isContentEditable || !!target.closest("input, textarea, select"));
    const navigate = (destination) => {
      const next = clamp(destination, 0, data.pages - 1);
      if (next !== currentSection.current) {
        isAnimating.current = true;
        currentSection.current = next;
        onSectionChange(next);
      }
    };
    const wheel = (event) => {
      if (menuOpened) { event.preventDefault(); return; }
      if (event.ctrlKey || editable(event.target) || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? data.el.clientHeight : 1);
      const next = wheelDestination(gesture.current, delta, performance.now(), isAnimating.current, currentSection.current, data.pages - 1);
      if (next !== null) navigate(next);
    };
    const key = (event) => {
      if (menuOpened || editable(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
      if (isAnimating.current && ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
        event.preventDefault();
        return;
      }
      let next;
      if (event.code === "PageDown") next = currentSection.current + 1;
      else if (event.code === "PageUp") next = currentSection.current - 1;
      else if (event.code === "Home") next = 0;
      else if (event.code === "End") next = data.pages - 1;
      else if (currentSection.current !== 1 && event.code === "ArrowDown") next = currentSection.current + 1;
      else if (currentSection.current !== 1 && event.code === "ArrowUp") next = currentSection.current - 1;
      if (next === undefined) return;
      event.preventDefault();
      if (!event.repeat && !isAnimating.current) navigate(next);
    };
    let touch;
    const touchStart = (event) => {
      touch = null;
      if (menuOpened || event.touches.length !== 1 || !(event.target instanceof HTMLElement) ||
          event.target.closest("button, a, input, textarea, select")) return;
      touch = { x: event.touches[0].clientX, y: event.touches[0].clientY, consumed: false };
    };
    const touchMove = (event) => {
      if (menuOpened) { event.preventDefault(); return; }
      if (!touch || event.touches.length !== 1) return;
      const dx = touch.x - event.touches[0].clientX;
      const dy = touch.y - event.touches[0].clientY;
      if (Math.abs(dy) <= Math.abs(dx)) return;
      event.preventDefault();
      if (Math.abs(dy) > 36 && !touch.consumed) {
        touch.consumed = true;
        if (!isAnimating.current) navigate(currentSection.current + Math.sign(dy));
      }
    };
    const touchEnd = () => { touch = null; };
    data.el.addEventListener("wheel", wheel, { passive: false });
    data.el.addEventListener("touchstart", touchStart, { passive: true });
    data.el.addEventListener("touchmove", touchMove, { passive: false });
    data.el.addEventListener("touchend", touchEnd);
    data.el.addEventListener("touchcancel", touchEnd);
    window.addEventListener("keydown", key);
    return () => {
      data.el.removeEventListener("wheel", wheel);
      data.el.removeEventListener("touchstart", touchStart);
      data.el.removeEventListener("touchmove", touchMove);
      data.el.removeEventListener("touchend", touchEnd);
      data.el.removeEventListener("touchcancel", touchEnd);
      window.removeEventListener("keydown", key);
    };
  }, [data, onSectionChange, menuOpened]);

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
    const scrollRange = data.el.scrollHeight - data.el.clientHeight;
    data.scroll.current = scrollRange > 0 ? data.el.scrollTop / scrollRange : 0;
    if (isAnimating.current) return;
    const next = clamp(Math.round(data.el.scrollTop / data.el.clientHeight), 0, data.pages - 1);
    if (next !== currentSection.current) onSectionChange(next);
  });
  return null;
};
