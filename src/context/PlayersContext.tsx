import { createSignal, createContext, useContext } from "solid-js";

type Record = [number, number, number];

interface Player {
  name: string;
  id: number;
  pod?: number | null;
  matchRecord?: Record | null;
  eventRecord?: Record | null;
}

type PlayerState = [
  () => Player[],
  {
    makePlayersList: (list: Player[]) => void;
    addPlayerToList: (player: Player) => void;
    editPlayerInList: (edit: Player, pos: number) => void;
  }
];

const PlayersContext = createContext<PlayerState | undefined>();

export function PlayersProvider(props: any) {
  const [playersList, setPlayersList] = createSignal<Player[]>([
      { name: "Keldan", id: 1 },
    ]),
    playersState: PlayerState = [
      () => playersList(),
      {
        makePlayersList(list: Player[]) {
          setPlayersList(list);
        },

        addPlayerToList(player: Player) {
          if (player.name && player.id) {
            const tempPlayerList: Player[] = [...playersList(), player];
            setPlayersList(tempPlayerList);
          } else {
            console.log("not a player");
          }
        },

        editPlayerInList(edit: Player, pos: number) {
          console.log(edit, pos);
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
  return useContext(PlayersContext)!;
}
