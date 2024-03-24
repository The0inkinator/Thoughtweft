import { createEffect, onMount } from "solid-js";
import "./playerSlot.css";
import { useEventContext } from "~/context/EventContext";
import { Slot } from "~/context/EventContext";

interface PlayerSlotInput {
  podNumber: number;
  slotNumber: number;
  filled: boolean;
}

export default function PlayerSlot({
  podNumber,
  slotNumber,
  filled,
}: PlayerSlotInput) {
  const [eventState, { updateSlot }] = useEventContext();

  const stateForThisSlot = () => {
    let tempState: Slot[] = eventState().slots.filter(
      (slot) => slot.numberInPod === slotNumber && slot.podNumber === podNumber
    );

    return tempState[0];
  };

  let thisSlot!: HTMLDivElement;

  onMount(() => {
    let thisX = thisSlot.getBoundingClientRect().x;
    let thisY = thisSlot.getBoundingClientRect().y;
    updateSlot(podNumber, slotNumber, thisX, thisY, thisSlot);
  });

  return (
    <div
      class="playerSlotContainer"
      ref={thisSlot}
      onClick={() => {
        const slotToLog = eventState().slots.filter(
          (slot) =>
            slot.numberInPod === slotNumber && slot.podNumber === podNumber
        );
        console.log(slotToLog[0].slotRef);
      }}
    >
      {podNumber}.{slotNumber}
    </div>
  );
}
