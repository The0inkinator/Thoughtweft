import { Event, Match } from "~/typing/eventTypes";

export default function pairPlayers(eventData: Event, podId: number) {
  const pod = eventData.evtPods.find((pod) => pod.podId === podId)!;
  const round = pod.currentRound;
  const halfTable = pod.podSize / 2;
  let table = 1;
  const newMatches: Match[] = [];

  const pairCrossPod = () => {
    if (pod.podSize % 2 === 0) {
      // Pod size Even
      pod.podSeats.map((seat) => {
        if (seat.seatNumber <= halfTable) {
          const player1 = eventData.evtPlayerList.find(
            (player) =>
              player.podId === podId && player.seat === seat.seatNumber
          );
          const player2 = eventData.evtPlayerList.find(
            (player) =>
              player.podId === podId &&
              player.seat === seat.seatNumber + halfTable
          );
          const newMatch: Match = {
            matchPodId: podId,
            matchRound: round!,
            matchTable: table,
            player1Id: player1!.id,
            player2Id: player2!.id,
            player1Record: [0, 0, 0],
            player2Record: [0, 0, 0],
            matchCompleted: false,
          };
          newMatches.push(newMatch);
        }
      });
    } else {
      // Pod Size odd
    }
  };
  const pairOnRecord = () => {};

  if (round === 1) {
    pairCrossPod();
  } else {
    pairOnRecord();
  }

  return newMatches;
}
