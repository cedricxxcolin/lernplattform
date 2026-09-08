import {
  type ReactNode,
  useCallback,
  useState,
} from "react";

import BluffPhase from "./components/BluffPhase";
import CategorySelection from "./components/CategorySelection";
import Home from "./components/Home";
import Podium, {
  type PodiumData,
} from "./components/Podium";
import ResetPlayerButton from "./components/ResetPlayerButton";
import ResultScreen from "./components/ResultScreen";
import RoomLobby from "./components/RoomLobby";
import RoomOverview from "./components/RoomOverview";
import Scoreboard from "./components/Scoreboard";
import VotePhase from "./components/VotePhase";

import { useLawLobby } from "./hooks/useLawLobby";
import { useLawState } from "./hooks/useLawState";
import { supabase } from "./lib/supabase";

import type { RegisteredSession } from "./types/law";

const SESSION_KEY = "lawBluffOnlineSessionV1";

export default function App() {
  const [session, setSession] =
    useState<RegisteredSession | null>(() => {
      try {
        const saved = localStorage.getItem(SESSION_KEY);

        return saved
          ? (JSON.parse(saved) as RegisteredSession)
          : null;
      } catch {
        return null;
      }
    });

  const [busy, setBusy] = useState(false);

  const [busyRoomId, setBusyRoomId] =
    useState<number | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const {
    rooms,
    players,
    categories,
    loading: lobbyLoading,
    error: lobbyError,
    reload: reloadLobby,
  } = useLawLobby();

  const {
    state,
    loading: stateLoading,
    error: stateError,
    reload: reloadState,
  } = useLawState(session);

  function messageFromError(
    caughtError: unknown,
    fallback: string,
  ): string {
    return caughtError instanceof Error
      ? caughtError.message
      : fallback;
  }

  async function runAction(
    action: () => Promise<void>,
    fallbackMessage: string,
  ): Promise<void> {
    setBusy(true);
    setError(null);

    try {
      await action();

      await Promise.all([
        reloadLobby(),
        reloadState(),
      ]);
    } catch (caughtError) {
      setError(
        messageFromError(
          caughtError,
          fallbackMessage,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function registerPlayer(
    name: string,
    avatar: string,
  ): Promise<void> {
    setBusy(true);
    setError(null);

    try {
      const { data, error: rpcError } =
        await supabase.rpc(
          "law_register_player",
          {
            p_name: name,
            p_avatar: avatar,
          },
        );

      if (rpcError) {
        throw rpcError;
      }

      const result = Array.isArray(data)
        ? data[0]
        : data;

      if (
        !result?.player_id ||
        !result?.player_token
      ) {
        throw new Error(
          "Supabase hat keine gültige Spielersitzung zurückgegeben.",
        );
      }

      const newSession: RegisteredSession = {
        playerId: result.player_id,
        playerToken: result.player_token,
      };

      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(newSession),
      );

      setSession(newSession);
    } catch (caughtError) {
      setError(
        messageFromError(
          caughtError,
          "Der Spieler konnte nicht angelegt werden.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom(
    roomId: number,
  ): Promise<void> {
    if (!session) {
      return;
    }

    setBusyRoomId(roomId);

    await runAction(
      async () => {
        const { error: rpcError } =
          await supabase.rpc(
            "law_join_room",
            {
              p_player_token:
                session.playerToken,
              p_room_id: roomId,
            },
          );

        if (rpcError) {
          throw rpcError;
        }
      },
      "Der Raum konnte nicht betreten werden.",
    );

    setBusyRoomId(null);
  }

  async function leaveRoom(): Promise<void> {
    if (!session) {
      return;
    }

    const confirmed = window.confirm(
      "Möchtest du den Raum oder das laufende Spiel wirklich verlassen?",
    );

    if (!confirmed) {
      return;
    }

    await runAction(
      async () => {
        const { error: rpcError } =
          await supabase.rpc(
            "law_leave_room",
            {
              p_player_token:
                session.playerToken,
            },
          );

        if (rpcError) {
          throw rpcError;
        }
      },
      "Der Raum konnte nicht verlassen werden.",
    );
  }

  async function startGame(): Promise<void> {
    if (!session) {
      return;
    }

    await runAction(
      async () => {
        const { error: rpcError } =
          await supabase.rpc(
            "law_start_category_selection",
            {
              p_player_token:
                session.playerToken,
            },
          );

        if (rpcError) {
          throw rpcError;
        }
      },
      "Das Spiel konnte nicht gestartet werden.",
    );
  }

  async function chooseCategory(
    categoryId: string,
  ): Promise<void> {
    if (!session) {
      return;
    }

    await runAction(
      async () => {
        const { error: rpcError } =
          await supabase.rpc(
            "law_choose_category",
            {
              p_player_token:
                session.playerToken,
              p_category_id: categoryId,
            },
          );

        if (rpcError) {
          throw rpcError;
        }
      },
      "Die Kategorie konnte nicht gewählt werden.",
    );
  }

  async function submitBluff(
    answer: string,
  ): Promise<void> {
    if (!session) {
      return;
    }

    const invalidBluffMessage =
      "Diese Antwort kann nicht verwendet werden, da sie entweder bereits von einer anderen Person eingegeben wurde oder der richtigen Lösung entspricht. Bitte gib eine andere Bluff-Antwort ein.";

    await runAction(
      async () => {
        const { error: rpcError } =
          await supabase.rpc(
            "law_submit_bluff",
            {
              p_player_token:
                session.playerToken,
              p_answer: answer,
            },
          );

        if (rpcError) {
          throw new Error(invalidBluffMessage);
        }
      },
      invalidBluffMessage,
    );
  }

  async function castVote(
    optionId: string,
  ): Promise<void> {
    if (!session) {
      return;
    }

    await runAction(
      async () => {
        const { error: rpcError } =
          await supabase.rpc(
            "law_cast_vote",
            {
              p_player_token:
                session.playerToken,
              p_answer_option_id:
                optionId,
            },
          );

        if (rpcError) {
          throw rpcError;
        }
      },
      "Die Stimme konnte nicht gespeichert werden.",
    );
  }

  async function readyNextRound(): Promise<void> {
    if (!session) {
      return;
    }

    await runAction(
      async () => {
        const { error: rpcError } =
          await supabase.rpc(
            "law_ready_next_round",
            {
              p_player_token:
                session.playerToken,
            },
          );

        if (rpcError) {
          throw rpcError;
        }
      },
      "Die Bereitschaft konnte nicht gespeichert werden.",
    );
  }

  async function abortGame(): Promise<void> {
    if (!session) {
      return;
    }

    const confirmed = window.confirm(
      "Willst du das ganze Spiel wirklich abbrechen? Der Raum wird vollständig geleert.",
    );

    if (!confirmed) {
      return;
    }

    await runAction(
      async () => {
        const { error: rpcError } =
          await supabase.rpc(
            "law_abort_game",
            {
              p_player_token:
                session.playerToken,
            },
          );

        if (rpcError) {
          throw rpcError;
        }
      },
      "Das Spiel konnte nicht abgebrochen werden.",
    );
  }

  async function openPodium(): Promise<void> {
    if (!session) {
      return;
    }

    await runAction(
      async () => {
        const { error: rpcError } =
          await supabase.rpc(
            "law_open_podium",
            {
              p_player_token:
                session.playerToken,
            },
          );

        if (rpcError) {
          throw rpcError;
        }
      },
      "Die Endrangliste konnte nicht geöffnet werden.",
    );
  }

  async function leavePodium(): Promise<void> {
    if (!session) {
      return;
    }

    await runAction(
      async () => {
        const { error: rpcError } =
          await supabase.rpc(
            "law_leave_podium",
            {
              p_player_token:
                session.playerToken,
            },
          );

        if (rpcError) {
          throw rpcError;
        }
      },
      "Das Podest konnte nicht verlassen werden.",
    );
  }

  async function resetPlayer(): Promise<void> {
    if (!session) {
      return;
    }

    const confirmed = window.confirm(
      "Wirklich komplett zurücksetzen? Du verlässt den Raum und musst Name sowie Avatar neu eingeben.",
    );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const { error: rpcError } =
        await supabase.rpc(
          "law_reset_player",
          {
            p_player_token:
              session.playerToken,
          },
        );

      if (rpcError) {
        throw rpcError;
      }

      localStorage.removeItem(SESSION_KEY);

      setSession(null);
    } catch (caughtError) {
      setError(
        messageFromError(
          caughtError,
          "Der Spieler konnte nicht vollständig zurückgesetzt werden.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  const finishResult = useCallback(
    async (): Promise<void> => {
      await reloadState();
    },
    [reloadState],
  );

  function withResetButton(
    content: ReactNode,
  ): ReactNode {
    return (
      <>
        {content}

        <ResetPlayerButton
          busy={busy}
          onReset={resetPlayer}
        />
      </>
    );
  }

  const combinedError =
    error ?? stateError ?? lobbyError;

  if (!session) {
    return (
      <Home
        busy={busy}
        error={error}
        onRegister={registerPlayer}
      />
    );
  }

  if (stateLoading && !state) {
    return withResetButton(
      <main className="min-h-screen p-6">
        <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
          <p className="font-bold text-slate-600">
            Spielzustand wird geladen …
          </p>
        </section>
      </main>,
    );
  }

  if (state?.podium) {
    return withResetButton(
      <Podium
        podium={
          state.podium as PodiumData
        }
        busy={busy}
        onLeavePodium={leavePodium}
      />,
    );
  }

  if (
    state?.game?.phase ===
      "choosing_category" &&
    state.room
  ) {
    return withResetButton(
      <CategorySelection
        session={session}
        state={state}
        categories={categories}
        busy={busy}
        error={combinedError}
        onChooseCategory={chooseCategory}
        onAbortGame={abortGame}
      />,
    );
  }

  const selectedCategory =
    state?.game?.categoryId
      ? categories.find(
          (category) =>
            category.id ===
            state.game?.categoryId,
        ) ?? null
      : null;

  if (
    state?.game?.phase === "bluff" &&
    state.room &&
    state.question
  ) {
    return withResetButton(
      <BluffPhase
        session={session}
        state={state}
        category={selectedCategory}
        busy={busy}
        error={combinedError}
        onSubmitBluff={submitBluff}
        onLeaveRound={leaveRoom}
        onAbortGame={abortGame}
      />,
    );
  }

  if (
    state?.game?.phase === "vote" &&
    state.room &&
    state.question
  ) {
    return withResetButton(
      <VotePhase
        session={session}
        state={state}
        category={selectedCategory}
        busy={busy}
        error={combinedError}
        onVote={castVote}
        onLeaveRound={leaveRoom}
        onAbortGame={abortGame}
      />,
    );
  }

  if (
    state?.game?.phase === "result" &&
    state.myResult
  ) {
    return withResetButton(
      <ResultScreen
        state={state}
        onResultFinished={finishResult}
      />,
    );
  }

  if (
    state?.game?.phase ===
      "scoreboard" &&
    state.question
  ) {
    return withResetButton(
      <Scoreboard
        session={session}
        state={state}
        category={selectedCategory}
        busy={busy}
        error={combinedError}
        onReady={readyNextRound}
        onOpenPodium={openPodium}
        onLeaveRound={leaveRoom}
        onAbortGame={abortGame}
      />,
    );
  }

  const currentPlayer =
    players.find(
      (player) =>
        player.id ===
        session.playerId,
    ) ?? null;

  const currentRoom =
    currentPlayer?.room_id != null
      ? rooms.find(
          (room) =>
            room.id ===
            currentPlayer.room_id,
        ) ?? null
      : null;

  if (
    currentPlayer?.room_id &&
    currentRoom
  ) {
    return withResetButton(
      <RoomLobby
        session={session}
        room={currentRoom}
        players={players}
        busy={busy}
        error={combinedError}
        onLeaveRoom={leaveRoom}
        onStartGame={startGame}
      />,
    );
  }

  return withResetButton(
    <RoomOverview
      session={session}
      rooms={rooms}
      players={players}
      loading={lobbyLoading}
      error={combinedError}
      busyRoomId={busyRoomId}
      onJoinRoom={joinRoom}
    />,
  );
}