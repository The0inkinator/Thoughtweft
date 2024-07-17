import { createSignal, Show } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import styles from "./playerMenu.module.css";

interface PlayerButtonInputs {
  playerId: number;
  podId: number;
}

export function PlayerCloseButton({ playerId, podId }: PlayerButtonInputs) {
  const [eventState, { updatePlayer, updatePod }] = useEventContext();
  const thisPlayerState = () =>
    eventState().evtPlayerList.find((player) => player.id === playerId);
  const thisPodState = () => {
    return eventState().evtPods.find(
      (pod) => pod.podId === thisPlayerState()?.podId
    );
  };
  return (
    <Show when={thisPodState()?.podStatus === "pairing"}>
      <div
        style={{ "background-color": "red", width: "2rem", height: "2rem" }}
        onClick={() => {
          updatePlayer(playerId, { menuOpen: false });
          updatePod(podId, { menuOpen: false });
        }}
      ></div>
    </Show>
  );
}

export function PlayerRenameBtn({ playerId, podId }: PlayerButtonInputs) {
  const [eventState, { updatePlayer, updatePod }] = useEventContext();
  const thisPlayerState = () =>
    eventState().evtPlayerList.find((player) => player.id === playerId);
  const thisPodState = () => {
    return eventState().evtPods.find(
      (pod) => pod.podId === thisPlayerState()?.podId
    );
  };

  const [nameValue, setNameValue] = createSignal<string>(
    thisPlayerState()!.name
  );

  return (
    <input
      class={styles.menuItem}
      onInput={(event) => {
        setNameValue(event.target.value);
      }}
      value={nameValue()}
      onkeydown={(event) => {
        if (event.key === "Enter") {
          updatePlayer(playerId, { name: nameValue() });
          updatePlayer(playerId, { menuOpen: false });
          updatePod(podId, { overlayOpen: false });
        }
      }}
    ></input>
  );
}

export function RemovePlayerBtn({ playerId, podId }: PlayerButtonInputs) {
  const [eventState, { removePlayer, updatePod, updatePlayer }] =
    useEventContext();
  const thisPlayerState = () =>
    eventState().evtPlayerList.find((player) => player.id === playerId);
  const thisPodState = () => {
    return eventState().evtPods.find(
      (pod) => pod.podId === thisPlayerState()?.podId
    );
  };

  return (
    <Show when={thisPodState()?.podStatus === "seating"}>
      <button
        class={styles.menuItem}
        onclick={() => {
          removePlayer(playerId);
          updatePlayer(playerId, { menuOpen: false });
          updatePod(podId, { overlayOpen: false });
        }}
      >
        Remove {thisPlayerState()?.name}
      </button>
    </Show>
  );
}

export function DropPlayerBtn({ playerId, podId }: PlayerButtonInputs) {
  const [eventState, { updatePod, updatePlayer }] = useEventContext();
  const thisPlayerState = () =>
    eventState().evtPlayerList.find((player) => player.id === playerId);
  const thisPodState = () => {
    return eventState().evtPods.find(
      (pod) => pod.podId === thisPlayerState()?.podId
    );
  };

  return (
    <Show when={thisPodState()?.podStatus === "playing"}>
      <button
        class={styles.menuItem}
        onclick={() => {
          updatePlayer(playerId, { dropped: true });
          updatePlayer(playerId, { menuOpen: false });
          updatePod(podId, { overlayOpen: false });
        }}
      >
        Drop {thisPlayerState()?.name}
      </button>
    </Show>
  );
}
