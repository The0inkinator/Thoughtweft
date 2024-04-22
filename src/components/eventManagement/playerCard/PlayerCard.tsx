import "./playerCard.css";
import { useEventContext } from "~/context/EventContext";
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
  const [eventState, { setPlayerDrag }] = useEventContext();
  //Local State
  const [playerCardMode, setPlayerCardMode] = createSignal<CardMode>("noSeat");
  //refs

  let thisPlayerCard!: HTMLDivElement;
  let xOffset: number, yOffset: number;

  const thisPlayerState = createMemo(() => {
    return eventState().evtPlayerList.find((player) => player.id === playerID)!;
  });

  const playerPodId = () => {
    const podToCheck = eventState().evtPods.find(
      (pod) => pod.podNumber === thisPlayerState().pod
    );

    if (
      podToCheck?.podId &&
      podToCheck.podSeats.length >= thisPlayerState().seat
    ) {
      return podToCheck.podId;
    } else {
      return 0;
    }
  };

  const hoveredSeat = () => {
    let allSeats: FullSeat[] = [];
    eventState().evtPods.map((pod) => {
      pod.podSeats.map((seat) => {
        allSeats.push(seat);
      });
    });
    const tempHoveredSeat = allSeats.find((seat) => seat.hovered === true)!;

    return tempHoveredSeat;
  };

  createEffect(() => {
    // console.log(hoveredSeat());
  });

  const targetSeat = () => {
    if (playerPodId() > 0) {
      return eventState()
        .evtPods.find((pod) => pod.podId === playerPodId())!
        .podSeats.find((seat) => seat.seatNumber === thisPlayerState().seat)!
        .seatRef;
    } else {
      return eventState().playerHopper!;
    }
  };

  const updateChild = () => {
    targetSeat()?.appendChild(thisPlayerCard);
  };

  createEffect(() => {
    if (thisPlayerCard.parentNode !== targetSeat()) {
      setTimeout(updateChild, 1);
    }
  });

  const dragInit = (event: MouseEvent) => {
    if (playerCardMode() !== "dragging") {
      setPlayerCardMode("dragging");
      setPlayerDrag(playerID, true);
      event.preventDefault;
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
    setPlayerCardMode("noSeat");
    setPlayerDrag(playerID, false);
    thisPlayerCard.style.position = "static";
    thisPlayerCard.style.top = "0px";
    thisPlayerCard.style.left = "0px";
    thisPlayerCard.style.pointerEvents = "intial";
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
