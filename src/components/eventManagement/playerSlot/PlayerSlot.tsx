import { createEffect, onMount } from "solid-js";
import "./playerSlot.css";
import { useEventContext } from "~/context/EventContext";

interface PlayerSlotInput {}

export default function PlayerSlot() {
  const [eventState, { updateSlot }] = useEventContext();

  let thisSlot!: HTMLDivElement;

  return <div class="playerSlotContainer" ref={thisSlot}></div>;
}
