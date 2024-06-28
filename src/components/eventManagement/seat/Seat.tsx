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
  //Local State
  const [mouseOver, setMouseOver] = createSignal<boolean>(false);
  //Refs
  let thisSeat!: HTMLDivElement;

  //Returns state for the seat
  const thisSeatState = () => {
    return eventState()
      .evtPods.find((pod) => pod.podId === podId)!
      .podSeats.find((seat) => seat.seatNumber === seatNumber)!;
  };

  createEffect(() => {
    if (thisSeatState().filled && thisSeat.childElementCount === 0) {
      // console.log(seatNumber, "not filled");
      updateSeat(podId, seatNumber, { filled: false });
    }
    if (thisSeatState().filled === false && thisSeat.childElementCount > 0) {
      // console.log(seatNumber, "filled");
      updateSeat(podId, seatNumber, { filled: true });
    }
  });

  //Returns state of a player if one is being dragged
  const draggedPlayer = () => {
    return eventState().evtPlayerList.find(
      (player) => player.dragging === true
    );
  };

  //Shuffles players to make space for a dragged player
  const shufflePlayersFrom = (seatPosition: number) => {
    const podToShuffle = eventState().evtPods.find(
      (pod) => pod.podId === podId
    );

    if (
      podToShuffle &&
      podToShuffle.podSeats.filter((seat) => seat.filled).length <
        podToShuffle.podSize &&
      podToShuffle.podSeats.find((seat) => seat.seatNumber === seatPosition)
        ?.filled === true &&
      podToShuffle.podSeats.find((seat) => seat.seatNumber === seatPosition)
        ?.hovered === true
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
            updateSeat(podId, smallerSeat.seatNumber, { filled: false });
            updatePlayer(
              playerIdFromAddress(eventState(), podId, seat.seatNumber),
              { address: { podId: podId, seat: smallerSeat.seatNumber } }
            );
            updateSeat(podId, seat.seatNumber, { filled: false });
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
            updateSeat(podId, largerSeat.seatNumber, { filled: false });
            updatePlayer(
              playerIdFromAddress(eventState(), podId, seat.seatNumber),
              { address: { podId: podId, seat: largerSeat.seatNumber } }
            );
            updateSeat(podId, seat.seatNumber, { filled: false });
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
        updateSeat(podId, targetSeat.seatNumber, { filled: false });
        updatePlayer(playerIdFromAddress(eventState(), podId, seatPosition), {
          address: { podId: podId, seat: targetSeat.seatNumber },
        });
      }
    }
  };

  //Handles mouse movement to trigger shuffle function
  const handleMouseMove = (event: MouseEvent) => {
    const boundingBox = thisSeat.getBoundingClientRect();
    if (
      event.clientX >= boundingBox.left &&
      event.clientX <= boundingBox.right &&
      event.clientY >= boundingBox.top &&
      event.clientY <= boundingBox.bottom &&
      !mouseOver()
    ) {
      setMouseOver(true);
      if (draggedPlayer() && draggedPlayer()?.dragging === true) {
        updateSeat(podId, seatNumber, { hovered: true });
        setTimeout(() => {
          if (draggedPlayer()) {
            shufflePlayersFrom(seatNumber);
          }
        }, 400);
      }
    } else if (
      (mouseOver() && event.clientX <= boundingBox.left) ||
      event.clientX >= boundingBox.right ||
      event.clientY <= boundingBox.top ||
      event.clientY >= boundingBox.bottom
    ) {
      setMouseOver(false);
      updateSeat(podId, seatNumber, { hovered: false });
    }
  };

  onMount(() => {
    document.addEventListener("mousemove", handleMouseMove);
    updateSeat(podId, seatNumber, { ref: thisSeat });
  });
  onCleanup(() => {
    document.removeEventListener("mousemove", handleMouseMove);
  });

  return (
    <div
      class={styles.seat}
      ref={thisSeat}
      // style={{
      //   "background-color": thisSeatState().filled ? "green" : "black",
      //   outline: mouseOver() ? "solid red" : "none",
      // }}
      onMouseOver={() => {
        if (!thisSeatState().hovered) {
          updateSeat(podId, seatNumber, { hovered: true });
        }
      }}
      // onMouseEnter={() => {
      //   updateSeat(podId, seatNumber, { hovered: true });
      // }}
      // onMouseLeave={() => {
      //   updateSeat(podId, seatNumber, { hovered: false });
      // }}
    >
      {seatNumber}
    </div>
  );
}
