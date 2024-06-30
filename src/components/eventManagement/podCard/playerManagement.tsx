import {
  Event,
  MatchData,
  MatchRecord,
  Player,
  PlayerRecord,
  PlayerStanding,
  PlayerUpdateParam,
} from "~/typing/eventTypes";

export function PairPlayers(eventData: Event, podId: number) {
  //Static Values
  const pod = eventData.evtPods.find((pod) => pod.podId === podId)!;
  const round = pod.currentRound;
  const halfTable = Math.ceil(pod.podSize / 2);
  const newMatches: MatchData[] = [];
  const allPodMatches = eventData.evtPods.find(
    (pod) => pod.podId === podId
  )?.podMatches;
  const podPlayers = eventData.evtPlayerList.filter(
    (player) => player.podId === podId
  );

  const generateRecordSheet: () => MatchRecord[] = () => {
    const tempRecordSheet: MatchRecord[] = [];

    podPlayers.map((playerInPod) => {
      pod.podMatches.forEach((match) => {
        for (const [key, value] of Object.entries(match)) {
          if ((value === playerInPod.id && key === "p1Id") || key === "p2Id") {
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

    const playerRecordArray: PlayerRecord[] = podPlayers.map((player) => {
      const playerWins = recordSheet.filter(
        (entry) => entry.playerId === player.id && entry.matchResult === "w"
      ).length;
      const playerLosses = recordSheet.filter(
        (entry) => entry.playerId === player.id && entry.matchResult === "l"
      ).length;
      const playerDraws = recordSheet.filter(
        (entry) => entry.playerId === player.id && entry.matchResult === "d"
      ).length;
      const playerRecordEntry: PlayerRecord = {
        pId: player.id,
        pWins: playerWins,
        pLosses: playerLosses,
        pDraws: playerDraws,
      };
      return playerRecordEntry;
    });

    let playersToPair: PlayerStanding[] = playerRecordArray
      .map((entry) => {
        const points = entry.pWins * 3 + entry.pDraws;
        return { playerId: entry.pId, points: points };
      })
      .sort((a, b) => b.points - a.points);

    const remainingTopPlayers = () => {
      const topPlayerList = playersToPair.filter(
        (entry) =>
          entry.points >=
          Math.max(
            ...playersToPair.map((entry) => {
              return entry.points;
            })
          )
      );

      const secondaryPlayerList = playersToPair
        .filter((entry) => !topPlayerList.includes(entry))
        .filter(
          (entry2) =>
            entry2.points >=
            Math.max(
              ...playersToPair
                .filter((entry) => !topPlayerList.includes(entry))
                .map((topPlayer) => {
                  return topPlayer.points;
                })
            )
        );
      if (topPlayerList.length > 1) {
        return topPlayerList;
      } else {
        return topPlayerList.concat(secondaryPlayerList);
      }
    };

    const createMatch = () => {
      const playersForMatch = remainingTopPlayers();

      const pickTwoPlayers = () => {
        let pickedPlayers: PlayerStanding[] = [];

        for (let i = 0; i < 2; i++) {
          const availablePlayers = playersForMatch.filter(
            (player) => !pickedPlayers.includes(player)
          );
          let randomIndex = Math.floor(Math.random() * playersForMatch.length);
          pickedPlayers.push();
        }
      };
    };

    createMatch();

    // while (playersToPair.length > 0) {
    //   createMatch();
    // }

    // console.log(playerRecordArray);
    // console.log(topPlayers);
  };

  if (round === 1) {
    pairCrossPod();
  } else {
    pairOnRecord();
  }

  return newMatches;
}
