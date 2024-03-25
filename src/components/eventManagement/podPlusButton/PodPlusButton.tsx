import "./podCard.css";
import { createEffect, createSignal, For, onMount } from "solid-js";
import { useEventContext } from "~/context/EventContext";

interface PodPlusButtonInputs {}

//MAIN FUNCTION
export default function PodPlusButton() {
  //Context State
  const [eventState] = useEventContext();

  return <div class="podPlusButtonCont"></div>;
}
