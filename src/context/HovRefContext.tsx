import { createContext, useContext, createSignal } from "solid-js";

type HovRefState = [
  () => HTMLDivElement,
  {
    updateHovRef: (input: HTMLDivElement) => void;
  }
];

const HovRefContext = createContext<HovRefState | undefined>();

let proxElement: HTMLDivElement;

export function HovRefContextProvider(props: any) {
  const [hovRef, setHovRef] = createSignal<HTMLDivElement>(proxElement),
    hovRefState: HovRefState = [
      () => hovRef(),
      {
        updateHovRef(input: HTMLDivElement) {
          setHovRef(input);
        },
      },
    ];
  return (
    <HovRefContext.Provider value={hovRefState}>
      {props.children}
    </HovRefContext.Provider>
  );
}

export function useHovRefContext() {
  return useContext(HovRefContext)!;
}
