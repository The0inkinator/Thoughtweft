import { createSignal, runWithOwner } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import shrinkPod from "../../playerMgmtFunc/shrinkPod";

interface PodButtonInputs {
  podId: number;
}

export function RemovePodBtn({ podId }: PodButtonInputs) {
  const [eventState, { updatePlayer, updatePod, removePlayer, removePod }] =
    useEventContext();

  return (
    <button
      type="submit"
      style={{ color: "red" }}
      onClick={() => {
        eventState()
          .evtPlayerList.filter((player) => player.podId === podId)
          .map((foundPlayer) => {
            removePlayer(foundPlayer.id);
          });
        removePod(podId);
      }}
    >
      Remove Pod
    </button>
  );
}

export function ShrinkPod({ podId }: PodButtonInputs) {
  const [eventState, { updatePod }] = useEventContext();
  const thisPodState = () =>
    eventState().evtPods.find((pod) => pod.podId === podId);
  return (
    <button
      type="submit"
      style={{ color: "red" }}
      onClick={() => {
        runWithOwner(thisPodState()!.podOwner!, () => {
          shrinkPod(podId);
        });
        updatePod(podId, { menuOpen: false });
        updatePod(podId, { overlayOpen: false });
      }}
    >
      Shrink Pod
    </button>
  );
}
