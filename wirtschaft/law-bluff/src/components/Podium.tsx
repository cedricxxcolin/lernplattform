import { useMemo } from "react";

interface PodiumPlayer {
  id: string;
  name: string;
  avatar: string;
  points: number;
}

export interface PodiumData {
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  createdAt: number;
  players: PodiumPlayer[];
}

interface PodiumProps {
  podium: PodiumData;
  busy: boolean;
  onLeavePodium: () => Promise<void>;
}

const CONFETTI_COLORS = [
  "#6557f5",
  "#ffc857",
  "#22b978",
  "#ec5064",
  "#49a6ff",
  "#ff8f4d",
];

export default function Podium({
  podium,
  busy,
  onLeavePodium,
}: PodiumProps) {
  const players = [...podium.players].sort(
    (first, second) =>
      second.points - first.points ||
      first.name.localeCompare(second.name),
  );

  const confetti = useMemo(
    () =>
      Array.from({ length: 70 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 4,
        color:
          CONFETTI_COLORS[
            index % CONFETTI_COLORS.length
          ],
      })),
    [],
  );

  const first = players[0];
  const second = players[1];
  const third = players[2];
  const others = players.slice(3);

  function Place({
    player,
    place,
  }: {
    player?: PodiumPlayer;
    place: 1 | 2 | 3;
  }) {
    if (!player) {
      return null;
    }

    const height =
      place === 1
        ? "h-52"
        : place === 2
          ? "h-36"
          : "h-24";

    const color =
      place === 1
        ? "from-amber-300 to-amber-500"
        : place === 2
          ? "from-slate-300 to-slate-500"
          : "from-orange-300 to-orange-600";

    return (
      <div className="grid w-[28vw] max-w-48 justify-items-center self-end">
        <div className="mb-3 grid justify-items-center text-center">
          <span className="text-[clamp(48px,10vw,84px)] leading-none drop-shadow-lg">
            {player.avatar}
          </span>

          <span className="mt-2 max-w-40 truncate text-lg font-black">
            {player.name}
          </span>

          <span className="text-sm font-bold text-slate-500">
            {player.points} Punkte
          </span>
        </div>

        <div
          className={[
            "grid w-full place-items-center rounded-t-[20px] bg-gradient-to-b text-5xl font-black text-white shadow-inner",
            height,
            color,
          ].join(" ")}
        >
          {place}
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8">
      <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="absolute -top-8 h-5 w-3 animate-[fall_linear_infinite] rounded-sm"
            style={{
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              backgroundColor: piece.color,
            }}
          />
        ))}
      </div>

      <style>
        {`
          @keyframes fall {
            from {
              transform: translateY(-40px) rotate(0deg);
            }
            to {
              transform: translateY(110vh) rotate(850deg);
            }
          }
        `}
      </style>

      <section className="relative z-10 mx-auto max-w-6xl rounded-[30px] bg-white/95 p-6 shadow-2xl sm:p-9">
        <div className="text-center">
          <span className="text-7xl">🏆</span>

          <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-7xl">
            Endrangliste
          </h1>

          <p className="mt-3 text-lg font-bold text-slate-500">
            {podium.categoryIcon ?? "⚖️"}{" "}
            {podium.categoryName}
          </p>
        </div>

        <div className="mt-10 flex min-h-[390px] items-end justify-center gap-2 sm:gap-4">
          <Place player={second} place={2} />
          <Place player={first} place={1} />
          <Place player={third} place={3} />
        </div>

        {others.length > 0 && (
          <div className="mx-auto mt-6 grid max-w-xl gap-3">
            {others.map((player, index) => (
              <div
                key={player.id}
                className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-violet-50 p-4"
              >
                <span className="text-center font-black text-slate-500">
                  {index + 4}.
                </span>

                <span className="truncate text-lg font-black">
                  {player.avatar} {player.name}
                </span>

                <span className="font-black">
                  {player.points}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => void onLeavePodium()}
          className="mx-auto mt-8 block min-h-14 rounded-2xl bg-violet-600 px-8 text-lg font-black text-white hover:bg-violet-700 disabled:opacity-40"
        >
          Zum Menü
        </button>
      </section>
    </main>
  );
}