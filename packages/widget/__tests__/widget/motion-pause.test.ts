// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { pauseMotion } from "../../src/dom/motion-pause.js";

function makeFakeAnimation(target: Element, playState: "running" | "paused" = "running") {
  return {
    playState,
    effect: { target } as unknown as AnimationEffect,
    pause: vi.fn(function (this: { playState: string }) {
      this.playState = "paused";
    }),
    play: vi.fn(function (this: { playState: string }) {
      this.playState = "running";
    }),
  };
}

function stubMediaElement(el: HTMLMediaElement, playing: boolean): void {
  Object.defineProperty(el, "paused", { value: !playing, configurable: true });
  Object.defineProperty(el, "ended", { value: false, configurable: true });
  el.pause = vi.fn();
  el.play = vi.fn().mockResolvedValue(undefined);
}

describe("pauseMotion", () => {
  const originalGetAnimations = (document as Document & { getAnimations?: () => Animation[] }).getAnimations;

  afterEach(() => {
    (document as Document & { getAnimations?: () => Animation[] }).getAnimations = originalGetAnimations;
    document.body.replaceChildren();
  });

  it("pauses only currently-running animations and resumes exactly those on restore", () => {
    const runningTarget = document.createElement("div");
    const pausedTarget = document.createElement("div");
    document.body.append(runningTarget, pausedTarget);

    const running = makeFakeAnimation(runningTarget, "running");
    const alreadyPaused = makeFakeAnimation(pausedTarget, "paused");
    (document as unknown as { getAnimations: () => unknown[] }).getAnimations = () => [running, alreadyPaused];

    const handle = pauseMotion();
    expect(running.pause).toHaveBeenCalledTimes(1);
    expect(alreadyPaused.pause).not.toHaveBeenCalled();

    handle.restore();
    expect(running.play).toHaveBeenCalledTimes(1);
    expect(alreadyPaused.play).not.toHaveBeenCalled();
  });

  it("never resumes an animation that was already paused before the session", () => {
    const target = document.createElement("div");
    document.body.append(target);
    const alreadyPaused = makeFakeAnimation(target, "paused");
    (document as unknown as { getAnimations: () => unknown[] }).getAnimations = () => [alreadyPaused];

    const handle = pauseMotion();
    handle.restore();
    expect(alreadyPaused.play).not.toHaveBeenCalled();
  });

  it("leaves widget chrome animations untouched", () => {
    const chromeTarget = document.createElement("div");
    chromeTarget.setAttribute("data-siteping-ignore", "true");
    document.body.append(chromeTarget);
    const chromeAnim = makeFakeAnimation(chromeTarget, "running");
    (document as unknown as { getAnimations: () => unknown[] }).getAnimations = () => [chromeAnim];

    pauseMotion();
    expect(chromeAnim.pause).not.toHaveBeenCalled();
  });

  it("pauses playing video/audio elements and resumes them on restore", () => {
    const video = document.createElement("video");
    const audio = document.createElement("audio");
    document.body.append(video, audio);
    stubMediaElement(video, true);
    stubMediaElement(audio, true);
    (document as unknown as { getAnimations?: () => unknown[] }).getAnimations = () => [];

    const handle = pauseMotion();
    expect(video.pause).toHaveBeenCalledTimes(1);
    expect(audio.pause).toHaveBeenCalledTimes(1);

    handle.restore();
    expect(video.play).toHaveBeenCalledTimes(1);
    expect(audio.play).toHaveBeenCalledTimes(1);
  });

  it("does not pause media that was already paused", () => {
    const video = document.createElement("video");
    document.body.append(video);
    stubMediaElement(video, false);
    (document as unknown as { getAnimations?: () => unknown[] }).getAnimations = () => [];

    pauseMotion();
    expect(video.pause).not.toHaveBeenCalled();
  });

  it("restore() is idempotent — a second call does not double-resume", () => {
    const target = document.createElement("div");
    document.body.append(target);
    const running = makeFakeAnimation(target, "running");
    (document as unknown as { getAnimations: () => unknown[] }).getAnimations = () => [running];

    const handle = pauseMotion();
    handle.restore();
    handle.restore();
    expect(running.play).toHaveBeenCalledTimes(1);
  });

  it("is a safe no-op when nothing is running", () => {
    (document as unknown as { getAnimations?: () => unknown[] }).getAnimations = () => [];
    const handle = pauseMotion();
    expect(() => handle.restore()).not.toThrow();
  });
});
