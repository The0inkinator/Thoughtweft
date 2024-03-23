import "./playerCard.css";
import { useEventContext } from "~/context/EventContext";
import { createSignal, Switch, Match, onMount } from "solid-js";
interface PlayerCardInputs {
  name: string;
  id: number;
  podNumber?: number;
  slotNumber?: number;
}

type CardMode = "display" | "edit";

export default function PlayerCard({
  id,
  name,
  podNumber,
  slotNumber,
}: PlayerCardInputs) {
  //Context State
  const [eventState] = useEventContext();
  //State
  const [cardMode, setCardMode] = createSignal<CardMode>("display");
  const [playerName, setPlayerName] = createSignal<string>(
    eventState().playerList[id].name
  );
  //refs
  let thisPlayerCard!: HTMLDivElement;

  const PlayerNameCard = () => {
    return <div class="playerName">{eventState().playerList[id].name}</div>;
  };

  onMount(() => {
    let parentSlotsX = eventState().slots.filter(
      (slot) => slot.numberInPod === slotNumber && slot.podNumber === podNumber
    )[0].xpos;
    let parentSlotsY = eventState().slots.filter(
      (slot) => slot.numberInPod === slotNumber && slot.podNumber === podNumber
    )[0].ypos;

    let thisX = thisPlayerCard.getBoundingClientRect().x;
    let thisY = thisPlayerCard.getBoundingClientRect().x;

    let calcx = parentSlotsX! - thisX;
    let calcy = parentSlotsY! - thisY;

    thisPlayerCard.style.left = `${calcx}px`;
    thisPlayerCard.style.top = `${calcy}px`;
  });

  return (
    <div class="playerCardContainer" ref={thisPlayerCard}>
      <div class="playerIcon"></div>

      <div class="playerName">{eventState().playerList[id].name}</div>
    </div>
  );
}
