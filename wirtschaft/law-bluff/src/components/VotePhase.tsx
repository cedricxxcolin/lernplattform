import type {
  LawCategory,
  LawGameState,
  RegisteredSession,
} from "../types/law";

const LETTERS = [
  "A", "B", "C", "D", "E", "F", "G",
];

interface VotePhaseProps {
  session: RegisteredSession;
  state: LawGameState;
  category: LawCategory | null;
  busy: boolean;
  error: string | null;
  onVote: (optionId: string) => Promise<void>;
  onLeaveRound: () => Promise<void>;
  onAbortGame: () => Promise<void>;
}

export default function VotePhase({
  session,
  state,
  category,
  busy,
  error,
  onVote,
  onLeaveRound,
  onAbortGame,
}: VotePhaseProps) {
  const isHost =
    state.room?.hostPlayerId === session.playerId;

  const hasVoted = state.hasVoted;
  const selectedOptionId = state.myVoteOptionId;

  const roundNumber = state.game?.roundNumber ?? 1;
  const totalRounds = state.game?.totalRounds ?? 5;

  const progress =
    totalRounds > 0
      ? Math.round(
          (roundNumber / totalRounds) * 100,
        )
      : 0;

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
                {state.question?.question}
              </h1>
            </div>

            <div className="w-fit shrink-0 rounded-2xl bg-violet-50 px-4 py-3 font-black text-violet-800">
              Runde {roundNumber} / {totalRounds}
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="h-2 rounded-full bg-violet-600" />

            <div className="h-2 rounded-full bg-violet-600 shadow-[0_0_0_4px_rgba(124,58,237,.12)]" />

            <div className="h-2 rounded-full bg-slate-200" />
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-xl sm:p-8">
          <h2 className="text-2xl font-black sm:text-3xl">
            Welche Antwort ist richtig?
          </h2>

          <p className="mt-2 text-slate-600">
            Die echte Lösung wurde mit allen Bluff-Antworten
            zufällig gemischt.
          </p>

          {error && (
            <div className="mt-5 rounded-2xl bg-red-100 px-4 py-3 font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 grid gap-3">
            {state.answerOptions.map(
              (option, index) => {
                const selected =
                  selectedOptionId === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={hasVoted || busy}
                    onClick={() =>
                      void onVote(option.id)
                    }
                    className={[
                      "grid min-h-[78px] w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-[20px] border-[3px] px-4 py-3 text-left transition",
                      selected
                        ? "border-violet-600 bg-violet-50"
                        : "border-slate-200 bg-white",
                      !hasVoted
                        ? "hover:-translate-y-0.5 hover:border-violet-400"
                        : "",
                    ].join(" ")}
                  >
                    <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 font-black text-white">
                      {LETTERS[index] ?? index + 1}
                    </span>

                    <span className="min-w-0 text-lg font-black">
                      {option.text}
                    </span>

                    <span className="grid justify-items-end gap-1">
                      {(hasVoted ||
                        state.game?.phase !==
                          "vote") &&
                        option.voters.length >
                          0 && (
                          <span className="flex flex-wrap justify-end gap-1 text-2xl">
                            {option.voters.map(
                              (voter) => (
                                <span
                                  key={voter.id}
                                  title={voter.name}
                                >
                                  {voter.avatar}
                                </span>
                              ),
                            )}
                          </span>
                        )}
                    </span>
                  </button>
                );
              },
            )}
          </div>

          {hasVoted && (
            <div className="mt-6 rounded-[22px] bg-violet-50 px-5 py-4 text-center">
              <p className="font-black text-violet-800">
                Stimme gespeichert
              </p>

              <p className="mt-2 text-sm font-bold text-slate-600">
                {state.counts.votes} von{" "}
                {state.counts.players} Spielern haben
                abgestimmt.
              </p>

              {state.counts.votes <
                state.counts.players && (
                <p className="mt-2 font-bold text-slate-600">
                  Warte auf die anderen …
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            disabled={busy}
            onClick={() => void onLeaveRound()}
            className="min-h-12 rounded-2xl border-2 border-slate-300 bg-white px-5 font-black text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Runde verlassen
          </button>

          {isHost && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onAbortGame()}
              className="min-h-12 rounded-2xl border-2 border-red-200 bg-white px-5 font-black text-red-600 hover:bg-red-50 disabled:opacity-40"
            >
              Ganzes Spiel abbrechen
            </button>
          )}
        </div>
      </section>
    </main>
  );
}