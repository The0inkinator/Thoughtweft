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

export default function CreateStandings(eventData: Event, podId: number) {
  const finalStandings: Standings = [];

  const sampleEntry: PlayerStanding = {
    rank: 1,
    name: "Sally",
    points: 12,
    record: { w: 4, l: 1, d: 0 },
    omw: 90,
    gw: 95,
    ogw: 65,
  };

  finalStandings.push(sampleEntry);
  return finalStandings;
}
