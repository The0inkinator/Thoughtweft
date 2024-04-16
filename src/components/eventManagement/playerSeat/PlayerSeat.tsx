import { createEffect, onCleanup, onMount } from "solid-js";
import "./playerSeat.css";
import { useEventContext } from "~/context/EventContext";
import PlayerCard from "../playerCard";

interface PlayerSlotInput {
  podId: number;
  seatNumber: number;
  tableSide: "L" | "R";
}

export default function PlayerSeat({
  podId,
  seatNumber,
  tableSide,
}: PlayerSlotInput) {
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

  const assignToGrid = () => {
    if (tableSide === "R") {
      const vertGridPos = seatNumber;
      thisSeat.style.gridColumn = "3";
      thisSeat.style.gridRow = `${vertGridPos}`;
    } else if (tableSide === "L") {
      const podSize = eventState().evtSeats.filter(
        (seat) => seat.podId === podId
      )!.length;
      const evenVertGridPos = podSize - seatNumber + 1;
      const oddVertGridPos = podSize - seatNumber + 2;
      thisSeat.style.gridColumn = "1";
      thisSeat.style.gridRow = `${evenVertGridPos}`;

      if (podSize % 2 === 0) {
        thisSeat.style.gridColumn = "1";
        thisSeat.style.gridRow = `${evenVertGridPos}`;
      } else {
        thisSeat.style.gridColumn = "1";
        thisSeat.style.gridRow = `${oddVertGridPos}`;
      }
    }
  };

  createEffect(() => {
    assignToGrid();
  });

  return (
    <div
      class="playerSeatCont"
      ref={thisSeat}
      onclick={() => {
        console.log(thisSeatState());
      }}
    >
      {seatNumber}
      {/* <PlayerCard></PlayerCard> */}
    </div>
  );
}