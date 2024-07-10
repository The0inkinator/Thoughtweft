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
