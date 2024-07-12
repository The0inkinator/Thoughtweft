import styles from "./eventController.module.css";
import {
  For,
  createEffect,
  createSignal,
  getOwner,
  onMount,
  runWithOwner,
} from "solid-js";
import { useEventContext } from "~/context/EventContext";
import PlayerHopper from "../playerHopper";
import PodCard from "../podCard";
import PodPlusButton from "../podPlusButton";
import { Player, SafeEvent, SeatAddress } from "~/typing/eventTypes";
import PlayerCard from "../playerCard";
import eventController from ".";
import { effect } from "solid-js/web";

export default function EventController() {
  //Context State
  const [eventState, { updateEvent, makeEvent, addPlayer }] = useEventContext();
  //Local State
  const [storedEvent, setStoredEvent] = createSignal<string>();

  const [color, setColor] = createSignal<boolean>(false);
  // Values
  const evtControllerOwner = getOwner();

  onMount(() => {
    updateEvent({ evtLoading: false });
    const rawEventData = localStorage.getItem("savedEvent");
    if (typeof rawEventData === "string") {
      const parsedEventData = JSON.parse(rawEventData);
      makeEvent(parsedEventData);
    }
  });

  return (
    <>
      <button
        style={{ "background-color": color() ? "green" : "none" }}
        onClick={() => {
          const safeEventData: SafeEvent = {
            ...eventState(),
            evtPods: eventState().evtPods.map((pod) => {
              const { podOwner, ...rest } = pod;

              return rest;
            }),
          };
          const serializedEvtData = JSON.stringify(safeEventData);

          localStorage.setItem("savedEvent", serializedEvtData);
        }}
      >
        Store Event
      </button>
      <button onClick={() => {}}>Use Stored Event</button>
      <button
        onClick={() => {
          localStorage.clear();
        }}
      >
        Delete Stored Event
      </button>
      <div class={styles.eventController}>
        <div class={styles.podCNT}>
          {/* <PlayerHopper /> */}
          <For each={eventState().evtPods}>
            {(pod) => (
              <PodCard
                podSize={pod.podSize}
                podNumber={pod.podNumber}
                podId={pod.podId}
              />
            )}
          </For>
          <PodPlusButton />
        </div>
      </div>
    </>
  );
}
