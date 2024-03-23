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

  return (
    <div class="podCardContainer">
      <div class="podNumber">Pod # {id}</div>
    </div>
  );
}
