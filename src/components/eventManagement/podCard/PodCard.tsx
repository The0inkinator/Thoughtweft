import "./podCard.css";
import { createEffect, createSignal, For, onMount } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import DisplayFrame from "../displayFrame";

interface PodCardInputs {}

//MAIN FUNCTION
export default function PodCard() {
  //Context State
  const [eventState] = useEventContext();

  return (
    <DisplayFrame>
      <div class="podCardCont"> Pod Card</div>
    </DisplayFrame>
  );
}
