import {
  Pod,
  Player,
  Event,
  Record,
  Slot,
  useEventContext,
} from "~/context/EventContext";

export default function BuildEvent() {
  const [eventState] = useEventContext();

  const Pods: Pod[] = eventState().pods;
  const Players: Player[] = eventState().playerList;
  const Slots: Slot[] = eventState().slots;

  Pods.forEach((pod) => {
    const slotsToCreate = pod.podSize;

    for (let i = 0; i < slotsToCreate; i++) {
      Slots.push({
        podNumber: pod.podNumber,
        numberInPod: i + 1,
        filled: false,
      });
    }
  });

  const builtEvent: Event = { pods: Pods, playerList: Players, slots: Slots };

  return builtEvent;
}
