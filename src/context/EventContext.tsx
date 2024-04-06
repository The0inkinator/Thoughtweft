import { createSignal, createContext, useContext } from "solid-js";

//Establish Typing

export type Record = [number, number, number];

export type PodSizes = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type SeatUpdateParam = HTMLDivElement | boolean;

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
  seatRef?: HTMLDivElement;
};

export type Pod = {
  podId: number;
  podNumber: number;
  podSize: PodSizes;
  podSeats: Seat[];
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
  visuals: "default" | "animating";
};

type EventState = [
  () => Event,
  {
    makeEvent: (newEvent: Event) => void;
    addPlayer: ({ name }: Player) => void;
    addPod: (inputPodSize: PodSizes) => void;
    removePod: (inputPodNumber: number) => void;
    editPodSize: (inputPodNumber: number, inputPodSize: PodSizes) => void;
    updatePodSize: (inputPodNumber: number, newPodSize: number) => void;
    updateSeat: (
      inputPodNumber: number,
      inputSeatNumber: number,
      updateParam: SeatUpdateParam
    ) => void;
  }
];

//Create Sample Event

const SampleEvent: Event = {
  evtPods: [
    {
      podId: 0,
      podNumber: 1,
      podSize: 8,
      podSeats: [
        { podNumber: 1, seatNumber: 1, filled: false },
        { podNumber: 1, seatNumber: 2, filled: false },
        { podNumber: 1, seatNumber: 3, filled: false },
      ],
    },
  ],
  evtSeats: [{ podNumber: 0, seatNumber: 0, filled: false }],
  evtPlayerList: [
    { id: 0, name: "Keldan", pod: 1, seat: 2 },
    { id: 1, name: "Colton", pod: 0, seat: 0 },
    { id: 2, name: "Aiden", pod: 0, seat: 0 },
    { id: 3, name: "Harrison", pod: 0, seat: 0 },
    { id: 4, name: "Josh", pod: 0, seat: 0 },
    { id: 5, name: "Daniel", pod: 0, seat: 0 },
    { id: 6, name: "Jesse", pod: 0, seat: 0 },
    { id: 7, name: "Jack", pod: 0, seat: 0 },
  ],
  evtSettings: { playerCap: 0 },
  visuals: "default",
};

const EventContext = createContext<EventState | undefined>();

