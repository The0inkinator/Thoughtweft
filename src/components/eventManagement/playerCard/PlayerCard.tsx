import styles from "./playerCard.module.css";
import { useEventContext } from "~/context/EventContext";
import {
  createSignal,
  Switch,
  Match,
  createEffect,
  createMemo,
  onMount,
  createReaction,
  onCleanup,
} from "solid-js";
import { seatDataFromDiv } from "~/context/EventDataFunctions";
import { Portal } from "solid-js/web";
import { FullSeat, Pod } from "~/typing/eventTypes";
import seat from "../seat";
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
  const [hoveredSeat, setHoveredSeat] = createSignal<FullSeat | undefined>();
  const [leftSeatPlayer, setLeftSeatPlayer] = createSignal<boolean>(false);
  const [cardLocX, setCardLocX] = createSignal<number>(0);
  //refs
  let thisPlayerCard!: HTMLDivElement;
  let thisPlayerDragCard!: HTMLDivElement;
  let thisPlayerVis!: HTMLDivElement;
  let xOffset: number, yOffset: number;
  //Values
  let startingPodRef: HTMLDivElement;

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
    if (draggingCard && thisPlayerState().lastEvent) {
      dragInit(thisPlayerState().lastEvent!);
    }
  });

  const dragInit = (event: MouseEvent | TouchEvent) => {
    if (playerCardMode() !== "dragging") {
      setPlayerCardMode("dragging");
      thisPlayerCard.style.zIndex = "10";
      thisPlayerCard.style.position = "absolute";
      thisPlayerCard.style.left = `${
        thisPlayerCard.getBoundingClientRect().left
      }px`;
      thisPlayerCard.style.top = `${
        thisPlayerCard.getBoundingClientRect().top
      }px`;

      if (event instanceof MouseEvent) {
        thisPlayerCard.style.pointerEvents = "none";
        xOffset = event.clientX - thisPlayerCard.offsetLeft + window.scrollX;

        yOffset = event.clientY - thisPlayerCard.offsetTop + window.scrollY;
      } else if (event instanceof TouchEvent) {
        xOffset =
          event.touches[0].clientX -
          thisPlayerDragCard.offsetLeft +
          window.scrollX;
        yOffset =
          event.touches[0].clientY -
          thisPlayerDragCard.offsetTop +
          window.scrollY;
      }
      updatePlayer(playerID, { address: { podId: podId(), seat: 0 } });

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
      console.log("dragging");

      if (event instanceof MouseEvent) {
        const x = event.clientX + window.scrollX;
        const y = event.clientY + window.scrollY;
        thisPlayerCard.style.left = `${x + window.scrollX}px`;
        thisPlayerCard.style.top = `${y + window.scrollY}px`;
      } else if (event instanceof TouchEvent) {
        const x = event.touches[0].clientX + window.scrollX;
        const y = event.touches[0].clientY + window.scrollY;
        thisPlayerCard.style.top = `${y + window.scrollY}px`;
      }
      // setCardLocX(thisPlayerDragCard.getBoundingClientRect().x);

      // if (podHovered().hovered) {
      //   updatePlayer(playerID, {
      //     address: { podId: podHovered().state!.podId, seat: 0 },
      //   });
      // }
    }
  };

  const dragEnd = () => {
    thisPlayerCard.style.position = "static";
    thisPlayerCard.style.pointerEvents = "auto";
    setPlayerCardMode("noSeat");
    updatePlayer(playerID, {
      address: { podId: podId(), seat: thisPlayerState().lastSeat! },
    });

    // if (
    //   podHovered().hovered &&
    //   hoveredSeat() &&
    //   !hoveredSeat()?.filled &&
    //   hoveredSeat()?.podId === podHovered().state?.podId
    // ) {
    //   updatePlayer(playerID, {
    //     address: {
    //       podId: hoveredSeat()!.podId,
    //       seat: hoveredSeat()!.seatNumber,
    //     },
    //   });
    // } else if (
    //   podHovered().hovered &&
    //   podHovered().state!.podSeats.find((seat) => !seat.filled)
    // ) {
    //   updatePlayer(playerID, {
    //     address: {
    //       podId: podHovered().state!.podId,
    //       seat: podHovered().state!.podSeats.find((seat) => !seat.filled)!
    //         .seatNumber,
    //     },
    //   });
    // } else if (!podHovered().hovered || thisPlayerState().seat === 0) {
    //   updatePlayer(playerID, {
    //     address: {
    //       podId: 0,
    //       seat: 0,
    //     },
    //   });
    // }

    document.removeEventListener("mousemove", dragging);
    document.removeEventListener("mouseup", dragEnd);
    document.removeEventListener("touchmove", dragging);
    document.removeEventListener("touchend", dragEnd);
  };

  return (
    <div
      class={styles.playerCardCNT}
      ref={thisPlayerCard}
      onMouseDown={(event) => {
        if (!thisPodState() || thisPodState()!.podStatus === "seating") {
          // console.log(thisPlayerState());
          // dragInit(event);
          updatePlayer(playerID, { lastSeat: seatNumber });
          updatePlayer(playerID, { lastEvent: event });
          updatePlayer(playerID, { address: { podId: podId(), seat: 0 } });
        }
      }}
      onTouchStart={(event) => {
        if (!thisPodState() || thisPodState()!.podStatus === "seating") {
          // dragInit(event);
        }
      }}
    >
      <Switch fallback={<></>}>
        <Match when={playerCardMode() === "noSeat"}>
          <div
            // ref={thisPlayerVis}
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
            // ref={thisPlayerVis}
            class={`${
              leftSeatPlayer() ? styles.playerLVisCNT : styles.playerRVisCNT
            }`}
            // style={{ "background-color": "red" }}
          >
            <div class={styles.playerIcon}></div>
            <div class={styles.playerName}>{playerName}</div>
          </div>
        </Match>
        {/* <Match when={playerCardMode() === "hoveringSeat"}>
          <div class={styles.playerName} onclick={() => {}}>
            {playerName}
          </div>
        </Match>
        <Match when={playerCardMode() === "seated"}>
          <div class={styles.playerName} onclick={() => {}}>
            {playerName}
          </div>
        </Match> */}
      </Switch>
    </div>
  );
}
