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
import { Player, SeatAddress } from "~/typing/eventTypes";
import PlayerCard from "../playerCard";
import eventController from ".";
import { effect } from "solid-js/web";

export default function EventController() {
  //Context State
  const [eventState, { updateEvent, makeEvent, addPlayer }] = useEventContext();
  //Local State
  const [storedEvent, setStoredEvent] = createSignal<string>();

  const [color, setColor] = createSignal<boolean>(false);

  const [ownersNeeded, setOwnersNeeded] = createSignal<number>(
    eventState().evtPods.length
  );
  const [playersNeeded, setPlayersNeeded] = createSignal<number>(
    eventState().evtPlayerList.length
  );
  // Values
  const evtControllerOwner = getOwner();

  onMount(() => {
    updateEvent({ evtLoading: false });
  });

  const setCookie = (name: string, value: string, days?: number) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  };

  const getCookie: (name: string) => string | null = (name: string) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const deleteCookie = (name: string) => {
    document.cookie = name + "=; Max-Age=-99999999";
  };

  return (
    <>
      <button
        style={{ "background-color": color() ? "green" : "none" }}
        onClick={() => {
          const staticEvent = JSON.stringify(eventState());
          setCookie("event", staticEvent);
          setColor(true);
          setStoredEvent(staticEvent);
        }}
      >
        Store Event
      </button>
      <button
        onClick={() => {
          const retrievedEvent = getCookie("event");
          if (retrievedEvent === null) {
            console.log("no event found");
          } else if (typeof retrievedEvent === "string") {
            makeEvent(JSON.parse(retrievedEvent));
          }
        }}
      >
        Use Stored Event
      </button>
      <button
        onClick={() => {
          deleteCookie("event");
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
