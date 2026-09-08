import type {
  LawPlayer,
  LawRoom,
  RegisteredSession,
} from "../types/law";

interface RoomOverviewProps {
  session: RegisteredSession;
  rooms: LawRoom[];
  players: LawPlayer[];
  loading: boolean;
  error: string | null;
  busyRoomId: number | null;
  onJoinRoom: (roomId: number) => Promise<void>;
}

export default function RoomOverview({
  session,
  rooms,
  players,
  loading,
  error,
  busyRoomId,
  onJoinRoom,
}: RoomOverviewProps) {
  if (loading) {
    return (
      <main className="min-h-screen p-6">
        <section className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-lg font-bold text-slate-600">
            Räume werden geladen …
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[28px] bg-white p-6 shadow-xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-700">
                ⚖️ Law Bluff
              </span>

              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
                Raum auswählen
              </h1>

              <p className="mt-3 max-w-2xl text-lg text-slate-600">
                Tritt einem freien Raum bei. Maximal vier Personen können
                gleichzeitig in einem Raum spielen.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600">
              Spieler-ID:
              <span className="ml-2 font-mono text-xs">
                {session.playerId.slice(0, 8)}
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl bg-red-100 px-4 py-3 font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {rooms.map((room) => {
              const roomPlayers = players.filter(
                (player) => player.room_id === room.id,
              );

              const isFull = roomPlayers.length >= 5;
              const isOpen = room.status === "open";
              const canJoin = isOpen && !isFull;

              return (
                <article
                  key={room.id}
                  className="rounded-[24px] border-2 border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-black">
                      Raum {room.id}
                    </h2>

                    <span
                      className={[
                        "rounded-full px-3 py-1 text-sm font-black",
                        room.status === "open"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700",
                      ].join(" ")}
                    >
                      {room.status === "open"
                        ? "Offen"
                        : room.status === "choosing_category"
                          ? "Kategorieauswahl"
                          : "Spiel läuft"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-bold text-slate-500">
                    {roomPlayers.length} / 5 Spieler
                  </p>

                  <div className="mt-4 grid gap-2">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const player = roomPlayers[index];

                      return (
                        <div
                          key={index}
                          className={[
                            "flex min-h-12 items-center rounded-2xl px-3",
                            player
                              ? "bg-violet-50"
                              : "border border-dashed border-slate-300 bg-slate-50",
                          ].join(" ")}
                        >
                          {player ? (
                            <>
                              <span className="text-2xl">
                                {player.avatar}
                              </span>

                              <span className="ml-3 truncate font-black">
                                {player.name}
                              </span>

                              {player.id === room.host_player_id && (
                                <span className="ml-auto rounded-full bg-amber-100 px-2 py-1 text-xs font-black text-amber-700">
                                  Host
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm font-bold text-slate-400">
                              Freier Platz
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={!canJoin || busyRoomId !== null}
                    onClick={() => void onJoinRoom(room.id)}
                    className="mt-5 min-h-12 w-full rounded-2xl bg-violet-600 px-4 font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {busyRoomId === room.id
                      ? "Beitreten …"
                      : isFull
                        ? "Raum voll"
                        : isOpen
                          ? "Beitreten"
                          : "Nicht verfügbar"}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}