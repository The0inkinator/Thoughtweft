import styles from "./playerCard.module.css";
import { useEventContext } from "~/context/EventContext";
import {
  createSignal,
  Switch,
  Match,
  createEffect,
  createMemo,
  onMount,
} from "solid-js";
import { seatDataFromDiv } from "~/context/EventDataFunctions";
import { Portal } from "solid-js/web";
import { FullSeat } from "~/typing/eventTypes";
import seat from "../seat";
interface PlayerCardInputs {
  playerID: number;
  playerName: string;
  podId: number;
  seatNumber: number;
}

type CardMode = "noSeat" | "dragging" | "hoveringSeat" | "seated";

export default function PlayerCard({
  playerID,
  playerName,
  podId,
  seatNumber,
}: PlayerCardInputs) {
  //Context State
  const [eventState, { updatePlayer, updateSeat }] = useEventContext();
  //Local State
  const [playerCardMode, setPlayerCardMode] = createSignal<CardMode>("noSeat");
  const [hoveredSeat, setHoveredSeat] = createSignal<FullSeat | undefined>();
  //refs

  let thisPlayerCard!: HTMLDivElement;
  let thisPlayerVis!: HTMLDivElement;
  let xOffset: number, yOffset: number;
  let pastTargetSeatRef: HTMLDivElement;

  const thisPlayerState = createMemo(() => {
    return eventState().evtPlayerList.find((player) => player.id === playerID)!;
  });

  const thisPlayerPodState = createMemo(() => {
    return eventState().evtPods.find(
      (pod) => pod.podId === thisPlayerState().podId
    );
  });

  const seats = () => {
    let allSeats: FullSeat[] = [];
    eventState().evtPods.map((pod) => {
      pod.podSeats.map((seat) => {
        allSeats.push(seat);
      });
    });
    return allSeats;
  };

  const podHovered = () => {
    if (eventState().evtPods.find((pod) => pod.podHovered)) {
      return true;
    } else {
      return false;
    }
  };

  const targetSeatRef = () => {
    const seat = eventState()
      .evtPods.find((pod) => pod.podId === thisPlayerState().podId)
      ?.podSeats.find(
        (seat) => seat.seatNumber === thisPlayerState().seat
      )?.seatRef;

    if (seat) {
      return seat;
    } else {
      return eventState().playerHopper;
    }
  };

  createEffect(() => {
    const singleHoveredSeat = seats().find((seat) => seat.hovered);
    if (singleHoveredSeat !== hoveredSeat() && singleHoveredSeat) {
      setHoveredSeat(singleHoveredSeat);
    }
  });

  createEffect(() => {
    const staticTSRef = targetSeatRef();
    if (thisPlayerCard.parentElement !== staticTSRef) {
      if (staticTSRef instanceof HTMLDivElement) {
        staticTSRef.appendChild(thisPlayerCard);

        if (
          staticTSRef === eventState().playerHopper &&
          thisPlayerState().elMounted
        ) {
          updatePlayer(playerID, { address: { podId: 0, seat: 0 } });
        }
      }
    }
  });

  const dragInit = (event: MouseEvent | TouchEvent) => {
    if (playerCardMode() !== "dragging") {
      setPlayerCardMode("dragging");
      updatePlayer(playerID, { drag: true });
      event.preventDefault();
      thisPlayerCard.style.position = "absolute";
      thisPlayerCard.style.pointerEvents = "none";
      thisPlayerVis.style.position = "absolute";
      thisPlayerVis.style.zIndex = "10";
      thisPlayerVis.style.left = `${
        thisPlayerCard.getBoundingClientRect().left
      }px`;
      thisPlayerVis.style.top = `${
        thisPlayerCard.getBoundingClientRect().top
      }px`;
      if (event instanceof MouseEvent) {
        xOffset = event.clientX - thisPlayerVis.offsetLeft + window.scrollX;

        yOffset = event.clientY - thisPlayerVis.offsetTop + window.scrollY;
      } else if (event instanceof TouchEvent) {
        xOffset =
          event.touches[0].clientX - thisPlayerVis.offsetLeft + window.scrollX;
        yOffset =
          event.touches[0].clientY - thisPlayerVis.offsetTop + window.scrollY;
      }
      dragging(event);

      updatePlayer(playerID, { address: { podId: 0, seat: 0 } });

      if (event instanceof MouseEvent) {
        document.addEventListener("mousemove", dragging, { passive: false });
        document.addEventListener("mouseup", dragEnd, { passive: false });
      } else if (event instanceof TouchEvent) {
        document.addEventListener("touchmove", dragging, { passive: false });
        document.addEventListener("touchend", dragEnd, { passive: false });
      }
    }
  };

  const dragging = (event: MouseEvent | TouchEvent) => {
    if (playerCardMode() === "dragging") {
      event.preventDefault();
      if (event instanceof MouseEvent) {
        const x = event.clientX - xOffset + window.scrollX;
        const y = event.clientY - yOffset + window.scrollY;
        thisPlayerVis.style.left = `${x + window.scrollX}px`;
        thisPlayerVis.style.top = `${y + window.scrollY}px`;
      } else if (event instanceof TouchEvent) {
        const x = event.touches[0].clientX - xOffset + window.scrollX;
        const y = event.touches[0].clientY - yOffset + window.scrollY;
        thisPlayerVis.style.left = `${x + window.scrollX}px`;
        thisPlayerVis.style.top = `${y + window.scrollY}px`;
      }
    }
  };

  const dragEnd = () => {
    thisPlayerCard.style.position = "static";
    thisPlayerCard.style.pointerEvents = "auto";
    setPlayerCardMode("noSeat");
    updatePlayer(playerID, { drag: false });
    thisPlayerVis.style.position = "static";
    thisPlayerVis.style.left = `0px`;
    thisPlayerVis.style.top = `0px`;

    if (podHovered() && hoveredSeat() && !hoveredSeat()?.filled) {
      updatePlayer(playerID, {
        address: {
          podId: hoveredSeat()!.podId,
          seat: hoveredSeat()!.seatNumber,
        },
      });
    } else if (!podHovered() || thisPlayerState().seat === 0) {
      updatePlayer(playerID, {
        address: {
          podId: 0,
          seat: 0,
        },
      });
    }

    document.removeEventListener("mousemove", dragging);
    document.removeEventListener("mouseup", dragEnd);
    document.removeEventListener("touchmove", dragging);
    document.removeEventListener("touchend", dragEnd);
  };

  onMount(() => {
    updatePlayer(playerID, { elMounted: true });
  });

  return (
    <div
      class={styles.playerCardCont}
      ref={thisPlayerCard}
      onMouseDown={(event) => {
        if (
          !thisPlayerPodState() ||
          thisPlayerPodState()!.podStatus === "seating"
        ) {
          dragInit(event);
        }
      }}
      onTouchStart={(event) => {
        if (
          !thisPlayerPodState() ||
          thisPlayerPodState()!.podStatus === "seating"
        ) {
          dragInit(event);
        }
      }}
    >
      <Switch fallback={<></>}>
        <Match when={playerCardMode() === "noSeat"}>
          <div class={styles.playerName} onclick={() => {}}>
            {playerName}
          </div>
        </Match>
        <Match when={playerCardMode() === "dragging"}>
          <Portal>
            <div
              class={styles.playerName}
              ref={thisPlayerVis}
              onclick={() => {}}
            >
              {playerName}
              {/* {hoveredSeat()?.podId} {hoveredSeat()?.seatNumber} */}
            </div>
          </Portal>
        </Match>
        <Match when={playerCardMode() === "hoveringSeat"}>
          <div class={styles.playerName} onclick={() => {}}>
            {playerName}
          </div>
        </Match>
        <Match when={playerCardMode() === "seated"}>
          <div class={styles.playerName} onclick={() => {}}>
            {playerName}
          </div>
        </Match>
      </Switch>
    </div>
  );
}
