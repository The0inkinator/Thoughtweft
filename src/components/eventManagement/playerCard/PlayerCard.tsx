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
  const [lastSeat, setLastSeat] = createSignal<FullSeat>();
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
    } else if (!podHovered() || thisPlayerState().seat === 0) {
      return eventState().playerHopper;
    }
  };

  const hoveredSeat = () => {
    const foundSeat = seats().find((seat) => seat.hovered === true);
    if (foundSeat) {
      return foundSeat;
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

      updatePlayer(playerID, { address: { podId: 0, seat: 0 } });
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

      if (hoveredSeat()) {
        setLastSeat(hoveredSeat());
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

    if (
      podHovered() &&
      lastSeat() &&
      lastSeat()?.seatRef !== targetSeatRef() &&
      !lastSeat()?.filled
    ) {
      updatePlayer(playerID, {
        address: {
          podId: lastSeat()!.podId,
          seat: lastSeat()!.seatNumber,
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

  onMount(() => {
    updatePlayer(playerID, { ref: thisPlayerCard });
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
