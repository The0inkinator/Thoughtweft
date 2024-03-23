import "./podCard.css";
import { createEffect, createSignal, For } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import PlayerCard from "../playerCard/PlayerCard";

interface PodCardInputs {
  id: number;
}

//MAIN FUNCTION
export default function PodCard({ id }: PodCardInputs) {
  //Context State
  const [eventState] = useEventContext();

  const playersInThisPod = () => {
    return eventState().pods.find((pod) => pod.podNumber === id)
      ?.registeredPlayers;
  };

  return (
    <div class="podCardContainer">
      <div class="podNumber">Pod # {id}</div>
      <For each={playersInThisPod()}>
        {(playerObj) => <PlayerCard id={playerObj.id} name={playerObj.name} />}
      </For>
    </div>
  );
}
