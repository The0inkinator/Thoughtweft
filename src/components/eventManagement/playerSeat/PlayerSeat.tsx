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
      const reverseSeats = [...podToShuffle.podSeats].reverse();
      let shuffleNeeded = true;
      seats.map((seat) => {
        if (seat.filled === true) {
          const seatBefore = seats[seat.seatNumber - 2];
          const seatAfter = seats[seat.seatNumber];
          const seatSpan = seats.slice(seat.seatNumber - 1, seatPosition - 1);
          if (seat.seatNumber < seatPosition) {
            if (
              seatBefore &&
              seatBefore.filled === false &&
              seatSpan.filter((seat) => seat.filled === false).length === 0
            ) {
              updatePlayer(
                playerIdFromAddress(eventState(), podId, seat.seatNumber),
                {
                  address: { podId: podId, seat: seatBefore.seatNumber },
                }
              );
            }
          } else if (seat.seatNumber === seatPosition) {
            if (seatBefore && seatBefore.filled === false) {
              shuffleNeeded = false;
              updatePlayer(
                playerIdFromAddress(eventState(), podId, seat.seatNumber),
                {
                  address: { podId: podId, seat: seatBefore.seatNumber },
                }
              );
            }
          }
        }
      });

      if (shuffleNeeded === true) {
        reverseSeats.map((seat) => {
          const seatBefore = reverseSeats[9 - seat.seatNumber];
          const seatAfter = reverseSeats[7 - seat.seatNumber];
          const reverseSeatSpan = reverseSeats.slice(
            seatPosition - 1,
            seat.seatNumber - 1
          );
          if (seat.seatNumber > seatPosition) {
            if (
              seatAfter &&
              seatAfter.filled === false &&
              seatBefore.filled === true &&
              reverseSeatSpan.filter((seat) => seat.filled === false).length ===
                0
            ) {
              updatePlayer(
                playerIdFromAddress(eventState(), podId, seat.seatNumber),
                {
                  address: { podId: podId, seat: seatAfter.seatNumber },
                }
              );
            }
          } else if (seat.seatNumber === seatPosition) {
            if (seatAfter) {
              shuffleNeeded = false;
              updatePlayer(
                playerIdFromAddress(eventState(), podId, seat.seatNumber),
                {
                  address: { podId: podId, seat: seatAfter.seatNumber },
                }
              );
            }
          }
        });
      }
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
