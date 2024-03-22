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
    addPlayerToList: (inputName: string, inputId: number) => void;
    editPlayerInList: (idToEdit: number, newName: string) => void;
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

        addPlayerToList(inputName: string, inputId: number) {
          const NewPlayer = { name: inputName, id: inputId };
          const tempPlayerList: Player[] = [...playersList(), NewPlayer];
          setPlayersList(tempPlayerList);
        },

        editPlayerInList(idToEdit: number, newName: string) {
          const updatePlayer = () => {
            setPlayersList((prevList) => {
              const newList = [...prevList];
              newList[idToEdit - 1].name = newName;
              return newList;
            });
          };

          updatePlayer();
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
