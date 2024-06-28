import styles from "./playerCard.module.css";
import { useEventContext } from "~/context/EventContext";
import { useHovRefContext } from "~/context/HovRefContext";
import {
  createSignal,
  Switch,
  Match,
  onMount,
  createEffect,
  onCleanup,
  createMemo,
} from "solid-js";
import { Portal } from "solid-js/web";
import { FullSeat } from "~/typing/eventTypes";
import {
  podIdtoPodNum,
  podNumtoPodId,
  seatDataFromDiv,
} from "~/context/EventDataFunctions";

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
  const [hovRefState, { updateHovRef }] = useHovRefContext();
  //Local State
  const [playerCardMode, setPlayerCardMode] = createSignal<CardMode>("noSeat");
  const [hoveredSeat, setHoveredSeat] = createSignal<HTMLDivElement>();
  //refs

  let thisPlayerCard!: HTMLDivElement;
  let thisPlayerVis!: HTMLDivElement;
  let xOffset: number, yOffset: number;
  let pastTargetSeat: HTMLDivElement;

  const thisPlayerState = createMemo(() => {
    return eventState().evtPlayerList.find((player) => player.id === playerID)!;
  });

  const thisPlayerPodState = createMemo(() => {
    return eventState().evtPods.find(
      (pod) => pod.podId === thisPlayerState().podId
    );
  });

  // const hoveredSeat = () => {
  //   let allSeats: FullSeat[] = [];
  //   eventState().evtPods.map((pod) => {
  //     pod.podSeats.map((seat) => {
  //       allSeats.push(seat);
  //     });
  //   });
  //   const tempHoveredSeat = allSeats.find((seat) => seat.hovered === true);
  //   if (tempHoveredSeat) {
  //     return tempHoveredSeat;
  //   } else {
  //     return {
  //       podId: 0,
  //       seatNumber: 0,
  //       filled: false,
  //       hovered: false,
  //       seatRef: eventState().playerHopper,
  //     };
  //   }
  // };

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

  const targetSeat = createMemo(() => {
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
  });

  createEffect(() => {
    if (thisPlayerCard.parentElement !== targetSeat()) {
      targetSeat()?.appendChild(thisPlayerCard);
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

      // const currentSeat = seatDataFromDiv(eventState(), targetSeat());

      // if (currentSeat) {
      //   updateSeat(currentSeat.podId, currentSeat.seatNumber, {
      //     filled: false,
      //   });
      // }

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

    if (!podHovered()) {
      console.log("drop to hopper");
      updatePlayer(playerID, { address: { podId: 0, seat: 0 } });
    }
    // if (hoveredSeat().filled === false) {
    //   updatePlayer(playerID, {
    //     address: { podId: hoveredSeat().podId, seat: hoveredSeat().seatNumber },
    //   });
    // }

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
