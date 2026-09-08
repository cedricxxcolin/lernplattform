import { useMemo, useState } from "react";

const AVATARS = [
  "😀", "😃", "😄", "😁", "😆", "😂",
  "😊", "🙂", "🙃", "😉", "😍", "🥰",
  "😘", "😋", "😜", "🤪", "🤨", "🧐",
  "🤓", "😎", "🥳", "🤠", "😏", "😬",
  "🤯", "🥶", "😱", "😈", "👻", "💀",
  "👽", "🤖", "🎃", "😺", "😸", "😹",
  "🙈", "🙉", "🙊", "🐵", "🦊", "🦁",
  "🐯", "🐱", "🐶", "🐺", "🐻", "🐼",
  "🐨", "🐸", "🐧", "🐦", "🦄", "🐝",
  "🦋", "🐙", "🦖", "🐲", "🌞", "🌝",
  "⭐", "🔥", "⚡", "🍀", "🍕", "🍔",
  "🍟", "🍩", "🍉", "🥑", "⚽", "🏀",
  "🎮", "🎸", "🚀", "🏎️", "👑", "💎",
  "🧠", "⚖️", "🦉", "🦝", "🦦", "🦥",
  "🐬", "🦈", "🐳", "🦅", "🍓", "🍒",
  "🌵", "🌈", "☀️", "🌙", "🎯", "🎲",
];

const AVATARS_PER_PAGE = 18;

interface HomeProps {
  busy: boolean;
  error: string | null;
  onRegister: (name: string, avatar: string) => Promise<void>;
}

export default function Home({
  busy,
  error,
  onRegister,
}: HomeProps) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(
    AVATARS.length / AVATARS_PER_PAGE,
  );

  const visibleAvatars = useMemo(() => {
    const start = page * AVATARS_PER_PAGE;

    return AVATARS.slice(
      start,
      start + AVATARS_PER_PAGE,
    );
  }, [page]);

  async function submit() {
    const trimmedName = name.trim();

    if (!trimmedName || busy) {
      return;
    }

    await onRegister(trimmedName, avatar);
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <section className="mx-auto grid max-w-4xl gap-6 rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-xl sm:p-8">
        <div>
          <span className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-700">
            ⚖️ Law Bluff
          </span>

          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">
            Wer blufft heute?
          </h1>

          <p className="mt-3 max-w-2xl text-lg leading-7 text-slate-600">
            Gib deinen Namen ein und wähle einen Avatar.
            Danach gelangst du zu den acht Spielräumen.
          </p>
        </div>

        <label className="grid gap-2 font-black">
          Name

          <input
            value={name}
            maxLength={30}
            autoComplete="off"
            placeholder="Zum Beispiel Mia"
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void submit();
              }
            }}
            className="min-h-14 rounded-2xl border-2 border-slate-200 bg-white px-4 outline-none transition focus:border-violet-500"
          />
        </label>

        <div>
          <p className="mb-3 font-black">
            Avatar auswählen
          </p>

          <div className="rounded-[22px] bg-slate-50 p-4">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {visibleAvatars.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-label={`Avatar ${item} auswählen`}
                  onClick={() => setAvatar(item)}
                  className={[
                    "grid aspect-square place-items-center rounded-2xl border-2 bg-white text-3xl transition hover:scale-105",
                    avatar === item
                      ? "scale-105 border-violet-600 bg-violet-100"
                      : "border-transparent",
                  ].join(" ")}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((value) => value - 1)}
                className="grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white text-xl font-black disabled:opacity-30"
              >
                ‹
              </button>

              <span className="min-w-20 text-center text-sm font-black text-slate-500">
                {page + 1} / {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((value) => value + 1)}
                className="grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white text-xl font-black disabled:opacity-30"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-100 px-4 py-3 font-bold text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={!name.trim() || busy}
          onClick={() => void submit()}
          className="min-h-14 rounded-2xl bg-violet-600 px-6 text-lg font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Spieler wird angelegt …" : "Spieler anlegen"}
        </button>
      </section>
    </main>
  );
}