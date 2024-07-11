import { createEffect, onCleanup, onMount, Show } from "solid-js";
import styles from "./playerMenu.module.css";
import { useEventContext } from "~/context/EventContext";
import { PlayerCloseButton, PlayerRenameButton } from "./playerMenuButtons";

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
      <Show
        when={
          thisPlayerState()?.menuOpen &&
          ref.parentElement !== thisPlayerState()?.currentRef
        }
      >
        <PlayerCloseButton playerId={playerId} podId={podId} />
        <PlayerRenameButton playerId={playerId} podId={podId} />
      </Show>
    </div>
  );
}
