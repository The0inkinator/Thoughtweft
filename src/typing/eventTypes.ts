import { Match } from "solid-js";

export type PodSizes = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type SeatUpdateParam =
  | { ref: HTMLDivElement }
  | { filled: boolean }
  | { hovered: boolean };

export type PlayerUpdateParam =
  | { address: { podId: number; seat: number } }
  | { drag: boolean }
  | { elMounted: boolean };

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
  | { byePlayer: number };

export type MatchUpdateParam =
  | { winner: MatchData["winner"] }
  | { matchRecord: { p1: number; p2: number } };

export type Player = {
  id: number;
  name: string;
  podId: number;
  seat: number;
  dragging: boolean;
  elMounted?: boolean;
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
  playerRecord: number;
  matchWinner: MatchData["winner"];
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
};
