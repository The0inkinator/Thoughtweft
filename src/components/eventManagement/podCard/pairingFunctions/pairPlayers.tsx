import {
  Event,
  MatchData,
  MatchRecord,
  PlayerRecord,
} from "~/typing/eventTypes";

type PlayerPairing = {
  pId: number;
  points: number;
  hasBye: boolean;
  hasPlayed: number[];
};

type BuildingRound = number | PtlMatch;
type PtlMatch = { p1: number; p2: number };
type PtlRound = PtlMatch[];
type Deposit = PtlRound[];

export default function PairPlayers(
  eventData: Event,
  podId: number
): MatchData[] {
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

    let playersToPair: PlayerPairing[] = playerRecordArray
      .map((entry) => {
        const points = entry.pWins * 3 + entry.pDraws;
        const byeBoolean = pod.byePlayerIds
          ? pod.byePlayerIds!.includes(entry.pId)
          : false;
        const hasPlayedArray: number[] = pod.podMatches
          .filter(
            (match) => match.p1Id === entry.pId || match.p2Id === entry.pId
          )
          .map((result) => {
            return [result.p1Id, result.p2Id].filter(
              (id) => id !== entry.pId
            )[0];
          });

        return {
          pId: entry.pId,
          points: points,
          hasBye: byeBoolean,
          hasPlayed: hasPlayedArray,
        };
      })
      .sort((a, b) => {
        if (a.hasBye && !b.hasBye) return -1; // `a` comes before `b` if `a` has a bye and `b` does not
        if (!a.hasBye && b.hasBye) return 1; // `b` comes before `a` if `b` has a bye and `a` does not
        return b.points - a.points; // Otherwise, sort by points in descending order
      });

    const createAllRounds: (globalInputArray: BuildingRound[]) => Deposit = (
      globalInputArray: BuildingRound[]
    ) => {
      const depositSet: Set<string> = new Set();

      const makeRoundLoop = (inputArray: BuildingRound[]) => {
        if (
          inputArray.filter((entry) => typeof entry !== "number").length ===
          inputArray.length
        ) {
          const finalArray: PtlRound = inputArray as PtlRound;
          const orderedFinalArray = finalArray
            .map((match) => {
              if (match.p1 > match.p2) {
                return match;
              } else {
                return { p1: match.p2, p2: match.p1 };
              }
            })
            .sort((a, b) => b.p1 - a.p1);

          const serializedFinalArray = JSON.stringify(orderedFinalArray);

          if (!depositSet.has(serializedFinalArray)) {
            depositSet.add(serializedFinalArray);
          }
        } else {
          const inputNumList = inputArray.filter(
            (entry) => typeof entry === "number"
          );

          if (inputNumList.length > 1) {
            for (let i = 1; i < inputNumList.length; i++) {
              const tempNumList = [
                ...inputArray.filter((entry) => typeof entry === "number"),
              ];
              const tempMatchList = [
                ...inputArray.filter((entry) => typeof entry !== "number"),
              ];

              const player1 = tempNumList[0];
              const player2 = (() => {
                if (tempNumList[i] !== undefined) {
                  return tempNumList[i];
                } else {
                  return -1;
                }
              })();

              tempMatchList.push({
                p1: player1,
                p2: player2,
              } as PtlMatch);
              tempNumList.map((number) => {
                if (number !== player1 && number !== player2) {
                  tempMatchList.push(number);
                }
              });

              makeRoundLoop(tempMatchList);
            }
          } else if (inputNumList.length === 1) {
            const tempMatchList = [
              ...inputArray.filter((entry) => typeof entry !== "number"),
            ];

            tempMatchList.push({
              p1: inputNumList[0],
              p2: -1,
            } as PtlMatch);

            makeRoundLoop(tempMatchList);
          }
        }
      };

      for (let i = 0; i < globalInputArray.length; i++) {
        const adjustedInputArray = globalInputArray
          .slice(i)
          .concat(globalInputArray.slice(0, i));

        makeRoundLoop(adjustedInputArray);
      }

      const depositArray: Deposit = Array.from(depositSet).map((round) =>
        JSON.parse(round)
      ) as Deposit;

      return depositArray;
    };

    const pIdList = playersToPair.map((player) => {
      return player.pId;
    });
    const allRounds = createAllRounds(pIdList);

    const playerDataFromId: (id: number) => PlayerPairing | undefined = (
      id: number
    ) => {
      return playersToPair.find((player) => player.pId === id);
    };

    //Round info
    const allScores: number[] = [];
    playersToPair.map((player) => {
      if (!allScores.includes(player.points)) {
        allScores.push(player.points);
      }
    });
    allScores.sort((a, b) => b - a);

    const sortedRounds = allRounds
      .map((ptlRound, roundIndex) => {
        let byeToByePlayer = false;
        let pairsPriorOpponent = false;
        let roundQualityScore = 0;

        ptlRound.map((match) => {
          const player1 = playerDataFromId(match.p1);
          const player2 = playerDataFromId(match.p2);

          if (player1) {
            if (player1.hasBye && match.p2 === -1) {
              byeToByePlayer = true;
            }
          }

          if (player1 && player2) {
            if (player1.hasPlayed.includes(player2.pId)) {
              pairsPriorOpponent = true;
            }
            if (player1.points === player2.points) {
              const tempScore = roundQualityScore;
              roundQualityScore = tempScore + allScores.length;
            }
            if (player1.points !== player2.points) {
              const p1Score = allScores.findIndex(
                (score) => score === player1.points
              )!;

              const p2Score = allScores.findIndex(
                (score) => score === player2.points
              )!;

              const scoreDistance = Math.abs(p1Score - p2Score);
              const tempScore = roundQualityScore;
              roundQualityScore =
                tempScore + Math.abs(scoreDistance - allScores.length);
            }
          }
        });

        const roundEval = {
          index: roundIndex,
          byePlayer: byeToByePlayer,
          priorOppo: pairsPriorOpponent,
          roundQuality: roundQualityScore,
        };

        return roundEval;
      })
      .sort((a, b) => {
        if (a.byePlayer && !b.byePlayer) return 1;
        if (b.byePlayer && !a.byePlayer) return -1;
        if (a.priorOppo && !b.priorOppo) return 1;
        if (b.priorOppo && !a.priorOppo) return -1;
        return b.roundQuality - a.roundQuality;
      });

    const bestRounds = (() => {
      const bestRounds = [];
      const tempSortedRounds = [...sortedRounds];
      let targetRoundQuality = tempSortedRounds[0].roundQuality;
      let roundDowngraded = false;
      while (
        tempSortedRounds[0].roundQuality === targetRoundQuality &&
        !roundDowngraded
      ) {
        if (tempSortedRounds.length === 1) {
          bestRounds.push(tempSortedRounds[0]);
          break;
        } else {
          if (
            tempSortedRounds[0].byePlayer !== tempSortedRounds[1].byePlayer ||
            tempSortedRounds[0].priorOppo !== tempSortedRounds[1].priorOppo
          ) {
            roundDowngraded = true;
          }
          bestRounds.push(tempSortedRounds[0]);
          tempSortedRounds.splice(0, 1);
        }
      }
      return bestRounds;
    })();

    const chosenRound =
      allRounds[
        bestRounds[Math.floor(Math.random() * bestRounds.length)].index
      ];

    const stockMatchData = () => {
      return {
        matchPodId: podId,
        matchRound: round!,
        matchId: allPodMatches?.length
          ? allPodMatches.length + newMatches.length + 1
          : 0 + newMatches.length + 1,
        p1Score: 0,
        p2Score: 0,
      };
    };

    let proxySeatNumber = 1;

    chosenRound
      .sort((a, b) => {
        return (
          playerDataFromId(b.p1)!.points +
          playerDataFromId(b.p2)!.points -
          (playerDataFromId(a.p1)!.points + playerDataFromId(a.p2)!.points)
        );
      })
      .map((match) => {
        const tempP1Seat = proxySeatNumber;
        proxySeatNumber = tempP1Seat + 1;
        const tempP2Seat = proxySeatNumber;
        proxySeatNumber = tempP2Seat + 1;

        const newMatch: MatchData = {
          ...stockMatchData(),
          p1Seat: tempP1Seat,
          p1Id: match.p1,
          p2Seat: tempP2Seat,
          p2Id: match.p2,
        };

        newMatches.push(newMatch);
      });
  };

  if (round === 1) {
    pairCrossPod();
  } else {
    pairOnRecord();
  }

  return newMatches;
}
