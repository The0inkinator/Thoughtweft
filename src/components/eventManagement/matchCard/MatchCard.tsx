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
  const [eventState, { updateMatch, addPlayer, addSeat }] = useEventContext();
  const [optionDisplayVisable, setOptionDisplayVisable] =
    createSignal<boolean>(false);

  const thisMatchState = () => {
    return eventState()
      .evtPods.find((pod) => pod.podId === podId)
      ?.podMatches.find((match) => match.matchId === matchInfo.matchId);
  };

  const report = (p1r: number, p2r: number, drawR?: boolean) => {
    updateMatch(podId, thisMatchState()!.matchId, {
      matchRecord: { p1: p1r, p2: p2r, draw: drawR },
    });
    updateMatch(podId, thisMatchState()!.matchId, {
      matchCompleted: true,
    });
  };

  onMount(() => {
    const player1Seat = eventState().evtSeats.find(
      (seat) => seat.seatNumber === matchInfo.player1Seat
    );
    if (!player1Seat) {
      addSeat(podId, matchInfo.player1Seat);
    }
    const player2Seat = eventState().evtSeats.find(
      (seat) => seat.seatNumber === matchInfo.player2Seat
    );
    if (!player2Seat) {
      addSeat(podId, matchInfo.player2Seat);
    }
  });

  return (
    <>
      <Switch fallback={<></>}>
        <Match when={matchCardState === "pairing"}>
          <div class={styles.matchSeatCont}>
            <Seat seatNumber={matchInfo.player1Seat} podId={podId}></Seat>
            VS
            <Seat seatNumber={matchInfo.player2Seat} podId={podId}></Seat>
          </div>
        </Match>

        <Match when={matchCardState === "playing"}>
          <div class={styles.matchCont}>
            <div
              class={styles.matchSeatCont}
              style={{
                "background-color": thisMatchState()?.matchCompleted
                  ? "green"
                  : "red",
              }}
            >
              <Seat seatNumber={matchInfo.player1Seat} podId={podId}></Seat>
              {thisMatchState()?.matchRecord.p1} VS{" "}
              {thisMatchState()?.matchRecord.p2}
              <p></p>
              <Show when={thisMatchState()?.matchRecord.draw}>Match Drawn</Show>
              <Seat seatNumber={matchInfo.player2Seat} podId={podId}></Seat>
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
                    value="1-1"
                    onClick={() => {
                      report(1, 1, true);
                    }}
                  >
                    1-1
                  </button>
                  <button
                    type="submit"
                    value="p2-2-1"
                    onClick={() => {
                      report(1, 2);
                    }}
                  >
                    1-2
                  </button>
                  <button
                    type="submit"
                    value="p2-2-0"
                    onClick={() => {
                      report(0, 2);
                    }}
                  >
                    0-2
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
