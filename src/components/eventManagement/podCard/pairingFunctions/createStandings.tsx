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

  const generateRecordSheet: () => MatchRecord[] = () => {
    const tefullPRecordecordSheet: MatchRecord[] = [];

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
              gamesWon: match.p1Score,
              gamesPlayed: match.p1Score + match.p2Score,
              matchResult: convertWinData(1, match.winner),
            };

            const tempEntry2: MatchRecord = {
              matchId: match.matchId,
              playerId: match.p2Id,
              gamesWon: match.p2Score,
              gamesPlayed: match.p1Score + match.p2Score,
              matchResult: convertWinData(2, match.winner),
            };

            if (
              match.p1Id === playerInPod.id &&
              !tefullPRecordecordSheet.some(
                (entry) =>
                  entry.matchId === tempEntry1.matchId &&
                  entry.playerId === tempEntry1.playerId
              )
            ) {
              tefullPRecordecordSheet.push(tempEntry1);
            }

            if (
              match.p2Id === playerInPod.id &&
              !tefullPRecordecordSheet.some(
                (entry) =>
                  entry.matchId === tempEntry2.matchId &&
                  entry.playerId === tempEntry2.playerId
              )
            ) {
              tefullPRecordecordSheet.push(tempEntry2);
            }
          }
        }
      });
    });

    return tefullPRecordecordSheet;
  };

  const recordSheet = generateRecordSheet();

  //   console.log(recordSheet);

  const playerRecordArray: PlayerRecord[] = podPlayers.map((player) => {
    let pGameWins: number = 0;
    let pGameLosses: number = 0;
    const pMatchWins = recordSheet.filter(
      (entry) => entry.playerId === player.id && entry.matchResult === "w"
    ).length;
    //Get Game Wins
    recordSheet.map((entry) => {
      if (entry.playerId === player.id && entry.matchResult === "w") {
        const storedWins = pGameWins;
        pGameWins = storedWins + entry.gamesWon;
      } else if (entry.playerId === player.id && entry.matchResult === "d") {
        const storedWins = pGameWins;
        pGameWins = storedWins + entry.gamesWon;
      }
    });
    const pMatchLosses = recordSheet.filter(
      (entry) => entry.playerId === player.id && entry.matchResult === "l"
    ).length;
    //Get Game Losses
    recordSheet.map((entry) => {
      if (entry.playerId === player.id && entry.matchResult === "l") {
        const storedLosses = pGameLosses;
        pGameLosses =
          storedLosses + Math.abs(entry.gamesPlayed! - entry.gamesWon);
      } else if (entry.playerId === player.id && entry.matchResult === "d") {
        const storedLosses = pGameLosses;
        pGameLosses =
          storedLosses + Math.abs(entry.gamesPlayed! - entry.gamesWon);
      }
    });
    const playerDraws = recordSheet.filter(
      (entry) => entry.playerId === player.id && entry.matchResult === "d"
    ).length;
    const playerRecordEntry: PlayerRecord = {
      pId: player.id,
      pWins: pMatchWins,
      pGameWins: pGameWins,
      pLosses: pMatchLosses,
      pGameLosses: pGameLosses,
      pDraws: playerDraws,
    };
    return playerRecordEntry;
  });

  //   console.log(playerRecordArray);

  podPlayers.map((player) => {
    const fullPRecord = playerRecordArray.find(
      (record) => record.pId === player.id
    )!;
    let pointTotal: number = 0;
    const finalRecord = {
      w: fullPRecord.pWins,
      l: fullPRecord.pLosses,
      d: fullPRecord.pDraws,
    };
    const omwCalc: () => number = () => {
      let totalWinPer = 0;
      let opponentCount = playerRecordArray.filter(
        (record) => record.pId !== player.id
      ).length;
      playerRecordArray
        .filter((record) => record.pId !== player.id)
        .map((foundRecord) => {
          const tempWinPer = totalWinPer;
          const result = parseInt(
            (
              (foundRecord.pWins / (foundRecord.pLosses + foundRecord.pWins)) *
              100
            ).toFixed(0)
          );
          totalWinPer = tempWinPer + result;
        });
      return parseInt((totalWinPer / opponentCount).toFixed(0));
    };

    const gwCalc: number = parseInt(
      (
        (fullPRecord.pGameWins! /
          (fullPRecord.pGameLosses! + fullPRecord.pGameWins!)) *
        100
      ).toFixed(0)
    );
    const ogwCalc: () => number = () => {
      let totalWinPer = 0;
      let opponentCount = playerRecordArray.filter(
        (record) => record.pId !== player.id
      ).length;
      playerRecordArray
        .filter((record) => record.pId !== player.id)
        .map((foundRecord) => {
          const tempWinPer = totalWinPer;
          const result = parseInt(
            (
              (foundRecord.pGameWins! /
                (foundRecord.pGameLosses! + foundRecord.pGameWins!)) *
              100
            ).toFixed(0)
          );
          totalWinPer = tempWinPer + result;
        });
      return parseInt((totalWinPer / opponentCount).toFixed(0));
    };

    //Get point totals
    matches
      .filter((match) => match.p1Id === player.id || match.p2Id === player.id)
      .map((foundMatch) => {
        if (foundMatch.winner === "draw") {
          const storedPoints = pointTotal;
          pointTotal = storedPoints + 1;
        } else {
          if (foundMatch.p1Id === player.id && foundMatch.winner === "p1") {
            const storedPoints = pointTotal;
            pointTotal = storedPoints + 3;
          } else if (
            foundMatch.p2Id === player.id &&
            foundMatch.winner === "p2"
          ) {
            const storedPoints = pointTotal;
            pointTotal = storedPoints + 3;
          }
        }
      });

    const standingEntry: PlayerStanding = {
      rank: 0,
      name: player.name,
      points: pointTotal,
      record: finalRecord,
      omw: omwCalc(),
      gw: gwCalc,
      ogw: ogwCalc(),
    };

    tempStandings.push(standingEntry);
  });

  const finalStandings = tempStandings.sort((a, b) => b.points - a.points);

  return finalStandings;
}
