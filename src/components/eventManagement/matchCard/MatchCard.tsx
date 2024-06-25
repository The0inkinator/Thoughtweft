import styles from "./matchCard.module.css";
import PlayerSeat from "../playerSeat/PlayerSeat";
import { MatchData } from "~/typing/eventTypes";
import { useEventContext } from "~/context/EventContext";
import { Match, Switch } from "solid-js";

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

  const thisMatchState = () => {
    return eventState()
      .evtPods.find((pod) => pod.podId === podId)
      ?.podMatches.find((match) => match.matchId === matchInfo.matchId);
  };

  return (
    <>
      <Switch fallback={<></>}>
        <Match when={matchCardState === "pairing"}>
          <div class={styles.matchCont}>
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
            <button
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
            </button>
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
      </Switch>
    </>
  );
}
