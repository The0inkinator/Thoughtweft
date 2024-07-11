import { createSignal } from "solid-js";
import { useEventContext } from "~/context/EventContext";

interface PodButtonInputs {
  podId: number;
}

export function PlayerCloseButton({ podId }: PodButtonInputs) {
  const [eventState, { updatePlayer, updatePod }] = useEventContext();

  return (
    <div
      style={{ "background-color": "red", width: "2rem", height: "2rem" }}
      onClick={() => {}}
    ></div>
  );
}
