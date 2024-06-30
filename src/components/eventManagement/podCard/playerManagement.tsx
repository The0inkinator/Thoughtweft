import {
  Event,
  MatchData,
  MatchRecord,
  Player,
  PlayerUpdateParam,
} from "~/typing/eventTypes";

export function PairPlayers(eventData: Event, podId: number) {
  const pod = eventData.evtPods.find((pod) => pod.podId === podId)!;
  const round = pod.currentRound;
  const halfTable = Math.ceil(pod.podSize / 2);
  const newMatches: MatchData[] = [];
  const allPodMatches = eventData.evtPods.find(
    (pod) => pod.podId === podId
  )?.podMatches;

  const generateRecordSheet: () => MatchRecord[] = () => {
    const tempRecordSheet: MatchRecord[] = [];

    eventData.evtPlayerList
      .filter((player) => player.podId === podId)
      .map((playerInPod) => {
        pod.podMatches.forEach((match) => {
          for (const [key, value] of Object.entries(match)) {
            if (
              (value === playerInPod.id && key === "p1Id") ||
              key === "p2Id"
            ) {
              const convertWinData = (
                playerNum: 1 | 2,
                data: MatchData["winner"]
              ) => {
                if (data === "draw") {
                  return "d";
                } else if (
                  (playerNum === 1 && data === "p1") ||
                  (playerNum === 2 && data === "p2")
                ) {
                  return "w";
                } else {
                  return "l";
                }
              };

              const tempEntry1: MatchRecord = {
                matchId: match.matchId,
                playerId: match.p1Id,
                playerRecord: match.p1Score,
                matchResult: convertWinData(1, match.winner),
              };

              const tempEntry2: MatchRecord = {
                matchId: match.matchId,
                playerId: match.p2Id,
                playerRecord: match.p2Score,
                matchResult: convertWinData(2, match.winner),
              };

              if (
                match.p1Id === playerInPod.id &&
                !tempRecordSheet.some(
                  (entry) =>
                    entry.matchId === tempEntry1.matchId &&
                    entry.playerId === tempEntry1.playerId
                )
              ) {
                tempRecordSheet.push(tempEntry1);
              }

              if (
                match.p2Id === playerInPod.id &&
                !tempRecordSheet.some(
                  (entry) =>
                    entry.matchId === tempEntry2.matchId &&
                    entry.playerId === tempEntry2.playerId
                )
              ) {
                tempRecordSheet.push(tempEntry2);
              }
            }
          }
        });
      });

    return tempRecordSheet;
  };

  const pairCrossPod = () => {
    pod.podSeats.map((seat) => {
      if (seat.seatNumber <= halfTable) {
        const stockMatchData = {
          matchPodId: podId,
          matchRound: round!,
          matchId: allPodMatches?.length
            ? allPodMatches.length
            : 0 + newMatches.length + 1,
          p1Seat: seat.seatNumber,
          p1Score: 0,
          p2Seat: seat.seatNumber + halfTable,
          p2Score: 0,
        };

        const player1HasOpponent = () => {
          const opponentSeat = pod.podSeats.find(
            (localSeat) => localSeat.seatNumber === seat.seatNumber + halfTable
          );
          if (opponentSeat && opponentSeat.filled) {
            return true;
          } else {
            return false;
          }
        };

        if (player1HasOpponent()) {
          const player1 = eventData.evtPlayerList.find(
            (player) =>
              player.podId === podId && player.seat === seat.seatNumber
          );

          const player2 = eventData.evtPlayerList.find(
            (player) =>
              player.podId === podId &&
              player.seat === seat.seatNumber + halfTable
          );

          if (player1 && player2) {
            const newMatch: MatchData = {
              ...stockMatchData,
              p1Id: player1.id,
              p2Id: player2.id,
            };

            newMatches.push(newMatch);
          }
        } else {
          const player1 = eventData.evtPlayerList.find(
            (player) =>
              player.podId === podId && player.seat === seat.seatNumber
          );
          if (player1) {
            const newMatch: MatchData = {
              ...stockMatchData,
              p1Id: player1.id,
              p1Score: 2,
              p2Id: -1,
              p2Score: 0,
              byeMatch: true,
              winner: "p1",
            };

            newMatches.push(newMatch);
          }
        }
      }
    });
  };

  const pairOnRecord = () => {
    const recordSheet = generateRecordSheet();
    console.log(recordSheet);
  };

  if (round === 1) {
    pairCrossPod();
  } else {
    pairOnRecord();
  }

  return newMatches;
}
