import styles from "./playerCard.module.css";
import { useEventContext } from "~/context/EventContext";
import {
  createSignal,
  Switch,
  Match,
  onMount,
  createEffect,
  Show,
} from "solid-js";
import { FullSeat, Pod } from "~/typing/eventTypes";
import { z } from "vinxi/dist/types/lib/router-modes";
import { getAllSeats, openSeatFromPod } from "~/context/EventDataFunctions";
import PlayerMenu from "./playerMenu/PlayerMenu";

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
  const [eventState, { updatePlayer, updateSeat, removePlayer, updatePod }] =
    useEventContext();
  //Local State
  const [playerCardMode, setPlayerCardMode] = createSignal<CardMode>("noSeat");
  // const [hoveredSeat, setHoveredSeat] = createSignal<FullSeat | undefined>();
  const [leftSeatPlayer, setLeftSeatPlayer] = createSignal<boolean>(false);
  //refs
  let thisPlayerCard!: HTMLDivElement;
  let thisPlayerMenu!: HTMLDivElement;
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

  const hoveredPod = () => eventState().evtPods.find((pod) => pod.podHovered);

  const hoveredSeat = () =>
    getAllSeats(eventState()).find((seat) => seat.hovered);

  createEffect(() => {
    let podRect = thisPodState()!.podRef!.getBoundingClientRect();
    let podMiddle = podRect.left + podRect.width / 2;
    let playerLeft = thisPlayerCard.getBoundingClientRect().left;

    if (
      hoveredPod() &&
      hoveredPod()?.podId !== podId() &&
      thisPlayerState().seat === 0
    ) {
      podRect = hoveredPod()!.podRef!.getBoundingClientRect();
      podMiddle = podRect.left + podRect.width / 2;
      playerLeft = thisPlayerCard.getBoundingClientRect().left;
    }

    if (playerLeft < podMiddle && !leftSeatPlayer()) {
      setLeftSeatPlayer(true);
    } else if (playerLeft > podMiddle && leftSeatPlayer()) {
      setLeftSeatPlayer(false);
    }
  });

  onMount(() => {
    updatePlayer(playerID, { currentRef: thisPlayerCard });
    if (draggingCard && thisPlayerState().lastEvent) {
      dragInit(thisPlayerState().lastEvent!);
    }
  });

  const dragInit = (event: MouseEvent | TouchEvent) => {
    // setPlayerCardMode("dragging");
    thisPlayerCard.style.zIndex = "10";

    //Set offsets
    if (event instanceof MouseEvent) {
      thisPlayerCard.style.pointerEvents = "none";
      xOffset = thisPlayerState().lastLoc ? thisPlayerState().lastLoc!.x : 0;
      yOffset = thisPlayerState().lastLoc ? thisPlayerState().lastLoc!.y : 0;
    } else if (event instanceof TouchEvent) {
      xOffset = thisPlayerState().lastLoc ? thisPlayerState().lastLoc!.x : 0;
      yOffset = thisPlayerState().lastLoc ? thisPlayerState().lastLoc!.y : 0;
    }
    //Trigger Initial Styling
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
    //Add event Listeners
    if (event instanceof MouseEvent) {
      document.addEventListener("mousemove", dragging);
      document.addEventListener("mouseup", dragEnd);
    } else if (event instanceof TouchEvent) {
      document.addEventListener("touchmove", dragging);
      document.addEventListener("touchend", dragEnd);
    }
  };

  const dragging = (event: MouseEvent | TouchEvent) => {
    if (
      (event.type === "mousemove" || event.type === "touchmove") &&
      playerCardMode() !== "dragging"
    ) {
      setTimeout(() => {
        setPlayerCardMode("dragging");
      }, 70);
    }
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

  const dragEnd = () => {
    thisPlayerCard.style.position = "static";
    thisPlayerCard.style.pointerEvents = "auto";

    if (playerCardMode() !== "dragging") {
      updatePod(podId(), { menuOpen: true });
      // updatePlayer(playerID, { menuOpen: true });
      // thisPodState()?.menuRef?.appendChild(thisPlayerMenu);
    }

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
      openSeatFromPod(eventState(), hoveredPod()!.podId)
    ) {
      updatePlayer(playerID, {
        address: {
          podId: hoveredPod()!.podId,
          seat: openSeatFromPod(eventState(), hoveredPod()!.podId)!.seatNumber,
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
    } else if (openSeatFromPod(eventState(), hoveredPod()!.podId)) {
      updatePlayer(playerID, {
        address: {
          podId: podId(),
          seat: openSeatFromPod(eventState(), hoveredPod()!.podId)!.seatNumber,
        },
      });
    } else {
      updatePlayer(playerID, {
        address: {
          podId: openSeatFromPod(eventState(), hoveredPod()!.podId)!.podId,
          seat: openSeatFromPod(eventState(), hoveredPod()!.podId)!.seatNumber,
        },
      });
    }

    document.removeEventListener("mousemove", dragging);
    document.removeEventListener("mouseup", dragEnd);
    document.removeEventListener("touchmove", dragging);
    document.removeEventListener("touchend", dragEnd);
  };

  return (
    <div class={styles.playerCardCNT} ref={thisPlayerCard}>
      <Switch fallback={<></>}>
        <Match when={playerCardMode() === "noSeat"}>
          <div
            class={`${
              leftSeatPlayer() ? styles.playerLVisCNT : styles.playerRVisCNT
            }`}
          >
            <div class={styles.playerIcon}></div>
            <div class={styles.playerName}>{thisPlayerState().name}</div>
          </div>
        </Match>
        <Match when={playerCardMode() === "dragging"}>
          <div
            class={`${
              leftSeatPlayer() ? styles.playerLVisCNT : styles.playerRVisCNT
            }`}
          >
            <div class={styles.playerIcon}></div>
            <div class={styles.playerName}>{thisPlayerState().name}</div>
          </div>
        </Match>
      </Switch>
      <PlayerMenu
        ref={thisPlayerMenu}
        playerId={playerID}
        podId={podId()}
      ></PlayerMenu>
    </div>
  );
}
