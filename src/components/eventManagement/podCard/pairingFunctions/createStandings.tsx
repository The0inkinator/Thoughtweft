import {
  Event,
  MatchData,
  MatchRecord,
  PlayerRecord,
} from "~/typing/eventTypes";

type PlayerStanding = {
  rank: number;
  name: string;
  points: number;
  record: { w: number; l: number; d: number };
  omw: number;
  gw: number;
  ogw: number;
};

type Standings = PlayerStanding[];

export default function CreateStandings(
  eventData: DataTransfer,
  podId: number
) {}
