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

  return (
    <>
      <Switch fallback={<></>}>
        <Match when={matchCardState === "pairing"}>
          <div class={styles.matchCNT}>
            <div class={styles.matchPlayerCNT}>
              <Seat seatNumber={matchInfo.p1Seat} podId={podId}></Seat>
              <div>{getPodRecord(matchInfo.p1Id)}</div>
            </div>
            <div class={styles.vs}>VS</div>
            <div class={styles.matchPlayerCNT}>
              <Seat seatNumber={matchInfo.p2Seat} podId={podId}></Seat>
              <div>{getPodRecord(matchInfo.p2Id)}</div>
            </div>
          </div>
        </Match>

        <Match when={matchCardState === "playing"}>
          <div class={styles.matchCNT}>
            <div
              class={styles.matchSeatCont}
              style={{
                "background-color": thisMatchState()?.winner ? "green" : "red",
              }}
            >
              <Seat seatNumber={matchInfo.p1Seat} podId={podId}></Seat>
              {thisMatchState()?.p1Score} VS {thisMatchState()?.p2Score}
              <p></p>
              <Show when={thisMatchState()?.winner === "draw"}>
                Match Drawn
              </Show>
              <Seat seatNumber={matchInfo.p2Seat} podId={podId}></Seat>
            </div>
            <div>
              P1: {getPodRecord(matchInfo.p1Id)} P2:{" "}
              {getPodRecord(matchInfo.p2Id)}
            </div>
            <Switch>
              <Match when={!optionDisplayVisable()}>
                <button
                  onClick={() => {
                    setOptionDisplayVisable(true);
                  }}
                >
                  Report
                </button>
              </Match>
              <Match when={optionDisplayVisable()}>
                {/* REPORT BUTTONS */}
                <div style={styles.reportOptionCont}>
                  <button
                    type="submit"
                    value="p1-2-0"
                    onClick={() => {
                      report(2, 0);
                    }}
                  >
                    2-0
                  </button>
                  <button
                    type="submit"
                    value="p1-2-1"
                    onClick={() => {
                      report(2, 1);
                    }}
                  >
                    2-1
                  </button>
                  <button
                    type="submit"
                    value="p1-1-0"
                    onClick={() => {
                      report(1, 0);
                    }}
                  >
                    1-0
                  </button>
                  <button
                    type="submit"
                    value="1-1"
                    onClick={() => {
                      report(1, 1, true);
                    }}
                  >
                    1-1
                  </button>
                  <button
                    type="submit"
                    value="0-0"
                    onClick={() => {
                      report(0, 0, true);
                    }}
                  >
                    0-0
                  </button>
                  <button
                    type="submit"
                    value="p2-1-0"
                    onClick={() => {
                      report(0, 1);
                    }}
                  >
                    1-0
                  </button>
                  <button
                    type="submit"
                    value="p2-2-1"
                    onClick={() => {
                      report(1, 2);
                    }}
                  >
                    2-1
                  </button>
                  <button
                    type="submit"
                    value="p2-2-0"
                    onClick={() => {
                      report(0, 2);
                    }}
                  >
                    2-0
                  </button>
                </div>
              </Match>
            </Switch>
          </div>
        </Match>
      </Switch>
    </>
  );
}
