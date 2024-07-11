import { useEventContext } from "~/context/EventContext";

// interface ShrinkPodInputs {
//   podId: number;
// }

export default function shrinkPod(podId: number) {
  const [eventState, { updatePodSize, updatePlayer, updateSeat }] =
    useEventContext();

  const playersInPod = () =>
    eventState().evtPlayerList.filter((player) => player.podId === podId);

  let seatsInPod = eventState().evtPods.find(
    (pod) => pod.podId === podId
  )!.podSeats;

  for (let i = 1; seatsInPod.find((seat) => seat.seatNumber === i); i++) {
    const thisSeat = seatsInPod.find((seat) => seat.seatNumber === i);

    if (thisSeat && !thisSeat.filled) {
      const playerToFill = playersInPod().find(
        (player) => player.seat > thisSeat!.seatNumber
      );
      if (playerToFill) {
        updatePlayer(playerToFill.id, {
          address: { podId: podId, seat: thisSeat.seatNumber },
        });
        updateSeat(podId, playerToFill.seat, { filled: false });
      } else {
        updatePodSize(podId, playersInPod().length);
        break;
      }
    }
  }
}
