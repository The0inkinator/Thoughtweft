import { Match, Owner } from "solid-js";

export type PodSizes = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type SeatUpdateParam =
  | { ref: HTMLDivElement }
  | { filled: boolean }
  | { hovered: boolean };

export type PlayerUpdateParam =
  | { address: { podId: number; seat: number } }
  | { fullPodRecord: PodRecord }
  | {
      matchRecord: {
        podId: number;
        result: { w: number } | { l: number } | { d: number };
      };
    }
  | { lastEvent: MouseEvent | TouchEvent }
  | { lastSeat: { podId: number; seat: number } }
  | { lastLoc: { x: number; y: number } }
  | { currentRef: HTMLDivElement }
  | { menuOpen: boolean }
  | { name: string };

export type PodStatusModes =
  | "seating"
  | "drafting"
  | "playing"
  | "pairing"
  | "finished";

export type PodUpdateParam =
  | { status: PodStatusModes }
  | { round: number }
  | { newMatch: MatchData }
  | { hovered: boolean }
  | { byePlayer: number }
  | { ref: HTMLDivElement }
  | { menuOpen: boolean }
  | { overlayOpen: boolean }
  | { podOwner: Owner };

export type MatchUpdateParam =
  | { winner: MatchData["winner"] }
  | { matchRecord: { p1: number; p2: number } };

export type EventUpdateParam = { evtLoading: boolean } | { owner: any };

export type Player = {
  id: number;
  name: string;
  podId: number;
  seat: number;
  podRecords: PodRecord[];
  lastEvent?: MouseEvent | TouchEvent;
  lastSeat?: { podId: number; seat: number };
  lastLoc?: { x: number; y: number };
  currentRef?: HTMLDivElement;
  menuOpen?: boolean;
};

export type PodRecord = {
  podId: number;
  w: number;
  l: number;
  d: number;
};

export type PlayerRecord = {
  pId: number;
  pWins: number;
  pGameWins?: number;
  pLosses: number;
  pGameLosses?: number;
  pDraws: number;
};

export interface SeatAddress {
  podId: number;
  seat: number;
}

export type FullSeat = {
  podId: number;
  seatNumber: number;
  filled: boolean;
  hovered: boolean;
  seatRef?: HTMLDivElement;
  byeSeat?: boolean;
};

export type ProxySeat = {
  podId: number;
  seatNumber: number;
};

export type Pod = {
  podId: number;
  podNumber: number;
  podSize: PodSizes;
  podSeats: FullSeat[];
  podStatus: PodStatusModes;
  podRounds: number;
  podDraftTime: number;
  podRoundTime: number;
  podMatches: MatchData[];
  currentRound?: number;
  podName?: string;
  podCube?: URL;
  byePlayerIds?: number[];
  podRef?: HTMLDivElement;
  podHovered?: boolean;
  menuOpen?: boolean;
  overlayOpen?: boolean;
  podOwner?: Owner;
};

export type MatchData = {
  matchPodId: number;
  matchRound: number;
  matchId: number;
  p1Id: number;
  p1Seat: number;
  p1Score: number;
  p2Id: number;
  p2Seat: number;
  p2Score: number;
  winner?: "p1" | "p2" | "draw";
  byeMatch?: boolean;
};

export type MatchRecord = {
  matchId: number;
  playerId: number;
  gamesWon: number;
  gamesPlayed?: number;
  matchResult: "w" | "l" | "d";
};

export type EventSettings = {
  playerCap: number;
};

export type Event = {
  evtPods: Pod[];
  evtSeats: ProxySeat[];
  evtPlayerList: Player[];
  evtSettings: EventSettings;
  nextPodId: number;
  evtStage: "seating" | "staging" | number;
  evtLoading: boolean;
  playerHopper?: HTMLDivElement;
  nextPlayerId: number;
};

export type SafePod = Omit<Pod, "podOwner">;

export type SafeEvent = Omit<Event, "evtPodOwners"> & {
  evtPods: SafePod[];
};
