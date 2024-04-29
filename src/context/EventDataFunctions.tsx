import { Event } from "~/typing/eventTypes";

export function podNumtoPodId(importedEventState: Event, input: number) {
  const foundPod = importedEventState.evtPods.find(
    (pod) => pod.podNumber === input
  );
  if (foundPod) {
    return foundPod.podId;
  } else {
    return input;
  }
}

export function playerIdFromAddress(
  importedEventState: Event,
  podId: number,
  seatNumber: number
) {
  const foundPlayer = importedEventState.evtPlayerList.find(
    (player) =>
      podNumtoPodId(importedEventState, player.pod) === podId &&
      player.seat === seatNumber
  );

  if (foundPlayer) {
    return foundPlayer.id;
  } else {
    return -1;
  }
}
