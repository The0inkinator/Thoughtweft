import styles from "./playerCard.module.css";
import { useEventContext } from "~/context/EventContext";
import { createSignal, Switch, Match, onMount } from "solid-js";
import { FullSeat, Pod } from "~/typing/eventTypes";
import { z } from "vinxi/dist/types/lib/router-modes";

interface PlayerCardInputs {
  playerID: number;
  playerName: string;
  seatNumber: number;
  draggingCard?: boolean;
  initialEvent?: MouseEvent | TouchEvent;
}

type CardMode = "noSeat" | "dragging" | "hoveringSeat" | "seated";

export default function PlayerCard({
  playerID,
  playerName,
  seatNumber,
  draggingCard,
}: PlayerCardInputs) {
  //Context State
  const [eventState, { updatePlayer, updateSeat, removePlayer }] =
    useEventContext();
  //Local State
  const [playerCardMode, setPlayerCardMode] = createSignal<CardMode>("noSeat");
  // const [hoveredSeat, setHoveredSeat] = createSignal<FullSeat | undefined>();
  const [leftSeatPlayer, setLeftSeatPlayer] = createSignal<boolean>(false);
  const [cardLocX, setCardLocX] = createSignal<number>(0);
  //refs
  let thisPlayerCard!: HTMLDivElement;
  let xOffset: number, yOffset: number;
  //Values

  const thisPlayerState = () => {
    return eventState().evtPlayerList.find((player) => player.id === playerID)!;
  };

  const podId = () => {
    return thisPlayerState()?.podId;
  };

  const thisPodState = () => {
    return eventState().evtPods.find((pod) => pod.podId === podId());
  };

  onMount(() => {
    updatePlayer(playerID, { currentRef: thisPlayerCard });
    if (draggingCard && thisPlayerState().lastEvent) {
      dragInit(thisPlayerState().lastEvent!);
    }
  });

  const dragInit = (event: MouseEvent | TouchEvent) => {
    if (playerCardMode() !== "dragging") {
      setPlayerCardMode("dragging");
      // thisPlayerCard.style.zIndex = "10";
      // thisPlayerCard.style.position = "absolute";

      if (event instanceof MouseEvent) {
        thisPlayerCard.style.pointerEvents = "none";
        xOffset = thisPlayerState().lastLoc ? thisPlayerState().lastLoc!.x : 0;
        yOffset = thisPlayerState().lastLoc ? thisPlayerState().lastLoc!.y : 0;
      } else if (event instanceof TouchEvent) {
        xOffset = thisPlayerState().lastLoc ? thisPlayerState().lastLoc!.x : 0;
        yOffset = thisPlayerState().lastLoc ? thisPlayerState().lastLoc!.y : 0;
      }
      dragging(event);

      if (event instanceof MouseEvent) {
        document.addEventListener("mousemove", dragging);
        document.addEventListener("mouseup", dragEnd);
      } else if (event instanceof TouchEvent) {
        document.addEventListener("touchmove", dragging);
        document.addEventListener("touchend", dragEnd);
      }
    }
  };

  const dragging = (event: MouseEvent | TouchEvent) => {
    if (playerCardMode() === "dragging") {
      const playerRef = thisPlayerState().currentRef
        ? thisPlayerState().currentRef!
        : thisPlayerCard;
      if (event instanceof MouseEvent) {
        const x = event.clientX - xOffset;
        const y = event.clientY - yOffset;
        playerRef.style.left = `${x + window.scrollX}px`;
        playerRef.style.top = `${y + window.scrollY}px`;
      } else if (event instanceof TouchEvent) {
        const x = event.touches[0].clientX - xOffset;
        const y = event.touches[0].clientY - yOffset;
        playerRef.style.left = `${x + window.scrollX}px`;
        playerRef.style.top = `${y + window.scrollY}px`;
      }
    }
    if (hoveredSeat() && !hoveredSeat()?.filled) {
      updatePlayer(playerID, {
        lastSeat: {
          podId: hoveredSeat()!.podId,
          seat: hoveredSeat()!.seatNumber,
        },
      });
    }
  };

  const seats = () => {
    let allSeats: FullSeat[] = [];
    eventState().evtPods.map((pod) => {
      pod.podSeats.map((seat) => {
        allSeats.push(seat);
      });
    });
    return allSeats;
  };

  const hoveredPod = () => eventState().evtPods.find((pod) => pod.podHovered);

  const hoveredSeat = () => seats().find((seat) => seat.hovered);

  const openSeatFromPod = (id: number) =>
    seats().find((seat) => !seat.filled && seat.podId === id);
  const openSeatAnyPod = () => seats().find((seat) => !seat.filled);

  const dragEnd = () => {
    thisPlayerCard.style.position = "static";
    thisPlayerCard.style.pointerEvents = "auto";

    if (hoveredSeat() && !hoveredSeat()?.filled) {
      updatePlayer(playerID, {
        address: {
          podId: hoveredSeat()!.podId,
          seat: hoveredSeat()!.seatNumber,
        },
      });
    } else if (
      hoveredPod() &&
      hoveredPod()?.podId !== podId() &&
      openSeatFromPod(hoveredPod()!.podId)
    ) {
      updatePlayer(playerID, {
        address: {
          podId: hoveredPod()!.podId,
          seat: openSeatFromPod(hoveredPod()!.podId)!.seatNumber,
        },
      });
    } else if (
      thisPlayerState().lastSeat &&
      eventState()
        .evtPods.find((pod) => pod.podId === thisPlayerState().lastSeat!.podId)
        ?.podSeats.find(
          (seat) => seat.seatNumber === thisPlayerState().lastSeat!.seat
        )
    ) {
      updatePlayer(playerID, {
        address: {
          podId: thisPlayerState().lastSeat!.podId,
          seat: thisPlayerState().lastSeat!.seat,
        },
      });
    } else if (openSeatFromPod(podId())) {
      updatePlayer(playerID, {
        address: {
          podId: podId(),
          seat: openSeatFromPod(podId())!.seatNumber,
        },
      });
    } else {
      updatePlayer(playerID, {
        address: {
          podId: openSeatAnyPod()!.podId,
          seat: openSeatAnyPod()!.seatNumber,
        },
      });
    }

    document.removeEventListener("mousemove", dragging);
    document.removeEventListener("mouseup", dragEnd);
    document.removeEventListener("touchmove", dragging);
    document.removeEventListener("touchend", dragEnd);
  };

  return (
    <div
      class={styles.playerCardCNT}
      style={{
        "background-color": playerCardMode() === "dragging" ? "blue" : "red",
      }}
      ref={thisPlayerCard}
      onMouseDown={(event) => {
        if (!thisPodState() || thisPodState()!.podStatus === "seating") {
          updatePlayer(playerID, {
            lastSeat: { podId: podId(), seat: seatNumber },
          });
          updatePlayer(playerID, { lastEvent: event });
          updatePlayer(playerID, {
            lastLoc: {
              x: event.clientX - thisPlayerCard.getBoundingClientRect().left,
              y: event.clientY - thisPlayerCard.getBoundingClientRect().top,
            },
          });
          updatePlayer(playerID, { address: { podId: podId(), seat: 0 } });
        }
      }}
      onTouchStart={(event) => {
        if (!thisPodState() || thisPodState()!.podStatus === "seating") {
          updatePlayer(playerID, {
            lastSeat: { podId: podId(), seat: seatNumber },
          });
          updatePlayer(playerID, { lastEvent: event });
          updatePlayer(playerID, {
            lastLoc: {
              x:
                event.touches[0].clientX -
                thisPlayerCard.getBoundingClientRect().left,
              y:
                event.touches[0].clientY -
                thisPlayerCard.getBoundingClientRect().top,
            },
          });
          updatePlayer(playerID, { address: { podId: podId(), seat: 0 } });
        }
      }}
    >
      {/* <Switch fallback={<></>}>
        <Match when={playerCardMode() === "noSeat"}>
          <div
            style={{ "z-index": "-1" }}
            class={`${
              leftSeatPlayer() ? styles.playerLVisCNT : styles.playerRVisCNT
            }`}
          >
            <div class={styles.playerIcon}></div>
            <div class={styles.playerName}>{playerName}</div>
          </div>
        </Match>
        <Match when={playerCardMode() === "dragging"}>
          <div
            class={`${
              leftSeatPlayer() ? styles.playerLVisCNT : styles.playerRVisCNT
            }`}
          >
            <div class={styles.playerIcon}></div>
            <div class={styles.playerName}>{playerName}</div>
          </div>
        </Match>
      </Switch> */}
    </div>
  );
}
