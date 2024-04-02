import { createEffect, onMount } from "solid-js";
import "./playerSeat.css";
import { useEventContext } from "~/context/EventContext";
import PlayerCard from "../playerCard";

interface PlayerSlotInput {
  key: string;
  podNumber: number;
  seatNumber: number;
  seatFacing: "left" | "right";
}

export default function PlayerSeat({ podNumber, seatNumber }: PlayerSlotInput) {
  //Context State
  const [eventState, { updateSeat }] = useEventContext();

  const thisSeatState = () => {
    return eventState().evtSeats.filter(
      (seat) => seat.podNumber === podNumber && seat.seatNumber === seatNumber
    )[0];
  };

  createEffect(() => {
    if (thisSeatState().seatRef !== thisSeat) {
      updateSeat(podNumber, seatNumber, thisSeat);
    }
  });

  createEffect(() => {
    if (thisSeatState().filled === true && thisSeat.children.length < 1) {
      updateSeat(podNumber, seatNumber, false);
    }
  });

  let thisSeat!: HTMLDivElement;

  return (
    <div class="playerSeatCont" ref={thisSeat} onclick={() => {}}>
      {/* <PlayerCard></PlayerCard> */}
    </div>
  );
}
