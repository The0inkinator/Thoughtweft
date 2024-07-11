import { createSignal } from "solid-js";
import { useEventContext } from "~/context/EventContext";

interface PlayerButtonInputs {
  playerId: number;
  podId: number;
}

export function PlayerCloseButton({ playerId, podId }: PlayerButtonInputs) {
  const [eventState, { updatePlayer, updatePod }] = useEventContext();

  return (
    <div
      style={{ "background-color": "red", width: "2rem", height: "2rem" }}
      onClick={() => {
        updatePlayer(playerId, { menuOpen: false });
        updatePod(podId, { menuOpen: false });
      }}
    ></div>
  );
}

export function PlayerRenameButton({ playerId, podId }: PlayerButtonInputs) {
  const [eventState, { updatePlayer, updatePod }] = useEventContext();
  const thisPlayerState = () =>
    eventState().evtPlayerList.find((player) => player.id === playerId);
  const [nameValue, setNameValue] = createSignal<string>(
    thisPlayerState()!.name
  );

  return (
    <input
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
