import { createEffect, onMount } from "solid-js";
import "./playerSeat.css";
import { useEventContext } from "~/context/EventContext";

interface PlayerSlotInput {}

export default function PlayerSeat() {
  const [eventState, {}] = useEventContext();

  let thisSlot!: HTMLDivElement;

  return <div class="playerSeatCont" ref={thisSlot}></div>;
}
