import styles from "./eventController.module.css";
import { For, createEffect, createSignal, onMount } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import PlayerHopper from "../playerHopper";
import PodCard from "../podCard";
import PodPlusButton from "../podPlusButton";

export default function EventController() {
  //Context State
  const [eventState, { updateSeat, updatePlayer, makeEvent }] =
    useEventContext();
  //Local State
  const [storedEvent, setStoredEvent] = createSignal<string>(
    JSON.stringify(eventState())
  );

  return (
    <>
      <button
        onClick={() => {
          const staticEvent = JSON.stringify(eventState());
          setStoredEvent(staticEvent);
        }}
      >
        Store Event
      </button>
      <button
        onClick={() => {
          makeEvent(JSON.parse(storedEvent()));
        }}
      >
        Use Stored Event
      </button>
      <div class={styles.eventController}>
        <div class={styles.podCNT}>
          <PlayerHopper />
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
