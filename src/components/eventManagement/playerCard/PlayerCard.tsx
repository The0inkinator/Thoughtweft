import "./playerCard.css";
import { useEventContext } from "~/context/EventContext";
import { createSignal, Switch, Match, onMount } from "solid-js";

interface PlayerCardInputs {}

type CardMode = "noSeat" | "dragging" | "hoveringSeat" | "seated";

export default function PlayerCard() {
  //Context State
  const [eventState] = useEventContext();
  //Local State
  const [playerCardMode, setPlayerCardMode] = createSignal<CardMode>("noSeat");
  //refs
  let thisPlayerCard!: HTMLDivElement;

  return (
    <div class="playerCardCont" ref={thisPlayerCard}>
      <Switch fallback={<></>}>
        <Match when={playerCardMode() === "noSeat"}>
          <></>
        </Match>
        <Match when={playerCardMode() === "dragging"}>
          <></>
        </Match>
        <Match when={playerCardMode() === "hoveringSeat"}>
          <></>
        </Match>
        <Match when={playerCardMode() === "seated"}>
          <></>
        </Match>
      </Switch>
    </div>
  );
}
