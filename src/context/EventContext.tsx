import { createSignal, createContext, useContext } from "solid-js";

//Establish Typing

export type Record = [number, number, number];

export type Player = {
  id: number;
  name: string;
  pod?: number;
  slot?: number;
  matchRecord?: Record;
  eventRecord?: Record;
};

export type Slot = {
  podNumber: number;
  numberInPod: number;
  filled: boolean;
  xpos?: number;
  ypos?: number;
  slotRef?: HTMLDivElement;
};

export type Pod = {
  podNumber: number;
  podSize: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  podName?: string;
  podCube?: URL;
};

export type Event = {
  evtPods: Pod[];
  evtSlots: Slot[];
  evtPlayerList: Player[];
};

type EventState = [
  () => Event,
  {
    makeEvent: (newEvent: Event) => void;
  }
];

//Create Sample Event

const SampleEvent: Event = {
  evtPods: [{ podNumber: 1, podSize: 8 }],
  evtSlots: [],
  evtPlayerList: [
    { id: 0, name: "Keldan" },
    { id: 1, name: "Colton" },
    { id: 2, name: "Aiden" },
    { id: 3, name: "Harrison" },
    { id: 4, name: "Josh" },
    { id: 5, name: "Daniel" },
    { id: 6, name: "Jesse" },
    { id: 7, name: "Jack" },
  ],
};

const EventContext = createContext<EventState | undefined>();

export function EventContextProvider(props: any) {
  const [event, setEvent] = createSignal<Event>(SampleEvent),
    eventState: EventState = [
      () => event(),
      {
        makeEvent(newEvent) {
          setEvent(newEvent);
        },
      },
    ];

  return (
    <EventContext.Provider value={eventState}>
      {props.children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  return useContext(EventContext)!;
}
