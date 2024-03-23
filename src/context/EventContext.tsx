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
};

export type Pod = {
  podNumber: number;
  podSize: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  podName?: string;
  podCube?: URL;
};

export type Event = { pods: Pod[]; slots: Slot[]; playerList: Player[] };

type EventState = [
  () => Event,
  {
    makeEvent: (newEvent: Event) => void;
    updateSlotPos: (pod: number, slotNum: number, x: number, y: number) => void;
  }
];

//Create Sample Event

const SampleEvent: Event = {
  pods: [
    { podNumber: 1, podSize: 8 },
    { podNumber: 2, podSize: 12 },
    { podNumber: 3, podSize: 4 },
  ],
  slots: [],
  playerList: [{ id: 0, name: "Keldan", pod: 1 }],
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
        updateSlotPos(pod, slotNum, x, y) {
          setEvent((prevEvent) => {
            let newSlots = prevEvent.slots;
            let slotToUpdate = newSlots.findIndex(
              (slot) => slot.numberInPod === slotNum && slot.podNumber === pod
            );

            if (slotToUpdate !== -1) {
              newSlots[slotToUpdate].xpos = x;
              newSlots[slotToUpdate].ypos = y;
              return { ...prevEvent, slots: newSlots };
            } else {
              return prevEvent;
            }
          });
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
