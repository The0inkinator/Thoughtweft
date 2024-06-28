import styles from "./eventController.module.css";
import { For, createEffect, createSignal, onMount } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import PlayerHopper from "../playerHopper";
import PodCard from "../podCard";
import PodPlusButton from "../podPlusButton";

export default function EventController() {
  //Context State
  const [eventState, { updateSeat, updatePlayer }] = useEventContext();

  // const shufflePlayersFrom = (seatPosition: number) => {
  //   const podToShuffle = eventState().evtPods.find(
  //     (pod) => pod.podId === podId
  //   );

  //   if (
  //     podToShuffle &&
  //     podToShuffle.podSeats.filter((seat) => seat.filled).length <
  //       podToShuffle.podSize &&
  //     podToShuffle.podSeats.find((seat) => seat.seatNumber === seatPosition)
  //       ?.filled === true &&
  //     podToShuffle.podSeats.find((seat) => seat.seatNumber === seatPosition)
  //       ?.hovered === true
  //   ) {
  //     const fullSeatGroup = podToShuffle.podSeats;
  //     const seatGroupBefore = podToShuffle.podSeats.filter(
  //       (seat) => seat.seatNumber < seatPosition
  //     );
  //     const seatGroupAfter = podToShuffle.podSeats.filter(
  //       (seat) => seat.seatNumber > seatPosition
  //     );

  //     const shuffleGroupBefore = () => {
  //       [...seatGroupBefore].map((seat) => {
  //         const smallerSeat = fullSeatGroup[seat.seatNumber - 2];
  //         const largerSeat = fullSeatGroup[seat.seatNumber];
  //         const spanToSeat = fullSeatGroup.slice(
  //           seat.seatNumber - 1,
  //           seatPosition - 1
  //         );

  //         if (
  //           smallerSeat &&
  //           !smallerSeat.filled &&
  //           largerSeat.filled &&
  //           spanToSeat.filter((seat) => !seat.filled).length === 0
  //         ) {
  //           updatePlayer(
  //             playerIdFromAddress(eventState(), podId, seat.seatNumber),
  //             { address: { podId: podId, seat: smallerSeat.seatNumber } }
  //           );
  //         }
  //       });
  //     };

  //     const shuffleGroupAfter = () => {
  //       [...seatGroupAfter].reverse().map((seat) => {
  //         const smallerSeat = fullSeatGroup[seat.seatNumber - 2];
  //         const largerSeat = fullSeatGroup[seat.seatNumber];
  //         const spanToSeat = fullSeatGroup.slice(
  //           seatPosition - 1,
  //           seat.seatNumber - 1
  //         );

  //         if (
  //           largerSeat &&
  //           !largerSeat.filled &&
  //           smallerSeat.filled &&
  //           spanToSeat.filter((seat) => !seat.filled).length === 0
  //         ) {
  //           updatePlayer(
  //             playerIdFromAddress(eventState(), podId, seat.seatNumber),
  //             { address: { podId: podId, seat: largerSeat.seatNumber } }
  //           );
  //         }
  //       });
  //     };

  //     let longSeatGroup,
  //       shuffleLongSeatGroup: () => void,
  //       shortSeatGroup,
  //       shuffleShortSeatGroup: () => void;

  //     let shuffleNeeded = true;

  //     if (seatGroupBefore.length < seatGroupAfter.length) {
  //       shortSeatGroup = seatGroupBefore;
  //       shuffleShortSeatGroup = () => {
  //         shuffleGroupBefore();
  //       };
  //       longSeatGroup = seatGroupAfter;
  //       shuffleLongSeatGroup = () => {
  //         shuffleGroupAfter();
  //       };
  //     } else {
  //       shortSeatGroup = seatGroupAfter;
  //       shuffleShortSeatGroup = () => {
  //         shuffleGroupAfter();
  //       };
  //       longSeatGroup = seatGroupBefore;
  //       shuffleLongSeatGroup = () => {
  //         shuffleGroupBefore();
  //       };
  //     }

  //     if (
  //       shortSeatGroup.length >
  //       shortSeatGroup.filter((seat) => seat.filled).length
  //     ) {
  //       shuffleShortSeatGroup();
  //       shuffleNeeded = false;
  //     } else if (
  //       longSeatGroup.length >
  //         longSeatGroup.filter((seat) => seat.filled).length &&
  //       shuffleNeeded
  //     ) {
  //       shuffleLongSeatGroup();
  //       shuffleNeeded = false;
  //     }

  //     const hoveredSeat = fullSeatGroup[seatPosition - 1];
  //     const vacantSeats = fullSeatGroup.filter(
  //       (seat) =>
  //         !seat.filled &&
  //         (seat.seatNumber === hoveredSeat.seatNumber + 1 ||
  //           seat.seatNumber === hoveredSeat.seatNumber - 1)
  //     );
  //     let targetSeat: FullSeat | undefined;

  //     if (vacantSeats.length > 1) {
  //       vacantSeats.map((vSeat) => {
  //         if (
  //           shortSeatGroup.find((seat) => seat.seatNumber === vSeat.seatNumber)
  //         ) {
  //           targetSeat = vSeat;
  //         }
  //       });
  //     } else {
  //       targetSeat = vacantSeats[0];
  //     }

  //     if (targetSeat) {
  //       updatePlayer(playerIdFromAddress(eventState(), podId, seatPosition), {
  //         address: { podId: podId, seat: targetSeat.seatNumber },
  //       });
  //     }
  //   }
  // };

  return (
    <>
      <div class={styles.eventController}>
        <div class={styles.podCNT}>
          <PlayerHopper />
          <For each={eventState().evtPods}>
            {(pod) => (
              <PodCard
                podSize={pod.podSize}
                podNumber={pod.podNumber}
                podId={pod.podId}
              />
            )}
          </For>
          <PodPlusButton />
        </div>
      </div>
    </>
  );
}
