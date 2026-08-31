import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isVoiceInputSupported,
  type SpeechRecognitionConstructor,
  type SpeechRecognitionLike,
  VoiceInputController,
} from "../../src/voice.js";

class MockRecognition implements SpeechRecognitionLike {
  lang = "";
  continuous = false;
  interimResults = false;
  onresult: SpeechRecognitionLike["onresult"] = null;
  onerror: SpeechRecognitionLike["onerror"] = null;
  onend: SpeechRecognitionLike["onend"] = null;
  onstart: SpeechRecognitionLike["onstart"] = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
}

function makeCtor(instances: MockRecognition[]): SpeechRecognitionConstructor {
  return function (this: unknown) {
    const inst = new MockRecognition();
    instances.push(inst);
    return inst;
  } as unknown as SpeechRecognitionConstructor;
}

function makeResult(transcript: string, isFinal: boolean) {
  return { isFinal, length: 1, 0: { transcript } };
}

describe("isVoiceInputSupported", () => {
  it("is true when a constructor is provided, false otherwise", () => {
    expect(isVoiceInputSupported(MockRecognition as unknown as SpeechRecognitionConstructor)).toBe(true);
    expect(isVoiceInputSupported(null)).toBe(false);
  });
});

describe("VoiceInputController", () => {
  let controllers: VoiceInputController[] = [];

  afterEach(() => {
    for (const c of controllers) c.destroy();
    controllers = [];
  });

  function makeController(instances: MockRecognition[] = []): {
    controller: VoiceInputController;
    instances: MockRecognition[];
  } {
    const controller = new VoiceInputController({ SpeechRecognitionCtor: makeCtor(instances) });
    controllers.push(controller);
    return { controller, instances };
  }

  it("starts idle", () => {
    const { controller } = makeController();
    expect(controller.currentState).toBe("idle");
  });

  it("goes unsupported when no constructor is available, without creating a recognition instance", () => {
    const controller = new VoiceInputController({ SpeechRecognitionCtor: null });
    controllers.push(controller);
    const states: string[] = [];
    controller.onStateChange((s) => states.push(s));

    controller.start();

    expect(controller.currentState).toBe("unsupported");
    expect(states).toEqual(["unsupported"]);
  });

  it("transitions requesting-permission -> listening as the engine confirms start", () => {
    const { controller, instances } = makeController();
    const states: string[] = [];
    controller.onStateChange((s) => states.push(s));

    controller.start();
    expect(states).toEqual(["requesting-permission"]);
    expect(instances).toHaveLength(1);
    expect(instances[0]?.start).toHaveBeenCalledOnce();

    instances[0]?.onstart?.();
    expect(states).toEqual(["requesting-permission", "listening"]);
    expect(controller.currentState).toBe("listening");
  });

  it("does not request permission again while already listening (no-op start)", () => {
    const { controller, instances } = makeController();
    controller.start();
    instances[0]?.onstart?.();
    expect(controller.currentState).toBe("listening");

    controller.start();
    expect(instances).toHaveLength(1); // no second recognition object constructed
  });

  it("reports interim text without marking it final", () => {
    const { controller, instances } = makeController();
    controller.start();
    instances[0]?.onstart?.();

    const events: { interim: string; finalSegment: string }[] = [];
    controller.onTranscript((e) => events.push(e));

    instances[0]?.onresult?.({ resultIndex: 0, results: [makeResult("hello wor", false)] });

    expect(events).toEqual([{ interim: "hello wor", finalSegment: "" }]);
  });

  it("reports a final segment distinctly from interim, per-event (not cumulative)", () => {
    const { controller, instances } = makeController();
    controller.start();
    instances[0]?.onstart?.();

    const events: { interim: string; finalSegment: string }[] = [];
    controller.onTranscript((e) => events.push(e));

    instances[0]?.onresult?.({ resultIndex: 0, results: [makeResult("hello world", true)] });
    instances[0]?.onresult?.({ resultIndex: 1, results: [makeResult("hello world", true), makeResult("next", false)] });

    expect(events[0]).toEqual({ interim: "", finalSegment: "hello world" });
    // second event only reports index 1 onward — the already-final first result isn't repeated
    expect(events[1]).toEqual({ interim: "next", finalSegment: "" });
  });

  it("moves processing -> idle when stop() completes", () => {
    const { controller, instances } = makeController();
    controller.start();
    instances[0]?.onstart?.();

    const states: string[] = [];
    controller.onStateChange((s) => states.push(s));

    controller.stop();
    expect(states).toEqual(["processing"]);
    expect(instances[0]?.stop).toHaveBeenCalledOnce();

    instances[0]?.onend?.();
    expect(states).toEqual(["processing", "idle"]);
  });

  it("stop() is a no-op when not currently listening", () => {
    const { controller, instances } = makeController();
    controller.stop();
    expect(instances).toHaveLength(0);
  });

  it("maps 'not-allowed' to permission-denied and sets state to error", () => {
    const { controller, instances } = makeController();
    controller.start();
    instances[0]?.onstart?.();

    const errors: string[] = [];
    controller.onError((e) => errors.push(e));

    instances[0]?.onerror?.({ error: "not-allowed" });

    expect(controller.currentState).toBe("error");
    expect(errors).toEqual(["permission-denied"]);
  });

  it.each([
    ["no-speech", "no-speech"],
    ["audio-capture", "audio-capture"],
    ["network", "network"],
    ["aborted", "aborted"],
    ["service-not-allowed", "permission-denied"],
    ["something-weird", "unknown"],
  ] as const)("maps engine error code %s to %s", (code, expected) => {
    const { controller, instances } = makeController();
    controller.start();
    instances[0]?.onstart?.();

    const errors: string[] = [];
    controller.onError((e) => errors.push(e));
    instances[0]?.onerror?.({ error: code });

    expect(errors).toEqual([expected]);
  });

  it("an onend after onerror does not overwrite the error state", () => {
    const { controller, instances } = makeController();
    controller.start();
    instances[0]?.onstart?.();
    instances[0]?.onerror?.({ error: "network" });
    expect(controller.currentState).toBe("error");

    instances[0]?.onend?.();
    expect(controller.currentState).toBe("error");
  });

  it("sets error state when the engine throws synchronously on start()", () => {
    const instances: MockRecognition[] = [];
    const throwingCtor = function (this: unknown) {
      const inst = new MockRecognition();
      inst.start = vi.fn(() => {
        throw new Error("boom");
      });
      instances.push(inst);
      return inst;
    } as unknown as SpeechRecognitionConstructor;
    const controller = new VoiceInputController({ SpeechRecognitionCtor: throwingCtor });
    controllers.push(controller);

    const errors: string[] = [];
    controller.onError((e) => errors.push(e));

    controller.start();

    expect(controller.currentState).toBe("error");
    expect(errors).toEqual(["unknown"]);
  });

  it("ignores late callbacks from a session invalidated by destroy()", () => {
    const { controller, instances } = makeController();
    controller.start();
    instances[0]?.onstart?.();

    const states: string[] = [];
    controller.onStateChange((s) => states.push(s));

    controller.destroy();
    expect(instances[0]?.abort).toHaveBeenCalledOnce();

    // A stale callback firing after teardown must not resurrect state or notify listeners.
    instances[0]?.onresult?.({ resultIndex: 0, results: [makeResult("late", true)] });
    instances[0]?.onend?.();

    expect(states).toEqual([]);
  });

  it("start() after destroy() stays inert", () => {
    const { controller, instances } = makeController();
    controller.destroy();
    controller.start();
    expect(instances).toHaveLength(0);
    expect(controller.currentState).toBe("idle");
  });

  it("respects an explicit lang option", () => {
    const { controller, instances } = makeController();
    const withLang = new VoiceInputController({ SpeechRecognitionCtor: makeCtor(instances), lang: "ko-KR" });
    controllers.push(withLang);
    withLang.start();
    expect(instances[0]?.lang).toBe("ko-KR");
    controller.destroy();
  });
});
