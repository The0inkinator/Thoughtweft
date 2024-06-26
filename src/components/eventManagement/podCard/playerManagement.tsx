import {
  Event,
  MatchData,
  Player,
  PlayerUpdateParam,
} from "~/typing/eventTypes";

export function PairPlayers(eventData: Event, podId: number) {
  const pod = eventData.evtPods.find((pod) => pod.podId === podId)!;
  const round = pod.currentRound;
  const halfTable = Math.ceil(pod.podSize / 2);
  const newMatches: MatchData[] = [];
  const currentMatches = eventData.evtPods.find(
    (pod) => pod.podId === podId
  )?.podMatches;

  const byePlayer: Player = {
    id: -1,
    name: "Bye",
    podId: podId,
    seat: -1,
    dragging: false,
  };

  const pairCrossPod = () => {
    // if (pod.podSize % 2 === 0) {
    // Pod size Even
    // pod.podSeats.map((seat) => {
    //   if (seat.seatNumber <= halfTable) {
    //     const player1 = eventData.evtPlayerList.find(
    //       (player) =>
    //         player.podId === podId && player.seat === seat.seatNumber
    //     );
    //     const player2 = eventData.evtPlayerList.find(
    //       (player) =>
    //         player.podId === podId &&
    //         player.seat === seat.seatNumber + halfTable
    //     );
    //     const newMatch: MatchData = {
    //       matchPodId: podId,
    //       matchRound: round!,
    //       matchId: currentMatches?.length
    //         ? currentMatches.length
    //         : 0 + newMatches.length + 1,
    //       player1Id: player1!.id,
    //       player1Seat: seat.seatNumber,
    //       player2Id: player2!.id,
    //       matchRecord: { p1: 0, p2: 0 },
    //       player2Seat: seat.seatNumber + halfTable,
    //       matchCompleted: false,
    //     };

    //     newMatches.push(newMatch);
    //   }
    // });
    pod.podSeats.map((seat) => {
      if (seat.seatNumber <= halfTable) {
        const player1: () => Player = () => {
          const playerData = eventData.evtPlayerList.find(
            (player) =>
              player.podId === podId && player.seat === seat.seatNumber
          );
          if (playerData) {
            return playerData;
          } else {
            return byePlayer;
          }
        };
        const player2: () => Player = () => {
          const playerData = eventData.evtPlayerList.find(
            (player) =>
              player.podId === podId &&
              player.seat === seat.seatNumber + halfTable
          );

          if (playerData) {
            return playerData;
          } else {
            return byePlayer;
          }
        };
        const newMatch: MatchData = {
          matchPodId: podId,
          matchRound: round!,
          matchRecord: { p1: 0, p2: 0 },
          matchId: currentMatches?.length
            ? currentMatches.length
            : 0 + newMatches.length + 1,
          player1Id: player1().id,
          player1Seat: seat.seatNumber,
          player2Id: player2().id,
          player2Seat: seat.seatNumber + halfTable,
          matchCompleted: false,
        };

        newMatches.push(newMatch);
      }
    });
  };
  const pairOnRecord = () => {};

  if (round === 1) {
    pairCrossPod();
  } else {
    pairOnRecord();
  }

  return newMatches;
}
