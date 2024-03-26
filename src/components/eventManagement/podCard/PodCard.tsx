import "./podCard.css";
import { createEffect, createSignal, For, onMount } from "solid-js";
import { useEventContext } from "~/context/EventContext";

interface PodCardInputs {}

//MAIN FUNCTION
export default function PodCard() {
  //Context State
  const [eventState] = useEventContext();

  return <div class="podCardCont"> Pod Card</div>;
}
