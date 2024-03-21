import { createSignal, createContext, useContext } from "solid-js";

const PlayersContext = createContext();

type Record = [number, number, number];

interface Player {
  name: string;
  pod?: number | null;
  matchRecord?: Record | null;
  eventRecord?: Record | null;
}

export function PlayersProvider(props: any) {
  const [playersList, setPlayersList] = createSignal<Player[]>([
      { name: "Keldan", pod: 1 },
    ]),
    playersState = [
      playersList,
      {
        makePlayersList(list: Player[]) {
          setPlayersList(list);
        },
      },
    ];

  return (
    <PlayersContext.Provider value={playersState}>
      {props.children}
    </PlayersContext.Provider>
  );
}

export function usePlayersContext() {
  return useContext(PlayersContext);
}
