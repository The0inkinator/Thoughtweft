import "./playerCard.css";
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
import { seatDataFromDiv } from "~/context/EventDataFunctions";

interface PlayerCardInputs {
  playerID: number;
  playerName: string;
  podNumber: number;
  seatNumber: number;
}

type CardMode = "noSeat" | "dragging" | "hoveringSeat" | "seated";

export default function PlayerCard({
  playerID,
  playerName,
  podNumber,
  seatNumber,
}: PlayerCardInputs) {
  //Context State
  const [eventState, { setPlayerDrag, updatePlayer, updateSeat }] =
    useEventContext();
  const [hovRefState, { updateHovRef }] = useHovRefContext();
  //Local State
  const [playerCardMode, setPlayerCardMode] = createSignal<CardMode>("noSeat");
  //refs

  let thisPlayerCard!: HTMLDivElement;
  let xOffset: number, yOffset: number;
  let storedTargetSeat: HTMLDivElement;
  let pastTargetSeat: HTMLDivElement;

  const thisPlayerState = createMemo(() => {
    return eventState().evtPlayerList.find((player) => player.id === playerID)!;
  });

  const podIdtoPodNum = (input: number) => {
    const foundPod = eventState().evtPods.find((pod) => pod.podId === input);
    if (foundPod) {
      return foundPod.podNumber;
    } else {
      return input;
    }
  };

  const hoveredSeat = () => {
    let allSeats: FullSeat[] = [];
    eventState().evtPods.map((pod) => {
      pod.podSeats.map((seat) => {
        allSeats.push(seat);
      });
    });
    const tempHoveredSeat = allSeats.find((seat) => seat.hovered === true);
    if (tempHoveredSeat) {
      return tempHoveredSeat;
    } else {
      return {
        podId: 0,
        seatNumber: 0,
        filled: false,
        hovered: false,
        seatRef: eventState().playerHopper,
      };
    }
  };

  const targetSeat = () => {
    const seatRef = eventState()
      .evtPods.find((pod) => pod.podId === thisPlayerState().pod)
      ?.podSeats.find((seat) => seat.seatNumber === thisPlayerState().seat);

    if (seatRef && seatRef.seatRef?.childElementCount === 0) {
      storedTargetSeat = seatRef.seatRef;
      return seatRef.seatRef;
    } else if (seatRef) {
      return storedTargetSeat;
    } else {
      return eventState().playerHopper!;
    }
  };

  //updates target seats and their filled status
  createEffect(() => {
    if (targetSeat() !== thisPlayerCard.parentElement && targetSeat()) {
      targetSeat().appendChild(thisPlayerCard);
      const currentSeat = seatDataFromDiv(eventState(), targetSeat());
      if (currentSeat) {
        updateSeat(currentSeat.podId, currentSeat.seatNumber, { filled: true });
      }
      pastTargetSeat = targetSeat();
    }
  });

  const dragInit = (event: MouseEvent) => {
    if (playerCardMode() !== "dragging") {
      setPlayerCardMode("dragging");
      setPlayerDrag(playerID, true);
      event.preventDefault;
      const pastSeat = seatDataFromDiv(eventState(), pastTargetSeat);
      if (pastSeat) {
        updateSeat(pastSeat.podId, pastSeat.seatNumber, { filled: false });
      }
      xOffset = event.clientX - thisPlayerCard.offsetLeft;
      yOffset = event.clientY - thisPlayerCard.offsetTop;
      thisPlayerCard.style.position = "absolute";
      thisPlayerCard.style.pointerEvents = "none";
      document.addEventListener("mousemove", dragging);
      document.addEventListener("mouseup", dragEnd);
    }
  };
  const dragging = (event: MouseEvent) => {
    if (playerCardMode() === "dragging") {
      event.preventDefault;
      const x = event.clientX - xOffset;
      const y = event.clientY - yOffset;
      thisPlayerCard.style.left = `${x}px`;
      thisPlayerCard.style.top = `${y}px`;
      thisPlayerCard.style.zIndex = "4";
    }
  };
  const dragEnd = () => {
    thisPlayerCard.style.pointerEvents = "auto";
    setPlayerCardMode("noSeat");
    setPlayerDrag(playerID, false);
    thisPlayerCard.style.position = "static";
    thisPlayerCard.style.left = `0px`;
    thisPlayerCard.style.top = `0px`;

    if (hoveredSeat().filled === false) {
      updatePlayer(playerID, {
        address: { podId: hoveredSeat().podId, seat: hoveredSeat().seatNumber },
      });
    }

    document.removeEventListener("mousemove", dragging);
    document.removeEventListener("mouseup", dragEnd);
  };

  return (
    <div
      class="playerCardCont"
      ref={thisPlayerCard}
      onMouseDown={(event) => {
        dragInit(event);
      }}
      onMouseMove={(event) => {
        dragging(event);
      }}
    >
      <Switch fallback={<></>}>
        <Match when={playerCardMode() === "noSeat"}>
          <div class="playerName" onclick={() => {}}>
            {playerName}
          </div>
        </Match>
        <Match when={playerCardMode() === "dragging"}>
          <div class="playerName" onclick={() => {}}>
            {playerName}
          </div>
        </Match>
        <Match when={playerCardMode() === "hoveringSeat"}>
          <div class="playerName" onclick={() => {}}>
            {playerName}
          </div>
        </Match>
        <Match when={playerCardMode() === "seated"}>
          <div class="playerName" onclick={() => {}}>
            {playerName}
          </div>
        </Match>
      </Switch>
    </div>
  );
}
