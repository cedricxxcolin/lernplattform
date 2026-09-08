import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import type {
  LawGameState,
  RegisteredSession,
} from "../types/law";

interface UseLawStateResult {
  state: LawGameState | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useLawState(
  session: RegisteredSession | null,
): UseLawStateResult {
  const [state, setState] =
    useState<LawGameState | null>(null);

  const [loading, setLoading] =
    useState<boolean>(Boolean(session));

  const [error, setError] =
    useState<string | null>(null);

  const requestRunning = useRef(false);

  const reload = useCallback(async (): Promise<void> => {
    if (!session || requestRunning.current) {
      return;
    }

    requestRunning.current = true;

    try {
      const { data, error: rpcError } =
        await supabase.rpc("law_get_state", {
          p_player_token: session.playerToken,
        });

      if (rpcError) {
        throw rpcError;
      }

      setState(data as LawGameState);
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Der Spielzustand konnte nicht geladen werden.",
      );
    } finally {
      requestRunning.current = false;
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!session) {
      setState(null);
      setLoading(false);
      return;
    }

    void reload();

    const channel = supabase
      .channel(`law-state-${session.playerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "law_rooms",
        },
        () => {
          void reload();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "law_players",
        },
        () => {
          void reload();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "law_games",
        },
        () => {
          void reload();
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          setError(
            "Die Live-Verbindung zum Spiel wurde unterbrochen.",
          );
        }
      });

    const heartbeat = window.setInterval(() => {
      void supabase.rpc("law_touch_player", {
        p_player_token: session.playerToken,
      });
    }, 20_000);

    return () => {
      window.clearInterval(heartbeat);
      void supabase.removeChannel(channel);
    };
  }, [reload, session]);

  return {
    state,
    loading,
    error,
    reload,
  };
}