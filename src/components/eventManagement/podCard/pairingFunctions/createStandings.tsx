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
  const pod = eventData.evtPods.find((pod) => pod.podId === podId)!;
  const podPlayers = eventData.evtPlayerList.filter(
    (player) => player.podId === podId
  )!;
  const matches = pod.podMatches;

  const tempStandings: Standings = [];

  podPlayers.map((player) => {
    let pointTotal: number = 0;
    let finalRecord: PlayerStanding["record"] = { w: 0, l: 0, d: 0 };
    let omwCalc: number = 0;
    let gwCalc: number = 0;
    let ogwCalc: number = 0;

    matches.filter((match) => match);

    const standingEntry: PlayerStanding = {
      rank: 0,
      name: player.name,
      points: pointTotal,
      record: finalRecord,
      omw: omwCalc,
      gw: gwCalc,
      ogw: ogwCalc,
    };

    tempStandings.push(standingEntry);
  });

  const finalStandings = tempStandings.sort((a, b) => b.rank - a.rank);

  return finalStandings;
}
