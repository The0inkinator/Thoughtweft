import {
  Event,
  MatchData,
  MatchRecord,
  Player,
  PlayerRecord,
  PlayerUpdateParam,
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

    const topPlayers = () => {
      const tempTopPlayers = playersToPair.filter(
        (entry) =>
          entry.points >=
          Math.max(
            ...playersToPair.map((entry) => {
              return entry.points;
            })
          )
      );
      return tempTopPlayers;
    };

    const createAllPtlRounds = () => {
      const pIdList = playersToPair.map((player) => {
        return player.pId;
      });

      const makePairingFrom: (globalInputArray: BuildingRound[]) => Deposit = (
        globalInputArray: BuildingRound[]
      ) => {
        const depositArray: Deposit = [];

        const makePairingLoop = (inputArray: BuildingRound[]) => {
          if (
            inputArray.filter((entry) => typeof entry !== "number").length ===
            inputArray.length
          ) {
            const finalArray: PtlRound = inputArray as PtlRound;
            let duplicateRound = false;
            depositArray.map((round) => {
              let duplicateMatches = 0;
              round.map((match) => {
                finalArray.map((inputMatch) => {
                  if (
                    [match.p1, match.p2].filter(
                      (player) =>
                        inputMatch.p1 === player || inputMatch.p2 === player
                    ).length === 2
                  ) {
                    duplicateMatches = duplicateMatches + 1;
                  }
                });
              });
              if (duplicateMatches >= finalArray.length) {
                duplicateRound = true;
                console.log("eliminated duplicate round");
              }
            });
            if (!duplicateRound) {
              depositArray.push(inputArray as PtlRound);
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
                  if (tempNumList[i]) {
                    return tempNumList[i];
                  } else {
                    return -1;
                  }
                })();
                tempNumList.splice(0, 1);
                if (tempNumList[i]) {
                  tempNumList.splice(i - 1, 1);
                } else {
                  tempNumList.splice(-1);
                }

                tempMatchList.push({
                  p1: player1,
                  p2: player2,
                } as PtlMatch);
                tempNumList.map((number) => {
                  tempMatchList.push(number);
                });

                makePairingLoop(tempMatchList);
              }
            } else if (inputNumList.length === 1) {
              const tempMatchList = [
                ...inputArray.filter((entry) => typeof entry !== "number"),
              ];

              tempMatchList.push({
                p1: inputNumList[0],
                p2: -1,
              } as PtlMatch);

              makePairingLoop(tempMatchList);
            }
          }
        };

        for (let i = 0; i < globalInputArray.length; i++) {
          const adjustedInputArray = globalInputArray
            .slice(i)
            .concat(globalInputArray.slice(0, i));

          makePairingLoop(adjustedInputArray);
        }

        return depositArray;
      };

      console.log("all possible matches", makePairingFrom([1, 2, 3]));
    };

    createAllPtlRounds();

    const createMatch = () => {
      // console.log(playersToPair);
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
