import { useEventContext } from "./EventContext";

export function podNumtoPodId(input: number) {
  const [eventState] = useEventContext();
  const foundPod = eventState().evtPods.find((pod) => pod.podNumber === input);
  if (foundPod) {
    return foundPod.podId;
  } else {
    return input;
  }
}

export function playerIdFromAddress(podId: number, seatNumber: number) {
  const [eventState] = useEventContext();
  const foundPlayer = eventState().evtPlayerList.find(
    (player) =>
      podNumtoPodId(player.pod) === podId && player.seat === seatNumber
  );

  if (foundPlayer) {
    return foundPlayer.id;
  } else {
    return -1;
  }
}
