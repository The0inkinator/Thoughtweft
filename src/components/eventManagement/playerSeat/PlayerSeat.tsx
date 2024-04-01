import { createEffect, onMount } from "solid-js";
import "./playerSeat.css";
import { useEventContext } from "~/context/EventContext";
import PlayerCard from "../playerCard";

interface PlayerSlotInput {
  podNumber: number;
  seatNumber: number;
  seatFacing: "left" | "right";
}

export default function PlayerSeat({ podNumber, seatNumber }: PlayerSlotInput) {
  const [eventState, {}] = useEventContext();

  let thisSeat!: HTMLDivElement;

  return (
    <div class="playerSeatCont" ref={thisSeat}>
      <PlayerCard></PlayerCard>
    </div>
  );
}
