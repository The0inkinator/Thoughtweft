import { useEventContext } from "./EventContext";

const [eventState] = useEventContext();

export function podNumtoPodId(input: number) {
  const foundPod = eventState().evtPods.find((pod) => pod.podNumber === input);
  if (foundPod) {
    return foundPod.podId;
  } else {
    return input;
  }
}

export function playerIdFromAddress(podId: number, seatNumber: number) {
  const foundPlayer = eventState().evtPlayerList.find(
    (player) =>
      podNumtoPodId(player.pod) === podId && player.seat === seatNumber
  );

  return foundPlayer?.id;
}
