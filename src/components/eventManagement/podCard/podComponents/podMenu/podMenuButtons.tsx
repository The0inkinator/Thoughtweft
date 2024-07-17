import { createSignal, runWithOwner, Switch, Match, For, Show } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import shrinkPod from "../../playerMgmtFunc/shrinkPod";
import shufflePod from "../../playerMgmtFunc/shufflePod";
import styles from "./podMenu.module.css";
import { PodSizes } from "~/typing/eventTypes";

interface PodButtonInputs {
  podId: number;
}

export function RemovePodBtn({ podId }: PodButtonInputs) {
  const [eventState, { updatePlayer, updatePod, removePlayer, removePod }] =
    useEventContext();

  return (
    <button
      class={styles.menuItem}
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

export function ShrinkPodBtn({ podId }: PodButtonInputs) {
  const [eventState, { updatePod }] = useEventContext();
  const thisPodState = () =>
    eventState().evtPods.find((pod) => pod.podId === podId);
  return (
    <Show when={thisPodState()?.podStatus === "seating"}>
      <button
        class={styles.menuItem}
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
    </Show>
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
    <Show when={thisPodState()?.podStatus === "seating"}>
      <Switch fallback={<></>}>
        <Match when={shuffleMode() === "default"}>
          <button
            class={styles.menuItem}
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
    </Show>
  );
}

export function ChangePodSizeBtn({ podId }: PodButtonInputs) {
  const [eventState, { updatePodSize, updatePod, removePlayer }] =
    useEventContext();
  const thisPodState = () =>
    eventState().evtPods.find((pod) => pod.podId === podId);

  const [podSizeBtn, setPodSizeBtn] = createSignal<PodSizes>(
    thisPodState()!.podSize
  );
  const podOptions: PodSizes[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const [podSizeDrop, setPodSizeDrop] = createSignal<"open" | "close">("close");
  return (
    <Show when={thisPodState()?.podStatus === "seating"}>
      <button
        class={`${styles.podSizeDrop} ${styles.menuItem}`}
        type="button"
        onMouseUp={() => {
          if (podSizeDrop() === "close") {
            setPodSizeDrop("open");
          }
        }}
        onfocusout={() => {
          if (podSizeDrop() === "open") {
            setPodSizeDrop("close");
          }
        }}
      >
        {thisPodState()?.podSize}
        <div
          class={styles.podSizeMenu}
          style={{
            display: podSizeDrop() === "open" ? "block" : "none",
          }}
        >
          <For each={podOptions}>
            {(option: PodSizes) => (
              <div
                class={styles.podSizeOption}
                style={{
                  display: podSizeDrop() === "open" ? "block" : "none",
                }}
                onClick={() => {
                  setPodSizeBtn(option);
                  setPodSizeDrop("close");
                  updatePodSize(podId, option);
                  eventState()
                    .evtPlayerList.filter(
                      (player) => player.seat > thisPodState()!.podSize
                    )
                    .map((foundPlayer) => {
                      removePlayer(foundPlayer.id);
                    });
                  updatePod(podId, { menuOpen: false });
                  updatePod(podId, { overlayOpen: false });
                }}
              >
                {option}
              </div>
            )}
          </For>
        </div>
      </button>
    </Show>
  );
}
