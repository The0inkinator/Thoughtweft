import "./podCard.css";
import { createEffect, createSignal, For, onMount } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import PlayerCard from "../playerCard/PlayerCard";
import PlayerSlot from "../playerSlot";

interface PodCardInputs {
  id: number;
}

//MAIN FUNCTION
export default function PodCard({ id }: PodCardInputs) {
  //Context State
  const [eventState] = useEventContext();

  const buildSlotArray = () => {
    const thisPod = eventState().pods.find((pod) => pod.podNumber === id);

    if (thisPod) {
      return Array(thisPod.podSize).fill(false);
    } else {
      return [];
    }
  };

  //Slot State
  const [slots, setSlots] = createSignal<boolean[]>(buildSlotArray());

  return (
    <div class="podCardContainer">
      <div class="podNumber">Pod # {id}</div>
      <For each={slots()}>
        {(slot, index) => (
          <PlayerSlot podNumber={id} slotNumber={index() + 1} filled={slot} />
        )}
      </For>
    </div>
  );
}
