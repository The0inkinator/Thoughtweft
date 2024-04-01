import { createSignal, createContext, useContext } from "solid-js";

//Establish Typing

export type Record = [number, number, number];

export type Player = {
  id: number;
  name: string;
  pod: number;
  seat: number;
  matchRecord?: Record;
  eventRecord?: Record;
};

export type Seat = {
  podNumber: number;
  seatNumber: number;
  filled: boolean;
  xpos?: number;
  ypos?: number;
  seatRef?: HTMLDivElement;
};

type SeatUpdateParam = HTMLDivElement | boolean;

export type Pod = {
  podNumber: number;
  podSize: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  podName?: string;
  podCube?: URL;
};

export type EventSettings = {
  playerCap: number;
};

export type Event = {
  evtPods: Pod[];
  evtSeats: Seat[];
  evtPlayerList: Player[];
  evtSettings: EventSettings;
};

type EventState = [
  () => Event,
  {
    makeEvent: (newEvent: Event) => void;
    addPlayer: ({ name }: Player) => void;
    addPod: (podSize: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12) => void;
    removePod: (podNumber: number) => void;
    editPodSize: ({ podNumber, podSize }: Pod) => void;
    updateSeatsInPod: (podNumber: number) => void;
    updateSeat: (
      podNumber: number,
      seatNumber: number,
      updateParam: SeatUpdateParam
    ) => void;
  }
];

//Create Sample Event

const SampleEvent: Event = {
  evtPods: [{ podNumber: 1, podSize: 8 }],
  evtSeats: [{ podNumber: 0, seatNumber: 0, filled: false }],
  evtPlayerList: [
    { id: 0, name: "Keldan", pod: 0, seat: 0 },
    { id: 1, name: "Colton", pod: 0, seat: 0 },
    { id: 2, name: "Aiden", pod: 0, seat: 0 },
    { id: 3, name: "Harrison", pod: 0, seat: 0 },
    { id: 4, name: "Josh", pod: 0, seat: 0 },
    { id: 5, name: "Daniel", pod: 0, seat: 0 },
    { id: 6, name: "Jesse", pod: 0, seat: 0 },
    { id: 7, name: "Jack", pod: 0, seat: 0 },
  ],
  evtSettings: { playerCap: 0 },
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
        addPlayer({ name }) {},
        addPod(podSize) {
          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt };

            const newPod: Pod = {
              podNumber: newEvt.evtPods.length + 1,
              podSize: podSize,
            };
            newEvt.evtPods = [...newEvt.evtPods, newPod];
            return newEvt;
          });
        },
        removePod(podNumber) {
          setEvent((preEvt) => {
            const newEvt = { ...preEvt };
            const podIndex = newEvt.evtPods.findIndex(
              (pod) => pod.podNumber === podNumber
            );
            newEvt.evtPods.splice(podIndex, 1);
            return newEvt;
          });
        },
        editPodSize({ podNumber, podSize }) {
          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt };
            const podToChangeIndex = newEvt.evtPods.findIndex(
              (pod) => pod.podNumber === podNumber
            );
            if (podToChangeIndex !== -1) {
              newEvt.evtPods[podToChangeIndex] = {
                ...newEvt.evtPods[podToChangeIndex],
                podSize,
              };
              return newEvt;
            } else {
              console.log("no pod to change");
              return prevEvt;
            }
          });
        },
        updateSeatsInPod(podNumber) {
          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt };
            const newPodSize = newEvt.evtPods.find(
              (pod) => pod.podNumber === podNumber
            )!.podSize;
            const seatsInPod = () => {
              return newEvt.evtSeats.filter(
                (seat) => seat.podNumber === podNumber
              );
            };

            if (seatsInPod().length > newPodSize) {
              const seatsToRemove = seatsInPod().length - newPodSize;
              newEvt.evtSeats = [...newEvt.evtSeats.slice(0, -seatsToRemove)];
              return newEvt;
            } else if (seatsInPod().length < newPodSize) {
              const seatsToAdd = newPodSize - seatsInPod().length;
              for (let i = 0; i < seatsToAdd; i++) {
                const newSeat: Seat = {
                  podNumber: podNumber,
                  seatNumber: seatsInPod().length + 1,
                  filled: true,
                };
                newEvt.evtSeats = [...newEvt.evtSeats, newSeat];
              }
              return newEvt;
            } else {
              return prevEvt;
            }
          });
        },
        updateSeat(
          podNumber: number,
          seatNumber: number,
          updateParam: SeatUpdateParam
        ) {
          if (updateParam instanceof HTMLDivElement) {
            const seatIndex = () => {
              return event().evtSeats.findIndex(
                (seat) =>
                  seat.podNumber === podNumber && seat.seatNumber === seatNumber
              );
            };

            if (seatIndex() !== -1) {
              event().evtSeats[seatIndex()].seatRef = updateParam;
            }
          } else if (typeof updateParam === "boolean") {
            const seatIndex = () => {
              return event().evtSeats.findIndex(
                (seat) =>
                  seat.podNumber === podNumber && seat.seatNumber === seatNumber
              );
            };

            if (seatIndex() !== -1) {
              event().evtSeats[seatIndex()].filled = updateParam;
            }
          }
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
