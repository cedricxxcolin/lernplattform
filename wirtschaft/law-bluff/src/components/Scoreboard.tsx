import { useState } from "react";
import type {
  LawCategory,
  LawGameState,
  RegisteredSession,
} from "../types/law";

interface ScoreboardProps {
  session: RegisteredSession;
  state: LawGameState;
  category: LawCategory | null;
  busy: boolean;
  error: string | null;
  onReady: () => Promise<void>;
  onOpenPodium: () => Promise<void>;
  onLeaveRound: () => Promise<void>;
  onAbortGame: () => Promise<void>;
}

export default function Scoreboard({
  session,
  state,
  category,
  busy,
  error,
  onReady,
  onOpenPodium,
  onLeaveRound,
  onAbortGame,
}: ScoreboardProps) {
  const [showInfo, setShowInfo] = useState(false);

  const isHost =
    state.room?.hostPlayerId === session.playerId;

  const sortedPlayers = [...state.players].sort(
    (first, second) =>
      second.points - first.points ||
      first.name.localeCompare(second.name),
  );

  const isFinalRound =
    state.game?.isFinalRound ?? false;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <section className="mx-auto grid max-w-5xl gap-5">
        <div className="rounded-[28px] bg-white p-6 shadow-xl sm:p-8">
          <span className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-700">
            {category?.icon ?? "⚖️"}{" "}
            {category?.name ?? "Law Bluff"}
          </span>

          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">
            {isFinalRound
              ? "Letzte Runde beendet"
              : "Zwischenrangliste"}
          </h1>

          <div className="mt-6 rounded-[22px] bg-green-100 p-5 text-green-800">
            <p className="text-sm font-black uppercase">
              Richtige Antwort
            </p>

            <p className="mt-2 text-2xl font-black">
              {state.question?.correctAnswer}
            </p>

            <p className="mt-3 leading-7">
              {state.question?.explanation}
            </p>

            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="mt-4 min-h-11 rounded-2xl bg-white px-4 font-black text-green-800 shadow-sm"
            >
              📖 Mehr Informationen
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl bg-red-100 px-4 py-3 font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="mt-7 grid gap-3">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={[
                  "grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] p-4",
                  index === 0
                    ? "bg-violet-100 ring-2 ring-violet-300"
                    : "bg-slate-100",
                ].join(" ")}
              >
                <span className="text-center text-2xl font-black">
                  {index === 0
                    ? "🥇"
                    : index === 1
                      ? "🥈"
                      : index === 2
                        ? "🥉"
                        : `${index + 1}.`}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-lg font-black">
                    {player.avatar} {player.name}
                  </p>
                </div>

                <div className="grid justify-items-end gap-1">
                  <span className="font-black">
                    {player.points} Punkte
                  </span>

                  <span className="rounded-full bg-green-100 px-2 py-1 text-sm font-black text-green-700">
                    +{player.roundPoints}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7">
            {isFinalRound ? (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void onOpenPodium()
                }
                className="min-h-14 w-full rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 px-6 text-lg font-black text-white shadow-lg disabled:opacity-40"
              >
                Rangliste anschauen
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={state.isReady || busy}
                  onClick={() => void onReady()}
                  className="min-h-14 w-full rounded-2xl bg-violet-600 px-6 text-lg font-black text-white hover:bg-violet-700 disabled:bg-slate-300"
                >
                  {state.isReady
                    ? "Bereit – warte auf die anderen"
                    : "Nächste Runde"}
                </button>

                <p className="mt-3 text-center text-sm font-bold text-slate-500">
                  {state.counts.ready} von{" "}
                  {state.counts.players} Spielern sind bereit.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            disabled={busy}
            onClick={() => void onLeaveRound()}
            className="min-h-12 rounded-2xl border-2 border-slate-300 bg-white px-5 font-black text-slate-700"
          >
            Runde verlassen
          </button>

          {isHost && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onAbortGame()}
              className="min-h-12 rounded-2xl border-2 border-red-200 bg-white px-5 font-black text-red-600"
            >
              Ganzes Spiel abbrechen
            </button>
          )}
        </div>
      </section>

      {showInfo && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowInfo(false);
            }
          }}
        >
          <section className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-violet-100 px-3 py-2 text-sm font-black text-violet-700">
                  📖 Mehr Informationen
                </span>

                <h2 className="mt-4 text-3xl font-black">
                  Hintergrund
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white text-xl font-black"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="font-black">Frage</p>
                <p className="mt-2 leading-7">
                  {state.question?.question}
                </p>
              </div>

              <div className="rounded-2xl bg-green-100 p-4 text-green-900">
                <p className="font-black">
                  Richtige Antwort
                </p>
                <p className="mt-2 text-xl font-black">
                  {state.question?.correctAnswer}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="font-black">
                  Kurze Erklärung
                </p>
                <p className="mt-2 leading-7">
                  {state.question?.explanation}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="font-black">
                  Hintergrund
                </p>
                <p className="mt-2 leading-7">
                  {state.question?.details ||
                    "Noch keine zusätzlichen Informationen hinterlegt."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="mt-6 min-h-12 w-full rounded-2xl bg-violet-600 px-5 font-black text-white"
            >
              Schliessen
            </button>
          </section>
        </div>
      )}
    </main>
  );
}