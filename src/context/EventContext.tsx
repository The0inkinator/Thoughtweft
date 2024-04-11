import { createSignal, createContext, useContext } from "solid-js";
import playerHopper from "~/components/eventManagement/playerHopper";
import {
  Pod,
  Player,
  PodSizes,
  Event,
  SeatUpdateParam,
  FullSeat,
  ProxySeat,
} from "~/typing/eventTypes";

//Typing

type EventState = [
  () => Event,
  {
    makeEvent: (newEvent: Event) => void;
    addPlayer: ({ name }: Player) => void;
    addPod: (inputPodSize: PodSizes) => void;
    removePod: (inputPodId: number) => void;
    updatePodSize: (inputPodId: number, newPodSize: number) => void;
    updateSeat: (
      inputPodId: number,
      inputSeatNumber: number,
      updateParam: SeatUpdateParam
    ) => void;
    setPlayerHopperEl: (inputElement: HTMLElement) => void;
  }
];

//Create Sample Event

const SampleEvent: Event = {
  evtPods: [
    {
      podId: 1,
      podNumber: 1,
      podSize: 8,
      podSeats: [],
    },
  ],
  evtSeats: [],
  evtPlayerList: [
    { id: 0, name: "Keldan", pod: 1, seat: 5 },
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
  nextPodId: 2,
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

            const newFullSeats: FullSeat[] = (() => {
              const tempArray = [];
              for (let i = 1; i <= inputPodSize; i++) {
                const newFullSeat: FullSeat = {
                  podId: event().nextPodId,
                  seatNumber: i,
                  filled: false,
                };
                tempArray.push(newFullSeat);
              }
              return tempArray;
            })();

            const newMarkerSeats: ProxySeat[] = (() => {
              const tempArray = [];
              for (let i = 1; i <= inputPodSize; i++) {
                const newFullSeat: ProxySeat = {
                  podId: event().nextPodId,
                  seatNumber: i,
                };
                tempArray.push(newFullSeat);
              }

              return tempArray;
            })();

            newEvt.evtSeats = [...newEvt.evtSeats, ...newMarkerSeats];

            const newPod: Pod = {
              podId: event().nextPodId,
              podNumber: newEvt.evtPods.length + 1,
              podSize: inputPodSize,
              podSeats: newFullSeats,
            };

            newEvt.evtPods = [...newEvt.evtPods, newPod];
            const newId = event().nextPodId + 1;
            newEvt.nextPodId = newId;
            return newEvt;
          });
        },

        //REMOVE POD
        removePod(inputPodId) {
          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt };

            const podIndexToRemove = newEvt.evtPods.findIndex(
              (pod) => pod.podId === inputPodId
            );
            //remove all proxy seats
            newEvt.evtSeats = newEvt.evtSeats.filter(
              (seat) => seat.podId !== inputPodId
            );
            //remove the pod
            if (podIndexToRemove !== -1) {
              newEvt.evtPods.splice(podIndexToRemove, 1);
            }

            //update pod #s
            newEvt.evtPods.map((pod, index) => {
              if (pod.podNumber !== index + 1) {
                newEvt.evtPods[index].podNumber = index + 1;
              }
            });

            return newEvt;
          });
        },

        //UPDATE POD SIZE
        updatePodSize(inputPodId, newPodSize) {
          const podToEdit = event().evtPods.find(
            (pod) => pod.podId === inputPodId
          );
          const podToEditIndex = event().evtPods.findIndex(
            (pod) => pod.podId === inputPodId
          );

          if (podToEdit && podToEditIndex >= 0) {
            podToEdit.podSize = newPodSize as PodSizes;
            const podDifference = podToEdit.podSize - podToEdit.podSeats.length;
            if (podDifference > 0) {
              setEvent((prevEvt) => {
                const newEvt = { ...prevEvt };
                const seatsStartingLength = podToEdit.podSeats.length;

                //add new fullSeats
                for (let i = 1; i <= podDifference; i++) {
                  const newSeat: FullSeat = {
                    podId: inputPodId,
                    seatNumber: seatsStartingLength + i,
                    filled: false,
                  };
                  newEvt.evtPods[podToEditIndex].podSeats = [
                    ...newEvt.evtPods[podToEditIndex].podSeats,
                    newSeat,
                  ];
                }

                //add new proxySeats
                for (let i = 1; i <= podDifference; i++) {
                  const newSeat: ProxySeat = {
                    podId: inputPodId,
                    seatNumber: seatsStartingLength + i,
                  };
                  newEvt.evtSeats = [...newEvt.evtSeats, newSeat];
                }
                return newEvt;
              });
            } else if (podDifference < 0) {
              const seatNumToCut = Math.abs(podDifference);
              const seatsStartingLength = podToEdit.podSeats.length;
              setEvent((preEvt) => {
                const newEvt = { ...preEvt };

                //remove fullSeats
                newEvt.evtPods[podToEditIndex].podSeats = [
                  ...newEvt.evtPods[podToEditIndex].podSeats.slice(
                    0,
                    seatsStartingLength - seatNumToCut
                  ),
                ];

                //remove proxySeats

                newEvt.evtSeats = newEvt.evtSeats.filter(
                  (seat) =>
                    seat.podId !== inputPodId ||
                    (seat.podId === inputPodId &&
                      seat.seatNumber <= seatsStartingLength - seatNumToCut)
                );

                return newEvt;
              });
            } else {
              console.log(`No updates to pod ID: ${inputPodId}`);
            }
          }
        },

        //UPDATE SEAT
        updateSeat(
          inputPodId: number,
          inputSeatNumber: number,
          updateParam: SeatUpdateParam
        ) {
          const podIndex = event().evtPods.findIndex(
            (pod) => pod.podId === inputPodId
          );
          const seatIndex = event().evtPods[podIndex].podSeats.findIndex(
            (seat) => seat.seatNumber === inputSeatNumber
          );
          if (updateParam instanceof HTMLDivElement) {
            if (seatIndex !== -1) {
              event().evtPods[podIndex].podSeats[seatIndex].seatRef =
                updateParam;
            }
          } else if (typeof updateParam === "boolean") {
            if (seatIndex !== -1) {
              event().evtPods[podIndex].podSeats[seatIndex].filled =
                updateParam;
            }
          }
        },
        setPlayerHopperEl(inputElement) {
          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt, playerHopper: inputElement };
            return newEvt;
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
