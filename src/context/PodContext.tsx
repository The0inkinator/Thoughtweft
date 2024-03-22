import { createSignal, createContext, useContext } from "solid-js";

type Pod = {
  podNumber: number;
  podSize: number;
  cubePlayed?: URL;
};

type PodState = [() => Pod[]];

const PodContext = createContext<PodState | undefined>();

export function PodContextProvider(props: any) {
  const [podList, setPodList] = createSignal<Pod[]>([]),
    podState: PodState = [() => podList()];

  return (
    <PodContext.Provider value={podState}>{props.children}</PodContext.Provider>
  );
}

export function usePodContext() {
  return useContext(PodContext)!;
}
