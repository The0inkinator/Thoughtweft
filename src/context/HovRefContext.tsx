import { createContext, useContext, createSignal } from "solid-js";

const HovRefContext = createContext<any>();

export function HovRefContextProvider(props: any) {
  const [hovRef, setHovRef] = createSignal<HTMLDivElement>(),
    hovRefState = [
      hovRef(),
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
  return useContext(HovRefContext);
}
