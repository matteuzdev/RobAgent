import assert from "node:assert/strict";
import test from "node:test";
import { DoubleClapDetector } from "./clap-detector.js";
import { PresenceMachine } from "./presence-machine.js";
import { VoiceCommandDetector } from "./commands.js";

function clapFrame(length = 1024): Float32Array {
  const frame = new Float32Array(length);
  frame[10] = 0.98;
  frame[11] = -0.82;
  frame[12] = 0.76;
  return frame;
}

function quietFrame(length = 1024): Float32Array {
  return new Float32Array(length);
}

test("double clap wakes within timing window", () => {
  const detector = new DoubleClapDetector({
    sampleRate: 16000,
    minPeak: 0.7,
    minRms: 0.01,
    minCrestFactor: 5,
    doubleClapMinMs: 120,
    doubleClapMaxMs: 900,
    refractoryMs: 80,
  });

  const first = detector.process(clapFrame(), 1000);
  const quiet = detector.process(quietFrame(), 1200);
  const second = detector.process(clapFrame(), 1450);

  assert.equal(first.isDoubleClap, false);
  assert.equal(quiet.isTransient, false);
  assert.equal(second.isDoubleClap, true);
});

test("presence machine opens session without push-to-talk", () => {
  const machine = new PresenceMachine();
  const transition = machine.dispatch({ type: "wake", source: "double-clap" });

  assert.equal(transition.current, "listening");
  assert.ok(transition.actions.some((action) => action.type === "open-live-session"));
  assert.ok(transition.actions.some((action) => action.type === "start-listening"));
});

test("user speech interrupts assistant speech", () => {
  const machine = new PresenceMachine();
  machine.dispatch({ type: "wake", source: "wake-word" });
  machine.dispatch({ type: "assistant-speech-start" });
  const transition = machine.dispatch({ type: "speech-start" });

  assert.equal(transition.current, "listening");
  assert.ok(
    transition.actions.some((action) => action.type === "cancel-assistant-audio")
  );
});

test("sleep commands are detected in natural Portuguese", () => {
  const detector = new VoiceCommandDetector();
  assert.equal(detector.isSleepCommand("Valeu. Roby, pode dormir agora."), true);
  assert.equal(detector.isSleepCommand("Roby, me explica agentes."), false);
});
