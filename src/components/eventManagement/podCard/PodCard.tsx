import "./podCard.css";
import { createEffect, createSignal, For, onMount } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import DisplayFrame from "../displayFrame";

interface PodCardInputs {
  podSize: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  podNumber: number;
}

//MAIN FUNCTION
export default function PodCard({ podSize, podNumber }: PodCardInputs) {
  //Context State
  const [eventState, { editPodSize }] = useEventContext();

  return (
    <DisplayFrame>
      <div
        class="podCardCont"
        onClick={() => {
          editPodSize({ podNumber, podSize: 10 });
        }}
      >
        Pod Card Size = {podSize}
      </div>
    </DisplayFrame>
  );
}
