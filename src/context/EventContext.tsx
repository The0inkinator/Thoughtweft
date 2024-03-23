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

type Event = { pods: Pod[]; totalPlayers: number };

type EventState = [
  () => Event,
  {
    makeEvent: (newEvent: Event) => void;
    addPlayer: (newPlayer: string) => void;
  }
];

//Create Sample Event

const SampleEvent: Event = {
  pods: [
    { podNumber: 1, podSize: 8, registeredPlayers: [] },
    { podNumber: 2, podSize: 4, registeredPlayers: [] },
  ],
  totalPlayers: 0,
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

        addPlayer(newPlayer) {
          let newId = event().totalPlayers + 1;
          let newName = newPlayer;
          let newPodNumber = openPods()[0].podNumber;
          let playerToAdd: Player = {
            id: newId,
            name: newName,
            pod: newPodNumber,
          };

          const receivingPod = event().pods.find(
            (pod) => pod.podNumber === newPodNumber
          );

          if (receivingPod) {
            receivingPod.registeredPlayers.push(playerToAdd);
            let currentTotalPlayers = event().totalPlayers;
            event().totalPlayers = currentTotalPlayers + 1;
          } else {
            console.log("Pod not found");
          }
        },
      },
    ];

  const openPods = () => {
    let potentialPods = event().pods.filter(
      (pod) => pod.registeredPlayers.length < pod.podSize
    );
    return potentialPods;
  };

  return (
    <EventContext.Provider value={eventState}>
      {props.children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  return useContext(EventContext)!;
}
