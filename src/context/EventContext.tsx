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
  podSize: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  registeredPlayers: number;
  podName?: string;
  podCube?: URL;
};

type Event = { pods: Pod[]; playerList: Player[] };

type EventState = [
  () => Event,
  {
    makeEvent: (newEvent: Event) => void;
    addPlayer: (newPlayer: string) => void;
    testSignal: () => void;
  }
];

//Create Sample Event

const SampleEvent: Event = {
  pods: [
    {
      podNumber: 1,
      podSize: 8,
      registeredPlayers: 0,
    },
    { podNumber: 2, podSize: 4, registeredPlayers: 0 },
  ],
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

        addPlayer(newPlayer) {
          const tempEvent = event();
          let newId = tempEvent.playerList.length;
          let newName = newPlayer;
          let newPodNumber = openPods()[0].podNumber;
          let playerToAdd: Player = {
            id: newId,
            name: newName,
            pod: newPodNumber,
          };

          setEvent((prevEvent) => {
            const updatedPlayerList = [...prevEvent.playerList, playerToAdd];

            return { ...prevEvent, playerList: updatedPlayerList };
          });
        },

        testSignal() {
          setEvent(SampleEvent);
        },
      },
    ];

  const refreshEvent = () => {
    const updatedEvent = event();
    setEvent(updatedEvent);
  };

  const openPods = () => {
    let potentialPods = event().pods.filter(
      (pod) => pod.registeredPlayers < pod.podSize
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
