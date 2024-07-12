import { createSignal, runWithOwner, Switch, Match } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import shrinkPod from "../../playerMgmtFunc/shrinkPod";
import shufflePod from "../../playerMgmtFunc/shufflePod";

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
            console.log(foundPlayer);
            removePlayer(foundPlayer.id);
          });
        removePod(podId);
      }}
    >
      Remove Pod
    </button>
  );
}

export function ShrinkPodBtn({ podId }: PodButtonInputs) {
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

export function ShufflePlayersBtn({ podId }: PodButtonInputs) {
  const [eventState, { updatePod }] = useEventContext();
  const [shuffleMode, setShuffleMode] = createSignal<"default" | "confirm">(
    "default"
  );
  const thisPodState = () =>
    eventState().evtPods.find((pod) => pod.podId === podId);

  return (
    <Switch fallback={<></>}>
      <Match when={shuffleMode() === "default"}>
        <button
          type="submit"
          style={{ color: "red" }}
          onClick={() => {
            setShuffleMode("confirm");
          }}
        >
          Shuffle Players
        </button>
      </Match>
      <Match when={shuffleMode() === "confirm"}>
        <button type="submit" style={{ color: "black" }}>
          Are you Sure?
        </button>
        <button
          type="submit"
          style={{ color: "green" }}
          onClick={() => {
            runWithOwner(thisPodState()!.podOwner!, () => {
              shufflePod(podId);
            });
            setShuffleMode("default");
            updatePod(podId, { menuOpen: false });
            updatePod(podId, { overlayOpen: false });
          }}
        >
          ✔
        </button>
        <button
          type="submit"
          style={{ color: "red" }}
          onClick={() => {
            setShuffleMode("default");
          }}
        >
          X
        </button>
      </Match>
    </Switch>
  );
}
