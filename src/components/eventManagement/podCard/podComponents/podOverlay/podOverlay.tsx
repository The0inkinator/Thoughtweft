import { onMount, Show } from "solid-js";
import styles from "./podOverlay.module.css";
import { useEventContext } from "~/context/EventContext";

interface PodOverlayInputs {
  podId: number;
}

export default function PodOverlay({ podId }: PodOverlayInputs) {
  const [eventState] = useEventContext();
  const thisPodState = () =>
    eventState().evtPods.find((pod) => pod.podId === podId);
  return (
    <Show when={thisPodState()?.menuOpen}>
      <div class={styles.podOverlay}></div>;
    </Show>
  );
}
