import { onMount, Show } from "solid-js";
import styles from "./podOverlay.module.css";
import { useEventContext } from "~/context/EventContext";
import PlayerMenu from "~/components/eventManagement/playerCard/playerMenu/PlayerMenu";

interface PodOverlayInputs {
  podId: number;
}

export default function PodOverlay({ podId }: PodOverlayInputs) {
  const [eventState, { updatePod, updatePlayer }] = useEventContext();
  const thisPodState = () =>
    eventState().evtPods.find((pod) => pod.podId === podId);
  const openPlayerMenu = () =>
    eventState().evtPlayerList.find((player) => player.menuOpen);
  return (
    <Show when={thisPodState()?.overlayOpen}>
      <div class={styles.podOverlay}>
        <Show when={openPlayerMenu()}>
          <PlayerMenu playerId={openPlayerMenu()!.id} podId={podId} />
        </Show>
        <button
          onClick={() => {
            updatePod(podId, { overlayOpen: false });
            updatePod(podId, { menuOpen: false });
            if (openPlayerMenu()) {
              updatePlayer(openPlayerMenu()!.id, { menuOpen: false });
            }
          }}
          class={styles.closeButton}
        >
          Close
        </button>
      </div>
    </Show>
  );
}
