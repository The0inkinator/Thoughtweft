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

export function getAllSeats(eventData: Event) {
  let allSeats: FullSeat[] = [];
  eventData.evtPods.map((pod) => {
    pod.podSeats.map((seat) => {
      allSeats.push(seat);
    });
  });
  return allSeats;
}

export function openSeatFromPod(eventData: Event, podId: number) {
  return getAllSeats(eventData).find(
    (seat) => !seat.filled && seat.podId === podId
  );
}
export function openSeatAnyPod(eventData: Event) {
  return getAllSeats(eventData).find((seat) => !seat.filled);
}
