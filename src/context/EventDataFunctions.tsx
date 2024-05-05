import { Event, FullSeat, SeatAddress } from "~/typing/eventTypes";

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

export function podIdtoPodNum(importedEventState: Event, input: number) {
  const foundPod = importedEventState.evtPods.find(
    (pod) => pod.podId === input
  );
  if (foundPod) {
    return foundPod.podNumber;
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
    (player) => player.podId === podId && player.seat === seatNumber
  );

  if (foundPlayer) {
    return foundPlayer.id;
  } else {
    return -1;
  }
}

export function seatDataFromDiv(
  importedEventState: Event,
  importedDiv: HTMLDivElement
) {
  const eventState = importedEventState;
  let seatData: FullSeat | undefined;

  eventState.evtPods.map((pod) => {
    pod.podSeats.map((seat) => {
      if (seat.seatRef === importedDiv) {
        seatData = seat;
      }
    });
  });
  if (seatData) {
    return seatData;
  }
}

export function firstOpenSeatAddress(importedEventState: Event) {
  const firstOpenPod = importedEventState.evtPods.find((pod) => {
    let seatFilled = true;
    pod.podSeats.map((seat) => {
      if (!seat.filled) {
        seatFilled = false;
      }
    });
    if (!seatFilled) {
      return true;
    } else {
      return false;
    }
  });

  const firstOpenSeat = firstOpenPod?.podSeats.find((seat) => !seat.filled);

  if (firstOpenPod && firstOpenSeat) {
    return {
      podId: firstOpenPod.podId,
      seat: firstOpenSeat.seatNumber,
    } as SeatAddress;
  }
}
