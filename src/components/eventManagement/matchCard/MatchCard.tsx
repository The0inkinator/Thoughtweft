import styles from "./matchCard.module.css";
import Seat from "../seat";
import { MatchData } from "~/typing/eventTypes";
import { useEventContext } from "~/context/EventContext";
import { Match, Show, Switch, createSignal, onMount } from "solid-js";

interface MatchCardInputs {
  podId: number;
  matchInfo: MatchData;
  matchCardState: "pairing" | "playing";
}

export default function MatchCard({
  podId,
  matchInfo,
  matchCardState,
}: MatchCardInputs) {
  const [
    eventState,
    { updateMatch, addPlayer, addSeat, updatePod, updatePlayer },
  ] = useEventContext();
  const [optionDisplayVisable, setOptionDisplayVisable] =
    createSignal<boolean>(false);

  const thisMatchState = () => {
    return eventState()
      .evtPods.find((pod) => pod.podId === podId)
      ?.podMatches.find((match) => match.matchId === matchInfo.matchId);
  };

  const report = (p1r: number, p2r: number, drawR?: boolean) => {
    updateMatch(podId, thisMatchState()!.matchId, {
      matchRecord: { p1: p1r, p2: p2r },
    });

    const winner: MatchData["winner"] = (() => {
      if (drawR) {
        return "draw";
      } else if (p1r > p2r) {
        return "p1";
      } else if (p2r > p1r) {
        return "p2";
      } else {
        return "draw";
      }
    })();

    updateMatch(podId, thisMatchState()!.matchId, {
      winner: winner,
    });
  };

  onMount(() => {
    if (thisMatchState()?.byeMatch) {
      updatePod(podId, { byePlayer: thisMatchState()!.p1Id });
    }

    const player1Seat = eventState()
      .evtPods.find((pod) => pod.podId === podId)
      ?.podSeats.find((seat) => seat.seatNumber === matchInfo.p1Seat);
    if (!player1Seat) {
      addSeat(podId, matchInfo.p1Seat);
    }
    updatePlayer(matchInfo.p1Id, {
      address: { podId: podId, seat: matchInfo.p1Seat },
    });
    const player2Seat = eventState()
      .evtPods.find((pod) => pod.podId === podId)
      ?.podSeats.find((seat) => seat.seatNumber === matchInfo.p2Seat);
    if (!player2Seat) {
      addSeat(podId, matchInfo.p2Seat);
    }
    updatePlayer(matchInfo.p2Id, {
      address: { podId: podId, seat: matchInfo.p2Seat },
    });
  });

  const getPodRecord = (pId: number) => {
    const player = eventState().evtPlayerList.find(
      (player) => player.id === pId
    );
    const recordData = eventState()
      .evtPlayerList.find((player) => player.id === pId)
      ?.podRecords.find((record) => record.podId === podId);

    return `${recordData?.w} - ${recordData?.l} - ${recordData?.d}`;
  };

  interface ReportButtonInputs {
    player: "p1" | "p2" | "draw";
    wins: 0 | 1 | 2;
    losses: 0 | 1 | 2;
  }
  const ReportButton = ({ player, wins, losses }: ReportButtonInputs) => {
    let value1: number = 0;
    let value2: number = 0;
    let displayRecord: string = "0-0";

    if (player === "draw") {
      value1 = wins;
      value2 = wins;
      displayRecord = `${value1} - ${value2}`;
    } else if (player === "p1") {
      value1 = wins;
      value2 = losses;
      displayRecord = `${value1} - ${value2}`;
    } else if (player === "p2") {
      value1 = losses;
      value2 = wins;
      displayRecord = `${value2} - ${value1}`;
    }
    return (
      <button
        class={styles.reportButton}
        type="submit"
        onClick={() => {
          report(value1, value2);
        }}
      >
        {displayRecord}
      </button>
    );
  };

  return (
    <>
      {/* {matchInfo.matchId} */}
      <Switch fallback={<></>}>
        <Match when={matchCardState === "pairing"}>
          <div class={styles.matchCNT}>
            <div class={styles.matchPlayerCNT}>
              <Seat seatNumber={matchInfo.p1Seat} podId={podId}></Seat>
              <div
                class={styles.recordText}
                onclick={() => {
                  getPodRecord(thisMatchState()!.p1Id);
                }}
              >
                {getPodRecord(thisMatchState()!.p1Id)}
              </div>
            </div>
            <div class={styles.vs}>VS</div>
            <div class={styles.matchPlayerCNT}>
              <Seat seatNumber={matchInfo.p2Seat} podId={podId}></Seat>
              <div
                class={styles.recordText}
                onclick={() => {
                  getPodRecord(thisMatchState()!.p2Id);
                }}
              >
                {thisMatchState()?.p2Id === -1
                  ? ""
                  : getPodRecord(thisMatchState()!.p2Id)}
              </div>
            </div>
          </div>
        </Match>

        <Match when={matchCardState === "playing"}>
          <div class={styles.matchCNT}>
            <div class={styles.matchPlayerCNT}>
              <Seat seatNumber={matchInfo.p1Seat} podId={podId}></Seat>
              <Switch>
                <Match when={optionDisplayVisable()}>
                  <ReportButton player="p1" wins={2} losses={0}></ReportButton>
                  <ReportButton player="p1" wins={2} losses={1}></ReportButton>
                  <ReportButton player="p1" wins={1} losses={0}></ReportButton>
                </Match>
                <Match when={!optionDisplayVisable()}>
                  <div
                    class={styles.recordText}
                    onclick={() => {
                      getPodRecord(thisMatchState()!.p1Id);
                    }}
                  >
                    {getPodRecord(thisMatchState()!.p1Id)}
                  </div>
                </Match>
              </Switch>
            </div>
            <div class={styles.vs}>
              <Switch>
                <Match when={optionDisplayVisable()}>
                  <ReportButton
                    player="draw"
                    wins={1}
                    losses={0}
                  ></ReportButton>
                  <ReportButton
                    player="draw"
                    wins={0}
                    losses={0}
                  ></ReportButton>
                </Match>
                <Match when={!optionDisplayVisable()}>
                  <button
                    class={styles.reportButton}
                    style={{
                      "background-color": thisMatchState()?.winner
                        ? "green"
                        : "",
                    }}
                    onClick={() => {
                      if (matchInfo.p2Id !== -1) {
                        setOptionDisplayVisable(true);
                      }
                    }}
                  >
                    Report
                  </button>
                </Match>
              </Switch>
            </div>
            <div class={styles.matchPlayerCNT}>
              <Seat seatNumber={matchInfo.p2Seat} podId={podId}></Seat>
              <Switch>
                <Match when={optionDisplayVisable()}>
                  <ReportButton player="p2" wins={2} losses={0}></ReportButton>
                  <ReportButton player="p2" wins={2} losses={1}></ReportButton>
                  <ReportButton player="p2" wins={1} losses={0}></ReportButton>
                </Match>
                <Match
                  when={
                    !optionDisplayVisable() && thisMatchState()?.p2Id !== -1
                  }
                >
                  <div class={styles.recordText}>
                    {getPodRecord(thisMatchState()!.p2Id)}
                  </div>
                </Match>
              </Switch>
            </div>
          </div>
        </Match>
      </Switch>
    </>
  );
}
