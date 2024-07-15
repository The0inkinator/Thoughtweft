import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import styles from "./seat.module.css";
import { useEventContext } from "~/context/EventContext";
import PlayerCard from "../playerCard";
import { playerIdFromAddress } from "~/context/EventDataFunctions";
import { FullSeat } from "~/typing/eventTypes";
import seat from ".";

interface SeatInputs {
  podId: number;
  seatNumber: number;
  byeSeat?: boolean;
  justifyRight?: boolean;
}

export default function Seat({
  podId,
  seatNumber,
  byeSeat,
  justifyRight,
}: SeatInputs) {
  //Context State
  const [eventState, { updateSeat, updatePlayer, removePlayer }] =
    useEventContext();
  //Local State
  const [mouseOver, setMouseOver] = createSignal<boolean>(false);
  const [isByeSeat, setIsByeSeat] = createSignal<boolean>(false);
  //Refs
  let thisSeat!: HTMLDivElement;

  //Returns state for the seat
  const thisSeatState = () =>
    eventState()
      .evtPods.find((pod) => pod.podId === podId)!
      .podSeats.find((seat) => seat.seatNumber === seatNumber)!;

  const thisPodState = () => {
    return eventState().evtPods.find((pod) => pod.podId === podId);
  };

  const seatedPlayer = () =>
    eventState().evtPlayerList.find(
      (player) => player.seat === seatNumber && player.podId === podId
    );

  createEffect(() => {
    if (thisSeatState().filled && thisSeat.childElementCount === 0) {
      updateSeat(podId, seatNumber, { filled: false });
    }
    if (thisSeatState().filled === false && thisSeat.childElementCount > 0) {
      updateSeat(podId, seatNumber, { filled: true });
    }
  });

  //Returns state of a player if one is being dragged
  const draggedPlayer = () => {
    return eventState().evtPlayerList.find((player) => player.seat === 0);
  };

  //Shuffle players between pods if both pods are full

  const shufflePlayersAcrossPod = (seatPosition: number) => {
    const podToShuffle = eventState().evtPods.find(
      (pod) => pod.podId === podId
    );

    if (podToShuffle && draggedPlayer() && seatedPlayer()) {
      updatePlayer(seatedPlayer()!.id, {
        address: {
          podId: draggedPlayer()!.lastSeat!.podId,
          seat: draggedPlayer()!.lastSeat!.seat,
        },
      });
    }
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
  const handleMouseMove = (event: MouseEvent | TouchEvent) => {
    const boundingBox = thisSeat.getBoundingClientRect();
    if (event instanceof MouseEvent) {
      if (
        event.clientX >= boundingBox.left &&
        event.clientX <= boundingBox.right &&
        event.clientY >= boundingBox.top &&
        event.clientY <= boundingBox.bottom &&
        !mouseOver()
      ) {
        updateSeat(podId, seatNumber, { hovered: true });

        setTimeout(() => {
          if (
            draggedPlayer() &&
            thisPodState()?.podSeats.filter((seat) => seat.filled).length ===
              thisPodState()?.podSize
          ) {
            shufflePlayersAcrossPod(seatNumber);
          } else if (draggedPlayer()) shufflePlayersFrom(seatNumber);
        }, 300);
      } else if (
        (mouseOver() && event.clientX <= boundingBox.left) ||
        event.clientX >= boundingBox.right ||
        event.clientY <= boundingBox.top ||
        event.clientY >= boundingBox.bottom
      ) {
        setMouseOver(false);
        updateSeat(podId, seatNumber, { hovered: false });
      }
    } else if (event instanceof TouchEvent) {
      if (
        event.touches[0].clientX >= boundingBox.left &&
        event.touches[0].clientX <= boundingBox.right &&
        event.touches[0].clientY >= boundingBox.top &&
        event.touches[0].clientY <= boundingBox.bottom &&
        !mouseOver()
      ) {
        setMouseOver(true);
        if (draggedPlayer() && draggedPlayer()?.seat === 0) {
          updateSeat(podId, seatNumber, { hovered: true });

          setTimeout(() => {
            if (
              draggedPlayer() &&
              thisPodState()?.podSeats.filter((seat) => seat.filled).length ===
                thisPodState()?.podSize
            ) {
              shufflePlayersAcrossPod(seatNumber);
            } else if (draggedPlayer()) shufflePlayersFrom(seatNumber);
          }, 300);
        }
      } else if (
        (mouseOver() && event.touches[0].clientX <= boundingBox.left) ||
        event.touches[0].clientX >= boundingBox.right ||
        event.touches[0].clientY <= boundingBox.top ||
        event.touches[0].clientY >= boundingBox.bottom
      ) {
        setMouseOver(false);
        updateSeat(podId, seatNumber, { hovered: false });
      }
    }
  };

  onMount(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleMouseMove);
    updateSeat(podId, seatNumber, { ref: thisSeat });
    if (byeSeat) {
      setIsByeSeat(true);
    }
  });

  onCleanup(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("touchmove", handleMouseMove);
  });

  return (
    <div
      class={styles.seat}
      ref={thisSeat}
      onMouseOver={() => {
        if (!thisSeatState().hovered) {
          updateSeat(podId, seatNumber, { hovered: true });
        }
      }}
      onMouseDown={(event) => {
        if (seatedPlayer() && thisPodState()?.podStatus === "seating") {
          updatePlayer(seatedPlayer()!.id, {
            lastSeat: { podId: podId, seat: seatNumber },
          });
          updatePlayer(seatedPlayer()!.id, { lastEvent: event });
          updatePlayer(seatedPlayer()!.id, {
            lastLoc: {
              x:
                event.clientX -
                seatedPlayer()!.currentRef!.getBoundingClientRect().left,
              y:
                event.clientY -
                seatedPlayer()!.currentRef!.getBoundingClientRect().top,
            },
          });
          updatePlayer(seatedPlayer()!.id, {
            address: { podId: podId, seat: 0 },
          });
        }
      }}
      ontouchstart={(event) => {
        if (seatedPlayer() && thisPodState()?.podStatus === "seating") {
          updatePlayer(seatedPlayer()!.id, {
            lastSeat: { podId: podId, seat: seatNumber },
          });
          updatePlayer(seatedPlayer()!.id, { lastEvent: event });
          updatePlayer(seatedPlayer()!.id, {
            lastLoc: {
              x:
                event.touches[0].clientX -
                seatedPlayer()!.currentRef!.getBoundingClientRect().left,
              y:
                event.touches[0].clientY -
                seatedPlayer()!.currentRef!.getBoundingClientRect().top,
            },
          });
          updatePlayer(seatedPlayer()!.id, {
            address: { podId: podId, seat: 0 },
          });
        }
      }}
    >
      <Show when={seatedPlayer()}>
        <PlayerCard
          playerID={seatedPlayer()!.id}
          seatNumber={seatNumber}
          playerName={seatedPlayer()!.name}
        ></PlayerCard>
      </Show>
    </div>
  );
}
