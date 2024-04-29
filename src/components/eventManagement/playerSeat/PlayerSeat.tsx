import { createEffect, onCleanup, onMount } from "solid-js";
import "./playerSeat.css";
import { useEventContext } from "~/context/EventContext";
import PlayerCard from "../playerCard";
import { playerIdFromAddress } from "~/context/EventDataFunctions";

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
  const [eventState, { updateSeat, updatePlayer }] = useEventContext();

  const thisSeatState = () => {
    return eventState()
      .evtPods.find((pod) => pod.podId === podId)!
      .podSeats.find((seat) => seat.seatNumber === seatNumber)!;
  };

  const draggedPlayer = () => {
    return eventState().evtPlayerList.find(
      (player) => player.dragging === true
    );
  };

  createEffect(() => {
    if (thisSeatState().seatRef !== thisSeat) {
      updateSeat(podId, seatNumber, { ref: thisSeat });
    }
  });

  createEffect(() => {
    if (thisSeatState().filled === true && thisSeat.children.length < 1) {
      updateSeat(podId, seatNumber, { filled: false });
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

  createEffect(() => {
    if (thisSeat.childElementCount > 0 && thisSeatState().filled !== true) {
      updateSeat(podId, seatNumber, { filled: true });
    }
    if (thisSeat.childElementCount === 0 && thisSeatState().filled === true) {
      updateSeat(podId, seatNumber, { filled: false });
    }
  });

  const shufflePlayersFrom = (seatPosition: number) => {
    const podToShuffle = eventState().evtPods.find(
      (pod) => pod.podId === podId
    );

    if (
      podToShuffle &&
      podToShuffle.podSeats.filter((seat) => seat.filled).length <
        podToShuffle.podSize
    ) {
      const seats = podToShuffle.podSeats;
      console.log("triggerd");
      seats.map((seat) => {
        if (seat.filled === true) {
          if (seat.seatNumber < seatPosition) {
            const priorSeat = seats[seat.seatNumber - 2];
            if (priorSeat.filled === false) {
              updatePlayer(playerIdFromAddress(podId, seat.seatNumber), {
                address: { podId: podId, seat: priorSeat.seatNumber },
              });
            }
          } else if (seat.seatNumber > seatPosition) {
            const nextSeat = seats[seat.seatNumber];
          } else if (seat.seatNumber === seatPosition) {
          }
        }
      });
    }
  };

  return (
    <div
      class="playerSeatCont"
      ref={thisSeat}
      onMouseEnter={() => {
        if (draggedPlayer()?.dragging === true) {
          if (thisSeatState().filled === true) {
            shufflePlayersFrom(seatNumber);
          }
          updateSeat(podId, seatNumber, { hovered: true });
        }
      }}
      onMouseLeave={() => {
        updateSeat(podId, seatNumber, { hovered: false });
      }}
    >
      {seatNumber}
    </div>
  );
}
