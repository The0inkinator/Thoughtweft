import { createSignal, createContext, useContext } from "solid-js";

//Establish Typing

type Record = [number, number, number];

type Player = {
  id: number;
  name: string;
  pod: number;
  matchRecord?: Record;
  eventRecord?: Record;
};

type Pod = {
  podNumber: number;
  podSize: number;
  registeredPlayers: Player[];
  podName?: string;
  podCube?: URL;
};

type Event = Pod[];

type EventState = [
  () => Pod[],
  {
    makeEvent: (newEvent: Event) => void;
  }
];

//Create Sample Event

const SampleEvent: Event = [
  { podNumber: 1, podSize: 8, registeredPlayers: [] },
  { podNumber: 1, podSize: 4, registeredPlayers: [] },
];

const EventContext = createContext<EventState | undefined>();

export function EventContextProvider(props: any) {
  const [event, setEvent] = createSignal<Event>(SampleEvent),
    eventState: EventState = [
      () => event(),
      {
        makeEvent(newEvent: Event) {
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
