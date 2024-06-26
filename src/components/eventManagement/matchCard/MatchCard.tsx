import styles from "./matchCard.module.css";
import PlayerSeat from "../playerSeat/PlayerSeat";
import { MatchData } from "~/typing/eventTypes";
import { useEventContext } from "~/context/EventContext";
import { Match, Switch, createSignal } from "solid-js";

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
  const [eventState, { updateMatch }] = useEventContext();
  const [optionDisplayVisable, setOptionDisplayVisable] =
    createSignal<boolean>(false);

  const thisMatchState = () => {
    return eventState()
      .evtPods.find((pod) => pod.podId === podId)
      ?.podMatches.find((match) => match.matchId === matchInfo.matchId);
  };

  return (
    <>
      <Switch fallback={<></>}>
        <Match when={matchCardState === "pairing"}>
          <div class={styles.matchSeatCont}>
            <PlayerSeat
              seatNumber={matchInfo.player1Seat}
              podId={podId}
              tableSide="L"
            ></PlayerSeat>
            VS
            <PlayerSeat
              seatNumber={matchInfo.player2Seat}
              podId={podId}
              tableSide="R"
            ></PlayerSeat>
          </div>
        </Match>
        <Match when={matchCardState === "playing"}>
          <div class={styles.matchCont}>
            {/* <button
              type="submit"
              style={{
                "background-color": thisMatchState()?.matchCompleted
                  ? "green"
                  : "red",
              }}
              onclick={() => {
                updateMatch(podId, matchInfo.matchId, { matchCompleted: true });
              }}
            >
              Complete Match
            </button> */}
            <div
              class={styles.matchSeatCont}
              style={{
                "background-color": thisMatchState()?.matchCompleted
                  ? "green"
                  : "red",
              }}
            >
              <PlayerSeat
                seatNumber={matchInfo.player1Seat}
                podId={podId}
                tableSide="L"
              ></PlayerSeat>
              {thisMatchState()?.matchRecord.p1} VS{" "}
              {thisMatchState()?.matchRecord.p2}
              <PlayerSeat
                seatNumber={matchInfo.player2Seat}
                podId={podId}
                tableSide="R"
              ></PlayerSeat>
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
                      updateMatch(podId, thisMatchState()!.matchId, {
                        matchRecord: { p1: 2, p2: 0 },
                      });
                      updateMatch(podId, thisMatchState()!.matchId, {
                        matchCompleted: true,
                      });
                    }}
                  >
                    2-0
                  </button>
                  <button
                    type="submit"
                    value="p1-2-1"
                    onClick={() => {
                      updateMatch(podId, thisMatchState()!.matchId, {
                        matchRecord: { p1: 2, p2: 1 },
                      });
                      updateMatch(podId, thisMatchState()!.matchId, {
                        matchCompleted: true,
                      });
                    }}
                  >
                    2-1
                  </button>
                  <button
                    type="submit"
                    value="1-1"
                    onClick={() => {
                      updateMatch(podId, thisMatchState()!.matchId, {
                        matchRecord: { p1: 0, p2: 0 },
                      });
                      updateMatch(podId, thisMatchState()!.matchId, {
                        matchCompleted: true,
                      });
                    }}
                  >
                    1-1
                  </button>
                  <button
                    type="submit"
                    value="p2-2-1"
                    onClick={() => {
                      updateMatch(podId, thisMatchState()!.matchId, {
                        matchRecord: { p1: 1, p2: 2 },
                      });
                      updateMatch(podId, thisMatchState()!.matchId, {
                        matchCompleted: true,
                      });
                    }}
                  >
                    1-2
                  </button>
                  <button
                    type="submit"
                    value="p2-2-0"
                    onClick={() => {
                      updateMatch(podId, thisMatchState()!.matchId, {
                        matchRecord: { p1: 0, p2: 2 },
                      });
                      updateMatch(podId, thisMatchState()!.matchId, {
                        matchCompleted: true,
                      });
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
