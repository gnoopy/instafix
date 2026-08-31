/**
 * Voice input (G5) — a thin, testable wrapper around the browser's Web
 * Speech API (`SpeechRecognition` / `webkitSpeechRecognition`). Lazily
 * constructed by the caller (popup.ts) on the user's first mic click —
 * nothing here runs, and no permission is requested, until `start()` is
 * called from an explicit user gesture.
 *
 * Deliberately does NOT touch `MediaRecorder`/raw audio at all: the only
 * output is text transcripts from the browser's own recognition engine, so
 * "don't store the audio blob" is true by construction, not by a policy we
 * have to remember to enforce.
 */

export const VOICE_STATES = [
  "idle",
  "requesting-permission",
  "listening",
  "processing",
  "error",
  "unsupported",
] as const;
export type VoiceState = (typeof VOICE_STATES)[number];

export type VoiceErrorReason = "permission-denied" | "no-speech" | "audio-capture" | "network" | "aborted" | "unknown";

/** One recognition update. `finalSegment` is only the NEW finalized text for this event, not cumulative. */
export interface VoiceTranscriptEvent {
  interim: string;
  finalSegment: string;
}

// ---------------------------------------------------------------------------
// Minimal local Web Speech API surface — not part of standard lib.dom types.
// ---------------------------------------------------------------------------

interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: { transcript: string } | undefined;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function globalSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function mapErrorCode(code: string): VoiceErrorReason {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "permission-denied";
    case "no-speech":
      return "no-speech";
    case "audio-capture":
      return "audio-capture";
    case "network":
      return "network";
    case "aborted":
      return "aborted";
    default:
      return "unknown";
  }
}

export interface VoiceControllerOptions {
  /** BCP-47 language tag (e.g. "en-US", "ko-KR"). Defaults to `document.documentElement.lang` or "en-US". */
  lang?: string;
  /** Injectable for tests — defaults to the global `SpeechRecognition` constructor. */
  SpeechRecognitionCtor?: SpeechRecognitionConstructor | null;
}

/** Cheap, synchronous support check — safe to call eagerly (no permission prompt, no object construction). */
export function isVoiceInputSupported(
  ctor: SpeechRecognitionConstructor | null = globalSpeechRecognitionCtor(),
): boolean {
  return ctor !== null;
}

/**
 * State machine: idle → requesting-permission → listening → processing →
 * idle, with error/unsupported as terminal-until-retried states. Every
 * transition notifies `onStateChange` listeners; `onTranscript` fires once
 * per recognition result carrying the running interim text plus any newly
 * finalized segment (never cumulative — the caller owns merge policy).
 */
export class VoiceInputController {
  private state: VoiceState = "idle";
  private recognition: SpeechRecognitionLike | null = null;
  private readonly stateListeners = new Set<(s: VoiceState) => void>();
  private readonly transcriptListeners = new Set<(e: VoiceTranscriptEvent) => void>();
  private readonly errorListeners = new Set<(e: VoiceErrorReason) => void>();
  private destroyed = false;
  /** Invalidates callbacks from a stale session after stop()/destroy()/a new start(). */
  private sessionId = 0;

  constructor(private readonly options: VoiceControllerOptions = {}) {}

  get currentState(): VoiceState {
    return this.state;
  }

  onStateChange(cb: (s: VoiceState) => void): () => void {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  onTranscript(cb: (e: VoiceTranscriptEvent) => void): () => void {
    this.transcriptListeners.add(cb);
    return () => this.transcriptListeners.delete(cb);
  }

  onError(cb: (e: VoiceErrorReason) => void): () => void {
    this.errorListeners.add(cb);
    return () => this.errorListeners.delete(cb);
  }

  private setState(s: VoiceState): void {
    this.state = s;
    for (const cb of this.stateListeners) cb(s);
  }

  /**
   * Begin listening. No-op if destroyed or already mid-session. Must only
   * ever be invoked from an explicit user gesture (the mic button's click
   * handler) — this function never runs on its own.
   */
  start(): void {
    if (this.destroyed) return;
    if (this.state === "listening" || this.state === "requesting-permission" || this.state === "processing") return;

    const ctor = this.options.SpeechRecognitionCtor ?? globalSpeechRecognitionCtor();
    if (!ctor) {
      this.setState("unsupported");
      return;
    }

    const mySession = ++this.sessionId;
    this.setState("requesting-permission");

    const recognition = new ctor();
    recognition.lang =
      this.options.lang || (typeof document !== "undefined" ? document.documentElement.lang : "") || "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      if (mySession !== this.sessionId) return;
      this.setState("listening");
    };

    recognition.onresult = (e) => {
      if (mySession !== this.sessionId) return;
      let interim = "";
      let finalSegment = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (!result) continue;
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) finalSegment += transcript;
        else interim += transcript;
      }
      if (finalSegment || interim) {
        for (const cb of this.transcriptListeners) cb({ interim, finalSegment });
      }
    };

    recognition.onerror = (e) => {
      if (mySession !== this.sessionId) return;
      const reason = mapErrorCode(e.error);
      this.setState("error");
      for (const cb of this.errorListeners) cb(reason);
    };

    recognition.onend = () => {
      if (mySession !== this.sessionId) return;
      // A stale/aborted-elsewhere session's onend must not stomp a state the
      // controller already moved past (e.g. "error" set by onerror first —
      // browsers fire onerror then onend for the same failure).
      if (this.state === "listening" || this.state === "requesting-permission" || this.state === "processing") {
        this.setState("idle");
      }
    };

    this.recognition = recognition;
    try {
      recognition.start();
    } catch {
      if (mySession !== this.sessionId) return;
      this.setState("error");
      for (const cb of this.errorListeners) cb("unknown");
    }
  }

  /** Stop listening — moves to "processing" immediately, then "idle" once the engine confirms via its own end event. */
  stop(): void {
    if (this.state !== "listening") return;
    this.setState("processing");
    try {
      this.recognition?.stop();
    } catch {
      this.setState("idle");
    }
  }

  /** Tear down — invalidates any in-flight session so late callbacks (a popup close mid-listen) are silently dropped. */
  destroy(): void {
    this.destroyed = true;
    this.sessionId++;
    try {
      this.recognition?.abort();
    } catch {
      // Already stopped/never started — nothing to abort.
    }
    this.recognition = null;
    this.stateListeners.clear();
    this.transcriptListeners.clear();
    this.errorListeners.clear();
  }
}
