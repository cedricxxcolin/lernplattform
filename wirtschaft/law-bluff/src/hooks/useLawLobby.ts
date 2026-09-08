import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type {
  LawCategory,
  LawPlayer,
  LawRoom,
} from "../types/law";

interface UseLawLobbyResult {
  rooms: LawRoom[];
  players: LawPlayer[];
  categories: LawCategory[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useLawLobby(): UseLawLobbyResult {
  const [rooms, setRooms] = useState<LawRoom[]>([]);
  const [players, setPlayers] = useState<LawPlayer[]>([]);
  const [categories, setCategories] =
    useState<LawCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    try {
      const [
        roomsResponse,
        playersResponse,
        categoriesResponse,
      ] = await Promise.all([
        supabase
          .from("law_rooms")
          .select("*")
          .order("id", { ascending: true }),

        supabase
          .from("law_players")
          .select("*")
          .not("room_id", "is", null)
          .order("joined_room_at", { ascending: true }),

        supabase
          .from("law_categories")
          .select("*")
          .eq("active", true)
          .order("sort_order", { ascending: true }),
      ]);

      if (roomsResponse.error) {
        throw roomsResponse.error;
      }

      if (playersResponse.error) {
        throw playersResponse.error;
      }

      if (categoriesResponse.error) {
        throw categoriesResponse.error;
      }

      setRooms((roomsResponse.data ?? []) as LawRoom[]);

      setPlayers(
        (playersResponse.data ?? []) as LawPlayer[],
      );

      setCategories(
        (categoriesResponse.data ?? []) as LawCategory[],
      );

      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Die Lobby konnte nicht geladen werden.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();

    const channel = supabase
      .channel("law-lobby-live")
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
      .subscribe((status, subscribeError) => {
        if (status === "CHANNEL_ERROR") {
          console.error(
            "Realtime-Verbindung fehlgeschlagen:",
            subscribeError,
          );

          setError(
            "Die Live-Verbindung wurde unterbrochen.",
          );
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [reload]);

  return {
    rooms,
    players,
    categories,
    loading,
    error,
    reload,
  };
}