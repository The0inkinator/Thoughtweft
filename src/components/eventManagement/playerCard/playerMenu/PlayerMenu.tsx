import { createEffect, onCleanup, onMount, Show } from "solid-js";
import styles from "./playerMenu.module.css";
import { useEventContext } from "~/context/EventContext";
import {
  DropPlayerBtn,
  PlayerCloseButton,
  PlayerRenameBtn,
  RemovePlayerBtn,
} from "./playerMenuButtons";

interface PlayerMenuInputs {
  playerId: number;
  podId: number;
}

export default function PlayerMenu({ playerId, podId }: PlayerMenuInputs) {
  //Context State
  const [eventState, { updatePlayer, updatePod }] = useEventContext();

  const thisPlayerState = () =>
    eventState().evtPlayerList.find((player) => player.id === playerId);

  return (
    <div
      style={{
        "pointer-events": "auto",
        display: "flex",
        "flex-direction": "column",
      }}
    >
      <PlayerRenameBtn playerId={playerId} podId={podId} />
      <RemovePlayerBtn playerId={playerId} podId={podId} />
      <DropPlayerBtn playerId={playerId} podId={podId} />
    </div>
  );
}
