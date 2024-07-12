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
import { getEvent } from "vinxi/http";

export default function EventController() {
  //Context State
  const [eventState, { updateEvent, makeEvent, addPlayer }] = useEventContext();
  //Local State
  const [storing, setStoring] = createSignal<boolean>(false);
  const [ticker, setTicker] = createSignal<boolean>(true);
  // Values
  const evtControllerOwner = getOwner();

  onMount(() => {
    updateEvent({ evtLoading: false });
    if (localStorage.getItem("storing")) {
      if (localStorage.getItem("storing") === "true") {
        setStoring(true);
        if (retrievedEventData()) {
          makeEvent(retrievedEventData());
        }
      }
    } else {
      localStorage.setItem("storing", "false");
    }
  });

  const convertedEventData = () => {
    const safeEventData: SafeEvent = {
      ...eventState(),
      evtPods: eventState().evtPods.map((pod) => {
        const { podOwner, ...rest } = pod;

        return rest;
      }),
    };
    return safeEventData;
  };

  const saveEvent = (input: SafeEvent) => {
    console.log("saving event");
    const serializedEvtData = JSON.stringify(input);

    localStorage.setItem("savedEvent", serializedEvtData);
  };

  const retrievedEventData = () => {
    const rawEventData = localStorage.getItem("savedEvent");
    if (typeof rawEventData === "string") {
      const parsedEventData = JSON.parse(rawEventData);
      return parsedEventData;
    } else {
      return convertedEventData();
    }
  };

  createEffect(() => {
    if (storing() && ticker()) {
      console.log("test tick");
      const currentEventData = convertedEventData();
      const storedEventData = retrievedEventData();
      if (
        JSON.stringify(currentEventData) !== JSON.stringify(storedEventData)
      ) {
        saveEvent(currentEventData);
        setTicker(false);
        setTimeout(() => {
          setTicker(true);
        }, 300);
      }
    }
  });

  return (
    <>
      <button
        style={{
          "background-color": storing() ? "green" : "white",
          height: "3rem",
        }}
        onClick={() => {
          if (localStorage.getItem("storing") === "true") {
            localStorage.setItem("storing", "false");
            setStoring(false);
          } else if (localStorage.getItem("storing") === "false") {
            localStorage.setItem("storing", "true");

            setStoring(true);
          }
        }}
      >
        Store Event
      </button>
      <button
        onclick={() => {
          saveEvent(convertedEventData());
        }}
      >
        Test
      </button>
      <button
        onClick={() => {
          localStorage.removeItem("savedEvent");
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