export function EventContextProvider(props: any) {
  const [event, setEvent] = createSignal<Event>(SampleEvent),
    eventState: EventState = [
      () => event(),
      {
        //MAKE EVENT
        makeEvent(newEvent) {
          setEvent(newEvent);
        },

        //ADD PLAYER
        addPlayer({ name }) {},

        //ADD POD
        addPod(inputPodSize) {
          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt };

            const newPodSeats: Seat[] = (() => {
              const tempArray = [];
              for (let i = 1; i <= inputPodSize; i++) {
                const newSeat: Seat = {
                  podNumber: newEvt.evtPods.length + 1,
                  seatNumber: i,
                  filled: false,
                };
                tempArray.push(newSeat);
              }

              return tempArray;
            })();

            const newPod: Pod = {
              podId: newEvt.evtPods.length + 1,
              podNumber: newEvt.evtPods.length + 1,
              podSize: inputPodSize,
              podSeats: newPodSeats,
            };
            newEvt.evtPods = [...newEvt.evtPods, newPod];
            return newEvt;
          });
        },

        //REMOVE POD
        removePod(inputPodNumber) {
          // event()
          //   .evtPods.filter((pod) => pod.podNumber > podNumber)
          //   .map((pod) => {
          //     const newPodNumber = pod.podNumber - 1;
          //     pod.podNumber = newPodNumber;
          //     pod.podSeats.map((seat) => {
          //       seat.podNumber = newPodNumber;
          //     });
          //   });
          setEvent((preEvt) => {
            const newEvt = { ...preEvt };
            const podIndex = newEvt.evtPods.findIndex(
              (pod) => pod.podNumber === inputPodNumber
            );
            newEvt.evtPods.splice(podIndex, 1);

            newEvt.evtPods.map((pod, podIndex) => {
              const newPodNumber = podIndex + 1;
              if (pod.podNumber !== newPodNumber) {
                newEvt.evtPods[podIndex] = {
                  ...newEvt.evtPods[podIndex],
                  podNumber: newPodNumber,
                };

                newEvt.evtPods[podIndex].podSeats.map(
                  (mappedSeat, seatIndex) => {
                    newEvt.evtPods[podIndex].podSeats[seatIndex] = {
                      ...newEvt.evtPods[podIndex].podSeats[seatIndex],
                      podNumber: newPodNumber,
                    };
                  }
                );
              }
            });

            return newEvt;
          });
        },

        //EDIT POD SIZE
        editPodSize(
          inputPodNumber: number,
          inputPodSize: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
        ) {
          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt };
            const podToChangeIndex = newEvt.evtPods.findIndex(
              (pod) => pod.podNumber === inputPodNumber
            );
            if (podToChangeIndex !== -1) {
              newEvt.evtPods[podToChangeIndex] = {
                ...newEvt.evtPods[podToChangeIndex],
                podSize: inputPodSize,
              };
              return newEvt;
            } else {
              console.log("no pod to change");
              return prevEvt;
            }
          });
        },

        //UPDATE POD SIZE
        updatePodSize(inputPodNumber, newPodSize) {
          const podToEdit = event().evtPods.find(
            (pod) => pod.podNumber === inputPodNumber
          );

          const podToEditIndex = event().evtPods.findIndex(
            (pod) => pod.podNumber === inputPodNumber
          );

          if (podToEdit && podToEditIndex >= 0) {
            podToEdit.podSize = newPodSize as PodSizes;

            const podDifference = podToEdit.podSize - podToEdit.podSeats.length;

            if (podDifference > 0) {
              setEvent((prevEvt) => {
                const newEvt = { ...prevEvt };
                const seatsStartingLength = podToEdit.podSeats.length;
                for (let i = 1; i <= podDifference; i++) {
                  const newSeat: Seat = {
                    podNumber: inputPodNumber,
                    seatNumber: seatsStartingLength + i,
                    filled: false,
                  };
                  newEvt.evtPods[podToEditIndex].podSeats = [
                    ...newEvt.evtPods[podToEditIndex].podSeats,
                    newSeat,
                  ];
                }
                return newEvt;
              });
            } else if (podDifference < 0) {
              const seatNumToCut = Math.abs(podDifference);
              const seatsStartingLength = podToEdit.podSeats.length;
              setEvent((preEvt) => {
                const newEvt = { ...preEvt };

                newEvt.evtPods[podToEditIndex].podSeats = [
                  ...newEvt.evtPods[podToEditIndex].podSeats.slice(
                    0,
                    seatsStartingLength - seatNumToCut
                  ),
                ];
                return newEvt;
              });
            } else {
              console.log(`No updates to pod ${inputPodNumber}`);
            }
          }
        },

        //UPDATE SEAT
        updateSeat(
          inputPodNumber: number,
          inputSeatNumber: number,
          updateParam: SeatUpdateParam
        ) {
          if (updateParam instanceof HTMLDivElement) {
            const seatIndex = () => {
              return event().evtSeats.findIndex(
                (seat) =>
                  seat.podNumber === inputPodNumber &&
                  seat.seatNumber === inputSeatNumber
              );
            };

            if (seatIndex() !== -1) {
              event().evtSeats[seatIndex()].seatRef = updateParam;
            }
          } else if (typeof updateParam === "boolean") {
            const seatIndex = () => {
              return event().evtSeats.findIndex(
                (seat) =>
                  seat.podNumber === inputPodNumber &&
                  seat.seatNumber === inputSeatNumber
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
