import styles from "./playerCard.module.css";
import { useEventContext } from "~/context/EventContext";
import {
  createSignal,
  Switch,
  Match,
  createEffect,
  createMemo,
} from "solid-js";
import { Portal } from "solid-js/web";
import { FullSeat } from "~/typing/eventTypes";
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

  const lastHoveredSeat = () => {
    let allSeats: FullSeat[] = [];
    eventState().evtPods.map((pod) => {
      pod.podSeats.map((seat) => {
        allSeats.push(seat);
      });
    });
    const tempHoveredSeat = allSeats.find((seat) => seat.hovered === true);
    if (tempHoveredSeat) {
      return tempHoveredSeat;
    }
  };

  const podHovered = () => {
    if (eventState().evtPods.find((pod) => pod.podId === podId)?.podHovered) {
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
    } else if (!podHovered()) {
      return eventState().playerHopper;
    }
  };

  createEffect(() => {
    if (thisPlayerCard.parentElement !== targetSeatRef()) {
      targetSeatRef()?.appendChild(thisPlayerCard);
      setTimeout(() => {
        if (targetSeatRef() === eventState().playerHopper) {
          updatePlayer(playerID, { address: { podId: 0, seat: 0 } });
        }
      }, 10);
    }
  });

  const dragInit = (event: MouseEvent) => {
    if (playerCardMode() !== "dragging") {
      setPlayerCardMode("dragging");
      updatePlayer(playerID, { drag: true });
      event.preventDefault;
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
      xOffset = event.clientX - thisPlayerVis.offsetLeft;
      yOffset = event.clientY - thisPlayerVis.offsetTop;

      updatePlayer(playerID, { address: { podId: -1, seat: -1 } });
      document.addEventListener("mousemove", dragging);
      document.addEventListener("mouseup", dragEnd);
    }
  };

  const dragging = (event: MouseEvent) => {
    if (playerCardMode() === "dragging") {
      event.preventDefault;
      const x = event.clientX - xOffset;
      const y = event.clientY - yOffset;
      thisPlayerVis.style.left = `${x}px`;
      thisPlayerVis.style.top = `${y}px`;
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

    if (
      lastHoveredSeat() &&
      lastHoveredSeat() !== targetSeatRef() &&
      lastHoveredSeat()?.seatRef?.childElementCount === 0
    ) {
      updatePlayer(playerID, {
        address: {
          podId: lastHoveredSeat()!.podId,
          seat: lastHoveredSeat()!.seatNumber,
        },
      });
    } else if (!podHovered()) {
      updatePlayer(playerID, {
        address: {
          podId: 0,
          seat: 0,
        },
      });
    }

    document.removeEventListener("mousemove", dragging);
    document.removeEventListener("mouseup", dragEnd);
  };

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
      onMouseMove={(event) => {
        dragging(event);
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
