import { useState } from "react";
import type {
  LawCategory,
  LawGameState,
  RegisteredSession,
} from "../types/law";

interface BluffPhaseProps {
  session: RegisteredSession;
  state: LawGameState;
  category: LawCategory | null;
  busy: boolean;
  error: string | null;
  onSubmitBluff: (answer: string) => Promise<void>;
  onLeaveRound: () => Promise<void>;
  onAbortGame: () => Promise<void>;
}

export default function BluffPhase({
  session,
  state,
  category,
  busy,
  error,
  onSubmitBluff,
  onLeaveRound,
  onAbortGame,
}: BluffPhaseProps) {
  const [answer, setAnswer] = useState("");
  const [showOwnAnswer, setShowOwnAnswer] = useState(false);

  const isHost =
    state.room?.hostPlayerId === session.playerId;

  const hasSubmitted = state.hasSubmittedBluff;
  const ownAnswer = state.myBluff;

  const roundNumber = state.game?.roundNumber ?? 1;
  const totalRounds = state.game?.totalRounds ?? 5;

  const progress =
    totalRounds > 0
      ? Math.round((roundNumber / totalRounds) * 100)
      : 0;

  const submittedCount = state.counts?.bluffs ?? 0;
  const playerCount = state.counts?.players ?? 0;

  async function submit(): Promise<void> {
    const cleanedAnswer = answer
      .trim()
      .replace(/\s+/g, " ");

    if (
      !cleanedAnswer ||
      cleanedAnswer.length > 40 ||
      busy ||
      hasSubmitted
    ) {
      return;
    }

    await onSubmitBluff(cleanedAnswer);
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <section className="mx-auto grid max-w-5xl gap-5">
        <div className="rounded-[28px] bg-white p-6 shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-700">
                {category?.icon ?? "⚖️"}{" "}
                {category?.name ?? "Law Bluff"}
              </span>

              <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                {state.question?.question ??
                  "Frage wird geladen …"}
              </h1>
            </div>

            <div className="w-fit shrink-0 rounded-2xl bg-violet-50 px-4 py-3 font-black text-violet-800">
              Runde {roundNumber} / {totalRounds}
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-700 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="h-2 rounded-full bg-violet-600" />
            <div className="h-2 rounded-full bg-slate-200" />
            <div className="h-2 rounded-full bg-slate-200" />
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-xl sm:p-8">
          {!hasSubmitted ? (
            <>
              <h2 className="text-2xl font-black sm:text-3xl">
                Erfinde eine glaubwürdige falsche Antwort
              </h2>

              <p className="mt-3 text-slate-600">
                Möglichst kurz – idealerweise ein bis drei Wörter.
              </p>

              {error && (
                <div className="mt-5 rounded-2xl bg-red-100 px-4 py-3 font-bold text-red-700">
                  {error}
                </div>
              )}

              <label className="mt-6 grid gap-2 font-black">
                Deine Bluff-Antwort

                <input
                  value={answer}
                  maxLength={40}
                  autoComplete="off"
                  placeholder="Hier deine Bluff-Antwort eingeben …"
                  disabled={busy}
                  onChange={(event) =>
                    setAnswer(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void submit();
                    }
                  }}
                  className="min-h-14 rounded-2xl border-2 border-slate-200 bg-white px-4 outline-none transition focus:border-violet-500 disabled:bg-slate-100"
                />
              </label>

              <div className="mt-2 flex justify-between text-sm font-bold text-slate-500">
                <span>Maximal 40 Zeichen</span>
                <span>{answer.length} / 40</span>
              </div>

              <button
                type="button"
                disabled={!answer.trim() || busy}
                onClick={() => void submit()}
                className="mt-6 min-h-14 w-full rounded-2xl bg-violet-600 px-6 text-lg font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {busy
                  ? "Antwort wird gespeichert …"
                  : "Antwort abschicken"}
              </button>
            </>
          ) : (
            <>
              <div className="rounded-[22px] bg-green-100 p-5 text-green-800">
                <p className="text-xl font-black">
                  ✅ Antwort gespeichert
                </p>

                <p className="mt-2 font-bold">
                  Warte, bis alle ihre Bluff-Antwort abgegeben haben.
                </p>
              </div>

              <div className="mt-5 rounded-[22px] bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-800">
                      Deine eigene Antwort
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-500">
                      Sie bleibt zunächst verdeckt.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowOwnAnswer((value) => !value)
                    }
                    className="min-h-11 rounded-2xl border-2 border-slate-200 bg-white px-4 font-black text-slate-700 transition hover:bg-slate-100"
                  >
                    {showOwnAnswer
                      ? "Antwort verbergen"
                      : "Antwort anzeigen"}
                  </button>
                </div>

                {showOwnAnswer && (
                  <div className="mt-4 rounded-2xl bg-white px-4 py-4 text-xl font-black text-violet-700">
                    {ownAnswer ?? "Antwort wird geladen …"}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="mt-6 rounded-[22px] bg-violet-50 px-5 py-4 text-center">
            <p className="font-black text-violet-800">
              {submittedCount} von {playerCount} Antworten gespeichert
            </p>

            {hasSubmitted &&
              submittedCount < playerCount && (
                <p className="mt-2 text-sm font-bold text-slate-600">
                  Warte auf die anderen …
                </p>
              )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            disabled={busy}
            onClick={() => void onLeaveRound()}
            className="min-h-12 rounded-2xl border-2 border-slate-300 bg-white px-5 font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Runde verlassen
          </button>

          {isHost && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onAbortGame()}
              className="min-h-12 rounded-2xl border-2 border-red-200 bg-white px-5 font-black text-red-600 transition hover:bg-red-50 disabled:opacity-40"
            >
              Ganzes Spiel abbrechen
            </button>
          )}
        </div>
      </section>
    </main>
  );
}