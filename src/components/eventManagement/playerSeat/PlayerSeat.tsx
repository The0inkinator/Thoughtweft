import { createEffect, onMount } from "solid-js";
import "./playerSeat.css";
import { useEventContext } from "~/context/EventContext";
import PlayerCard from "../playerCard";

interface PlayerSlotInput {
  podId: number;
  seatNumber: number;
  // seatFacing: "left" | "right";
}

export default function PlayerSeat({ podId, seatNumber }: PlayerSlotInput) {
  //Context State
  const [eventState, { updateSeat }] = useEventContext();

  const thisSeatState = () => {
    return eventState()
      .evtPods.find((pod) => pod.podId === podId)!
      .podSeats.find((seat) => seat.seatNumber === seatNumber)!;
  };

  createEffect(() => {
    if (thisSeatState().seatRef !== thisSeat) {
      updateSeat(podId, seatNumber, thisSeat);
    }
  });

  createEffect(() => {
    if (thisSeatState().filled === true && thisSeat.children.length < 1) {
      updateSeat(podId, seatNumber, false);
    }
  });

  let thisSeat!: HTMLDivElement;

  return (
    <div
      class="playerSeatCont"
      ref={thisSeat}
      onclick={() => {
        console.log(thisSeatState());
      }}
    >
      {/* <PlayerCard></PlayerCard> */}
    </div>
  );
}
