export type RoomStatus =
  | "open"
  | "choosing_category"
  | "running";

export type GamePhase =
  | "choosing_category"
  | "bluff"
  | "vote"
  | "result"
  | "scoreboard";

export interface RegisteredSession {
  playerId: string;
  playerToken: string;
}

export interface LawRoom {
  id: number;
  status: RoomStatus;
  host_player_id: string | null;
  updated_at: string;
}

export interface LawPlayer {
  id: string;
  name: string;
  avatar: string;
  room_id: number | null;
  points: number;
  round_points: number;
  joined_room_at: string | null;
  created_at: string;
  last_seen_at: string;
}

export interface LawCategory {
  id: string;
  icon: string;
  name: string;
  description: string;
  active: boolean;
  sort_order: number;
}

export interface CurrentPlayer {
  id: string;
  name: string;
  avatar: string;
  points: number;
  roundPoints: number;
  roomId: number | null;
  isHost?: boolean;
}

export interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  points: number;
  roundPoints: number;
  isHost: boolean;
}

export interface CurrentGame {
  id: string;
  categoryId: string | null;
  phase: GamePhase;
  roundNumber: number;
  questionPosition: number;
  totalRounds: number;
  resultStartedAt: string | null;
  isFinalRound: boolean;
}

export interface CurrentQuestion {
  id: string;
  categoryId: string;
  question: string;
  difficulty: number;
  correctAnswer?: string;
  explanation?: string;
  details?: string;
}

export interface AnswerVoter {
  id: string;
  name: string;
  avatar: string;
}

export interface AnswerOption {
  id: string;
  text: string;
  sortOrder: number;
  isOwnBluff: boolean;
  isCorrect?: boolean;
  ownerName?: string;
  ownerAvatar?: string;
  voters: AnswerVoter[];
}

export interface PlayerResult {
  correct: boolean;
  message: string;
  points: number;
}

export interface LawGameState {
  player: CurrentPlayer;
  podium: unknown | null;

  room: {
    id: number;
    status: RoomStatus;
    hostPlayerId: string | null;
  } | null;

  players: RoomPlayer[];
  game: CurrentGame | null;
  question: CurrentQuestion | null;
  answerOptions: AnswerOption[];

  myVoteOptionId: string | null;
  myResult: PlayerResult | null;
  myBluff: string | null;

  counts: {
    players: number;
    bluffs: number;
    votes: number;
    ready: number;
  };

  hasSubmittedBluff: boolean;
  hasVoted: boolean;
  isReady: boolean;
}