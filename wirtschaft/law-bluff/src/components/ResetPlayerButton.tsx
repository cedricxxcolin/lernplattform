interface ResetPlayerButtonProps {
  busy: boolean;
  onReset: () => Promise<void>;
}

export default function ResetPlayerButton({
  busy,
  onReset,
}: ResetPlayerButtonProps) {
  return (
    <div className="mx-auto mt-6 w-full max-w-5xl px-4 pb-8 sm:px-6">
      <button
        type="button"
        disabled={busy}
        onClick={() => void onReset()}
        className="
          w-full min-h-12
          rounded-2xl
          border-2 border-red-200
          bg-white
          px-5
          font-black
          text-red-600
          shadow-sm
          transition
          hover:bg-red-50
          disabled:opacity-40
        "
      >
        ↺ Komplett zurücksetzen
      </button>
    </div>
  );
}