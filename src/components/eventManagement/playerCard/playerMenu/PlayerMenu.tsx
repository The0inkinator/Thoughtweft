import { createEffect, onCleanup, Show } from "solid-js";
import styles from "./playerMenu.module.css";
import { useEventContext } from "~/context/EventContext";

interface PlayerMenuInputs {
  ref: HTMLDivElement;
  playerId: number;
  podId: number;
}

export default function PlayerMenu({ ref, playerId, podId }: PlayerMenuInputs) {
  //Context State
  const [eventState, { updatePlayer, updatePod }] = useEventContext();

  const thisPlayerState = () =>
    eventState().evtPlayerList.find((player) => player.id === playerId);

  return (
    <div ref={ref} style={{ "pointer-events": "auto" }}>
      <Show when={thisPlayerState()?.menuOpen}>
        <div
          style={{ "background-color": "red", width: "2rem", height: "2rem" }}
          onclick={() => {
            updatePlayer(playerId, { menuOpen: false });
            updatePod(podId, { menuOpen: false });
          }}
        ></div>
      </Show>
    </div>
  );
}
