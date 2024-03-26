import "./eventDisplay.css";
import { For, createEffect, createSignal, onMount } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import PlayerHopper from "../playerHopper";
import PodCard from "../podCard";
import PodPlusButton from "../podPlusButton";

export default function EventDisplay() {
  //Context State
  const [eventState] = useEventContext();

  return (
    <>
      <div class="eventDisplayCont">
        <div class="podDisplayCont">
          <PlayerHopper />
          <For each={eventState().evtPods}>{(pod) => <PodCard />}</For>
          <PodPlusButton />
        </div>
      </div>
    </>
  );
}
