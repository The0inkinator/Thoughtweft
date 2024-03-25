import "./eventDisplay.css";
import { For, createEffect, createSignal, onMount } from "solid-js";
import { useEventContext } from "~/context/EventContext";

export default function EventDisplay() {
  //Context State
  const [eventState, { makeEvent }] = useEventContext();

  return (
    <>
      <div id="eventDisplayHeader"></div>
      <div class="eventDisplayContainer"></div>
    </>
  );
}
