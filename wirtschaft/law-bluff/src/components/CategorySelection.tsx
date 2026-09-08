import type {
  LawCategory,
  LawGameState,
  RegisteredSession,
} from "../types/law";

interface CategorySelectionProps {
  session: RegisteredSession;
  state: LawGameState;
  categories: LawCategory[];
  busy: boolean;
  error: string | null;
  onChooseCategory: (categoryId: string) => Promise<void>;
  onAbortGame: () => Promise<void>;
}

export default function CategorySelection({
  session,
  state,
  categories,
  busy,
  error,
  onChooseCategory,
  onAbortGame,
}: CategorySelectionProps) {
  const currentPlayer = state.players.find(
    (player) => player.id === session.playerId,
  );

  const isHost =
    state.room?.hostPlayerId === session.playerId;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <section className="mx-auto max-w-5xl rounded-[28px] bg-white p-6 shadow-xl sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-700">
              ⚖️ Law Bluff
            </span>

            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
              Kategorie wählen
            </h1>

            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              {isHost
                ? "Wähle eine Kategorie für die fünf Spielrunden."
                : "Der Host wählt gerade eine Kategorie aus."}
            </p>
          </div>

          {currentPlayer && (
            <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3">
              <span className="text-3xl">
                {currentPlayer.avatar}
              </span>

              <div>
                <p className="font-black">
                  {currentPlayer.name}
                </p>

                <p className="text-sm font-bold text-slate-500">
                  Raum {state.room?.id}
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-100 px-4 py-3 font-bold text-red-700">
            {error}
          </div>
        )}

        {isHost ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                disabled={busy}
                onClick={() =>
                  void onChooseCategory(category.id)
                }
                className="group min-h-48 rounded-[24px] border-2 border-slate-200 bg-white p-5 text-left transition hover:-translate-y-1 hover:border-violet-500 hover:bg-violet-50 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="text-5xl">
                  {category.icon}
                </span>

                <h2 className="mt-5 text-xl font-black">
                  {category.name}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {category.description}
                </p>

                <span className="mt-5 inline-flex font-black text-violet-700">
                  Auswählen →
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[26px] bg-violet-50 px-6 py-12 text-center">
            <div className="text-6xl">
              👑
            </div>

            <h2 className="mt-5 text-3xl font-black">
              Der Host entscheidet
            </h2>

            <p className="mt-3 text-lg text-slate-600">
              Sobald eine Kategorie gewählt wurde, startet
              Runde 1 automatisch auf allen Geräten.
            </p>

            <div className="mx-auto mt-7 flex w-fit gap-2">
              <span className="size-3 animate-bounce rounded-full bg-violet-500" />
              <span className="size-3 animate-bounce rounded-full bg-violet-500 [animation-delay:120ms]" />
              <span className="size-3 animate-bounce rounded-full bg-violet-500 [animation-delay:240ms]" />
            </div>
          </div>
        )}

        {isHost && (
          <div className="mt-8 border-t border-slate-200 pt-6">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onAbortGame()}
              className="min-h-12 rounded-2xl border-2 border-red-200 bg-white px-5 font-black text-red-600 transition hover:bg-red-50 disabled:opacity-40"
            >
              Ganzes Spiel abbrechen
            </button>
          </div>
        )}
      </section>
    </main>
  );
}