import "./playerCard.css";
import { useEventContext } from "~/context/EventContext";
import { createSignal, Switch, Match, onMount } from "solid-js";
interface PlayerCardInputs {}

type CardMode = "display" | "edit";

export default function PlayerCard() {
  //Context State
  const [eventState] = useEventContext();
  //refs
  let thisPlayerCard!: HTMLDivElement;

  return (
    <div class="playerCardCont" ref={thisPlayerCard}>
      <div class="playerIcon"></div>
      <div class="playerName"></div>
    </div>
  );
}
