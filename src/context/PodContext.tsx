import { createSignal, createContext, useContext } from "solid-js";

type Pod = {
  podNumber: number;
  podSize: number;
  registeredPlayers: number;
  podName?: string;
  cubePlayed?: URL;
};

type PodState = [
  () => Pod[],
  {
    changePod: (input: any) => void;
  }
];

const PodContext = createContext<PodState | undefined>();

export function PodContextProvider(props: any) {
  const [podList, setPodList] = createSignal<Pod[]>([
      { podNumber: 1, podSize: 8, registeredPlayers: 0 },
      { podNumber: 2, podSize: 8, registeredPlayers: 0 },
    ]),
    podState: PodState = [
      () => podList(),
      {
        changePod(input) {
          setPodList(input);
        },
      },
    ];

  return (
    <PodContext.Provider value={podState}>{props.children}</PodContext.Provider>
  );
}

export function usePodContext() {
  return useContext(PodContext)!;
}
