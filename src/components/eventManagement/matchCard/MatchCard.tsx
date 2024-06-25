import styles from "./matchCard.module.css";
import PlayerSeat from "../playerSeat/PlayerSeat";
import { Match } from "~/typing/eventTypes";

interface MatchCardInputs {
  podId: number;
  matchInfo: Match;
}

export default function MatchCard({ podId, matchInfo }: MatchCardInputs) {
  return (
    <>
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
    </>
  );
}
