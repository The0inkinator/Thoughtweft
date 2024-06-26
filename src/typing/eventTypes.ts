import { Match } from "solid-js";

export type Record = [number, number, number];

export type MatchRecord = { p1: number; p2: number; draw?: boolean };

export type PodSizes = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type SeatUpdateParam =
  | { ref: HTMLDivElement }
  | { filled: boolean }
  | { hovered: boolean };

export type PlayerUpdateParam =
  | { address: { podId: number; seat: number } }
  | { drag: boolean };

export type PodStatusModes =
  | "seating"
  | "drafting"
  | "playing"
  | "pairing"
  | "finished";

export type PodUpdateParam =
  | { status: PodStatusModes }
  | { round: number }
  | { newMatch: MatchData };

export type MatchUpdateParam =
  | { matchCompleted: boolean }
  | { matchRecord: MatchRecord };

export type Player = {
  id: number;
  name: string;
  podId: number;
  seat: number;
  dragging: boolean;
  matchRecord?: Record;
  eventRecord?: Record;
  currentOpponentId?: number;
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
};

export type MatchData = {
  matchPodId: number;
  matchRound: number;
  matchId: number;
  matchRecord: MatchRecord;
  player1Id: number;
  player1Seat: number;
  player2Id: number;
  player2Seat: number;
  matchCompleted: boolean;
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
