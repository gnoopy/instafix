/**
 * Pause page motion (CSS animations/transitions, playing video/audio) for
 * the duration of a selection session — G3 "애니메이션·transition·영상으로
 * 대상이 움직이는 경우 선택 세션 동안 일시정지". Uses the Web Animations
 * API (`document.getAnimations()`) rather than a blanket CSS override, so
 * only things that were actually running get paused/resumed — nothing is
 * force-played that was already paused, and the widget's own chrome
 * (annotator toolbar pulse dot, etc.) is left alone.
 */

import { isWidgetChrome } from "../focus-tracker.js";

export interface MotionPauseHandle {
  /** Resume exactly what this call paused. Idempotent — safe to call twice. */
  restore(): void;
}

/** Duck-typed — avoids referencing the `KeyframeEffect` global, which some
 * engines (and jsdom) don't expose even though `getAnimations()` exists. */
function animationTarget(effect: AnimationEffect | null): EventTarget | null {
  if (effect && typeof effect === "object" && "target" in effect) {
    return (effect as { target: EventTarget | null }).target;
  }
  return null;
}

function isWithinWidgetChrome(target: EventTarget | null): boolean {
  return target instanceof Element && isWidgetChrome(target);
}

/** No-op handle for environments without the Web Animations API (older Safari, jsdom). */
const NOOP_HANDLE: MotionPauseHandle = { restore() {} };

export function pauseMotion(): MotionPauseHandle {
  let restored = false;

  const supportsAnimations = typeof document.getAnimations === "function";
  const pausedAnimations = supportsAnimations
    ? document
        .getAnimations()
        .filter((a) => a.playState === "running" && !isWithinWidgetChrome(animationTarget(a.effect)))
    : [];
  for (const a of pausedAnimations) a.pause();

  const media = Array.from(document.querySelectorAll<HTMLMediaElement>("video, audio")).filter(
    (m) => !m.paused && !m.ended && !isWidgetChrome(m),
  );
  for (const m of media) m.pause();

  if (pausedAnimations.length === 0 && media.length === 0) return NOOP_HANDLE;

  return {
    restore() {
      if (restored) return;
      restored = true;
      for (const a of pausedAnimations) {
        try {
          a.play();
        } catch {
          // Animation's target may have been removed from the DOM mid-session.
        }
      }
      for (const m of media) {
        if (m.isConnected) m.play().catch(() => {});
      }
    },
  };
}
