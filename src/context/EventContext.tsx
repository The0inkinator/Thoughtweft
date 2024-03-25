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

export type Event = { pods: Pod[]; slots: Slot[]; playerList: Player[] };

type EventState = [
  () => Event,
  {
    makeEvent: (newEvent: Event) => void;
    updateSlot: (
      pod: number,
      slotNum: number,
      x?: number,
      y?: number,
      inputSlotRef?: HTMLDivElement
    ) => void;
  }
];

//Create Sample Event

const SampleEvent: Event = {
  pods: [{ podNumber: 1, podSize: 8 }],
  slots: [],
  playerList: [{ id: 0, name: "Keldan" }],
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
        updateSlot(pod, slotNum, x, y, inputSlotRef) {
          setEvent((prevEvent) => {
            let newSlots = prevEvent.slots;
            let slotToUpdate = newSlots.findIndex(
              (slot) => slot.numberInPod === slotNum && slot.podNumber === pod
            );

            if (slotToUpdate !== -1) {
              newSlots[slotToUpdate].xpos = x;
              newSlots[slotToUpdate].ypos = y;
              newSlots[slotToUpdate].slotRef = inputSlotRef;
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
