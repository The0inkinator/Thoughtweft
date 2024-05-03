import { createEffect, onCleanup, onMount } from "solid-js";
import "./playerSeat.css";
import { useEventContext } from "~/context/EventContext";
import PlayerCard from "../playerCard";
import { playerIdFromAddress } from "~/context/EventDataFunctions";
import { FullSeat } from "~/typing/eventTypes";

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
    if (thisSeatState().filled === true) {
      thisSeat.style.backgroundColor = "red";
    }
  });

  createEffect(() => {
    if (thisSeatState().filled === false) {
      thisSeat.style.backgroundColor = "black";
    }
  });

  const shufflePlayersFrom = (seatPosition: number) => {
    const podToShuffle = eventState().evtPods.find(
      (pod) => pod.podId === podId
    );

    if (
      podToShuffle &&
      podToShuffle.podSeats.filter((seat) => seat.filled).length <
        podToShuffle.podSize &&
      podToShuffle.podSeats.find((seat) => seat.seatNumber === seatPosition)
        ?.filled === true
    ) {
      const fullSeatGroup = podToShuffle.podSeats;
      const seatGroupBefore = podToShuffle.podSeats.filter(
        (seat) => seat.seatNumber < seatPosition
      );
      const seatGroupAfter = podToShuffle.podSeats.filter(
        (seat) => seat.seatNumber > seatPosition
      );

      const shuffleGroupBefore = () => {
        [...seatGroupBefore].map((seat) => {
          const smallerSeat = fullSeatGroup[seat.seatNumber - 2];
          const largerSeat = fullSeatGroup[seat.seatNumber];
          const spanToSeat = fullSeatGroup.slice(
            seat.seatNumber - 1,
            seatPosition - 1
          );

          if (
            smallerSeat &&
            !smallerSeat.filled &&
            largerSeat.filled &&
            spanToSeat.filter((seat) => !seat.filled).length === 0
          ) {
            updatePlayer(
              playerIdFromAddress(eventState(), podId, seat.seatNumber),
              { address: { podId: podId, seat: smallerSeat.seatNumber } }
            );
          }
        });
      };

      const shuffleGroupAfter = () => {
        [...seatGroupAfter].reverse().map((seat) => {
          const smallerSeat = fullSeatGroup[seat.seatNumber - 2];
          const largerSeat = fullSeatGroup[seat.seatNumber];
          const spanToSeat = fullSeatGroup.slice(
            seatPosition - 1,
            seat.seatNumber - 1
          );

          if (
            largerSeat &&
            !largerSeat.filled &&
            smallerSeat.filled &&
            spanToSeat.filter((seat) => !seat.filled).length === 0
          ) {
            updatePlayer(
              playerIdFromAddress(eventState(), podId, seat.seatNumber),
              { address: { podId: podId, seat: largerSeat.seatNumber } }
            );
          }
        });
      };

      let longSeatGroup,
        shuffleLongSeatGroup: () => void,
        shortSeatGroup,
        shuffleShortSeatGroup: () => void;

      let shuffleNeeded = true;

      if (seatGroupBefore.length < seatGroupAfter.length) {
        shortSeatGroup = seatGroupBefore;
        shuffleShortSeatGroup = () => {
          shuffleGroupBefore();
        };
        longSeatGroup = seatGroupAfter;
        shuffleLongSeatGroup = () => {
          shuffleGroupAfter();
        };
      } else {
        shortSeatGroup = seatGroupAfter;
        shuffleShortSeatGroup = () => {
          shuffleGroupAfter();
        };
        longSeatGroup = seatGroupBefore;
        shuffleLongSeatGroup = () => {
          shuffleGroupBefore();
        };
      }

      if (
        shortSeatGroup.length >
        shortSeatGroup.filter((seat) => seat.filled).length
      ) {
        shuffleShortSeatGroup();
        shuffleNeeded = false;
      } else if (
        longSeatGroup.length >
          longSeatGroup.filter((seat) => seat.filled).length &&
        shuffleNeeded
      ) {
        shuffleLongSeatGroup();
        shuffleNeeded = false;
      }

      const hoveredSeat = fullSeatGroup[seatPosition - 1];
      const vacantSeats = fullSeatGroup.filter(
        (seat) =>
          !seat.filled &&
          (seat.seatNumber === hoveredSeat.seatNumber + 1 ||
            seat.seatNumber === hoveredSeat.seatNumber - 1)
      );
      let targetSeat: FullSeat | undefined;

      if (vacantSeats.length > 1) {
        vacantSeats.map((vSeat) => {
          if (
            shortSeatGroup.find((seat) => seat.seatNumber === vSeat.seatNumber)
          ) {
            targetSeat = vSeat;
          }
        });
      } else {
        targetSeat = vacantSeats[0];
      }

      if (targetSeat) {
        updatePlayer(playerIdFromAddress(eventState(), podId, seatPosition), {
          address: { podId: podId, seat: targetSeat.seatNumber },
        });
      }
    }
  };

  return (
    <div
      class="playerSeatCont"
      ref={thisSeat}
      onMouseEnter={() => {
        thisSeat.style.outline = "solid blue";
        if (draggedPlayer() && draggedPlayer()?.dragging === true) {
          updateSeat(podId, seatNumber, { hovered: true });
          shufflePlayersFrom(seatNumber);
        }
      }}
      onMouseLeave={() => {
        thisSeat.style.outline = "none";
        updateSeat(podId, seatNumber, { hovered: false });
      }}
    >
      {seatNumber}
    </div>
  );
}
