import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import styles from "./seat.module.css";
import { useEventContext } from "~/context/EventContext";
import PlayerCard from "../playerCard";
import { playerIdFromAddress } from "~/context/EventDataFunctions";
import { FullSeat } from "~/typing/eventTypes";

interface SeatInputs {
  podId: number;
  seatNumber: number;
  justifyRight?: boolean;
}

export default function Seat({ podId, seatNumber, justifyRight }: SeatInputs) {
  //Context State
  const [eventState, { updateSeat, updatePlayer }] = useEventContext();
  //Refs
  let thisSeat!: HTMLDivElement;

  //Returns state for the seat
  const thisSeatState = createMemo(() => {
    return eventState()
      .evtPods.find((pod) => pod.podId === podId)!
      .podSeats.find((seat) => seat.seatNumber === seatNumber)!;
  });

  onMount(() => {
    updateSeat(podId, seatNumber, { ref: thisSeat });
  });

  return (
    <div class={styles.seatCNT} ref={thisSeat}>
      {seatNumber}
    </div>
  );
}
