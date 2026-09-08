import type {
  LawPlayer,
  LawRoom,
  RegisteredSession,
} from "../types/law";

interface RoomLobbyProps {
  session: RegisteredSession;
  room: LawRoom;
  players: LawPlayer[];
  busy: boolean;
  error: string | null;
  onLeaveRoom: () => Promise<void>;
  onStartGame: () => Promise<void>;
}

export default function RoomLobby({
  session,
  room,
  players,
  busy,
  error,
  onLeaveRoom,
  onStartGame,
}: RoomLobbyProps) {
  const roomPlayers = players.filter(
    (player) => player.room_id === room.id,
  );

  const currentPlayer = roomPlayers.find(
    (player) => player.id === session.playerId,
  );

  const isHost = room.host_player_id === session.playerId;
  const canStart =
    isHost &&
    room.status === "open" &&
    roomPlayers.length >= 2;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <section className="mx-auto max-w-4xl rounded-[28px] bg-white p-6 shadow-xl sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-700">
              ⚖️ Law Bluff
            </span>

            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
              Raum {room.id}
            </h1>

            <p className="mt-3 text-lg text-slate-600">
              {room.status === "open"
                ? "Warte auf Mitspieler."
                : room.status === "choosing_category"
                  ? "Der Host wählt eine Kategorie."
                  : "Das Spiel läuft."}
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
                  {isHost ? "Du bist Host" : "Mitspieler"}
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

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">
              Spieler
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-black text-slate-600">
              {roomPlayers.length} / 5
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 5 }).map((_, index) => {
              const player = roomPlayers[index];

              return (
                <div
                  key={player?.id ?? index}
                  className={[
                    "flex min-h-20 items-center rounded-[20px] border-2 px-4",
                    player
                      ? "border-violet-200 bg-violet-50"
                      : "border-dashed border-slate-200 bg-slate-50",
                  ].join(" ")}
                >
                  {player ? (
                    <>
                      <span className="text-4xl">
                        {player.avatar}
                      </span>

                      <div className="ml-4 min-w-0">
                        <p className="truncate text-lg font-black">
                          {player.name}
                        </p>

                        <p className="text-sm font-bold text-slate-500">
                          {player.id === room.host_player_id
                            ? "👑 Host"
                            : "Mitspieler"}
                        </p>
                      </div>

                      {player.id === session.playerId && (
                        <span className="ml-auto rounded-full bg-white px-3 py-1 text-xs font-black text-violet-700">
                          Du
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-bold text-slate-400">
                      Freier Platz
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 rounded-[22px] bg-slate-50 p-5">
          {roomPlayers.length < 2 ? (
            <p className="text-center font-bold text-slate-600">
              Mindestens zwei Spieler werden benötigt.
            </p>
          ) : isHost ? (
            <p className="text-center font-bold text-green-700">
              Ihr könnt das Spiel starten.
            </p>
          ) : (
            <p className="text-center font-bold text-slate-600">
              Warte, bis der Host das Spiel startet.
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void onLeaveRoom()}
            className="min-h-14 rounded-2xl border-2 border-slate-300 bg-white px-5 font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Raum verlassen
          </button>

          {isHost && (
            <button
              type="button"
              disabled={!canStart || busy}
              onClick={() => void onStartGame()}
              className="min-h-14 rounded-2xl bg-violet-600 px-5 font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {busy
                ? "Bitte warten …"
                : "Spiel starten"}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}