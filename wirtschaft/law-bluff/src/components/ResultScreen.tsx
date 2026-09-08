import { useEffect, useRef } from "react";
import type { LawGameState } from "../types/law";

interface ResultScreenProps {
  state: LawGameState;
  onResultFinished: () => Promise<void>;
}

function createAudioContext(): AudioContext | null {
  const AudioContextClass =
    window.AudioContext ??
    (
      window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;

  return AudioContextClass
    ? new AudioContextClass()
    : null;
}

function playTone(
  context: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType,
  volume: number,
): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(
    frequency,
    start,
  );

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(
    volume,
    start + 0.015,
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration,
  );

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playCorrectSound(): void {
  const context = createAudioContext();

  if (!context) {
    return;
  }

  const now = context.currentTime;

  playTone(context, 523.25, now, 0.18, "sine", 0.16);
  playTone(
    context,
    659.25,
    now + 0.14,
    0.2,
    "sine",
    0.17,
  );
  playTone(
    context,
    783.99,
    now + 0.29,
    0.31,
    "sine",
    0.19,
  );
  playTone(
    context,
    1046.5,
    now + 0.46,
    0.42,
    "triangle",
    0.14,
  );

  window.setTimeout(() => {
    void context.close();
  }, 1400);
}

function playWrongSound(): void {
  const context = createAudioContext();

  if (!context) {
    return;
  }

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(220, now);
  oscillator.frequency.exponentialRampToValueAtTime(
    80,
    now + 0.8,
  );

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(
    0.14,
    now + 0.025,
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + 0.82,
  );

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.85);

  window.setTimeout(() => {
    void context.close();
  }, 1200);
}

export default function ResultScreen({
  state,
  onResultFinished,
}: ResultScreenProps) {
  const soundPlayed = useRef(false);

  const result = state.myResult;
  const correct = result?.correct ?? false;

  useEffect(() => {
    if (!soundPlayed.current) {
      soundPlayed.current = true;

      if (correct) {
        playCorrectSound();
      } else {
        playWrongSound();
      }
    }

    const resultStartedAt =
      state.game?.resultStartedAt
        ? new Date(
            state.game.resultStartedAt,
          ).getTime()
        : Date.now();

    const remaining = Math.max(
      250,
      resultStartedAt + 4100 - Date.now(),
    );

    const timer = window.setTimeout(() => {
      void onResultFinished();
    }, remaining);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    correct,
    onResultFinished,
    state.game?.resultStartedAt,
  ]);

  return (
    <main
      className={[
        "fixed inset-0 z-50 grid place-items-center px-5 text-center text-white",
        correct
          ? "bg-[radial-gradient(circle_at_center,rgba(255,255,255,.18),transparent_35%),linear-gradient(145deg,#25c985,#09895b)]"
          : "bg-[radial-gradient(circle_at_center,rgba(255,255,255,.13),transparent_35%),linear-gradient(145deg,#ef5b6d,#ba273c)]",
      ].join(" ")}
    >
      <section className="w-full max-w-5xl animate-[pulse_.35s_ease-out_1]">
        <div className="text-[clamp(80px,18vw,150px)] leading-none">
          {correct ? "✅" : "💥"}
        </div>

        <h1 className="mt-5 text-[clamp(48px,10vw,105px)] font-black leading-[.95] tracking-[-.055em] drop-shadow-xl">
          {result?.message ??
            (correct ? "Korrekt!" : "Inegleid!")}
        </h1>

        <p className="mt-7 text-[clamp(24px,5vw,42px)] font-black">
          +{result?.points ?? 0} Punkte
        </p>
      </section>
    </main>
  );
}