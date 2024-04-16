export type Record = [number, number, number];

export type PodSizes = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type SeatUpdateParam = HTMLDivElement | boolean;

export type PlayerUpdateOptions =
  | "id"
  | "name"
  | "pod"
  | "seat"
  | "seatHovered";

export type Player = {
  id: number;
  name: string;
  pod: number;
  seat: number;
  dragging: boolean;
  matchRecord?: Record;
  eventRecord?: Record;
};

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
  podName?: string;
  podCube?: URL;
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
  playerHopper?: HTMLElement;
};
