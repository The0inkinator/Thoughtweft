import { createEffect, onMount } from "solid-js";
import "./playerSeat.css";
import { useEventContext } from "~/context/EventContext";
import PlayerCard from "../playerCard";

interface PlayerSlotInput {
  podNumber: number;
  seatNumber: number;
  seatFacing: "left" | "right";
}

export default function PlayerSeat({ podNumber, seatNumber }: PlayerSlotInput) {
  //Context State
  const [eventState, { updateSeatRef }] = useEventContext();

  const thisSeatState = () => {
    return eventState().evtSeats.filter(
      (seat) => seat.podNumber === podNumber && seat.seatNumber === seatNumber
    )[0];
  };

  createEffect(() => {
    if (thisSeatState().seatRef !== thisSeat) {
      updateSeatRef(podNumber, seatNumber, thisSeat);
    }
  });

  let thisSeat!: HTMLDivElement;

  return (
    <div class="playerSeatCont" ref={thisSeat}>
      Seat # {seatNumber}
      <PlayerCard></PlayerCard>
    </div>
  );
}
