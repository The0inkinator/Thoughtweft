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
  const [leftSeatPlayer, setLeftSeatPlayer] = createSignal<boolean>(false);
  const [cardLocX, setCardLocX] = createSignal<number>(0);
  //refs
  let thisPlayerCard!: HTMLDivElement;
  let thisPlayerVis!: HTMLDivElement;
  let xOffset: number, yOffset: number;
  //Values

  const thisPlayerState = createMemo(() => {
    return eventState().evtPlayerList.find((player) => player.id === playerID)!;
  });

  const thisPodState = createMemo(() => {
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
    const pod = eventState().evtPods.find(
      (pod) => pod.podId === thisPlayerState().podId
    );
    const seat = pod?.podSeats.find(
      (seat) => seat.seatNumber === thisPlayerState().seat
    )?.seatRef;

    if (seat) {
      // console.log("target seat found");
      return seat;
    } else {
      return eventState().playerHopper;
    }
  };

  createEffect(() => {
    console.log(thisPodState());
  });

  createEffect(() => {
    if (thisPodState()?.podRef) {
      const podRect = thisPodState()!.podRef!.getBoundingClientRect();
      const podMiddle = podRect.width / 2 + podRect.left;

      if (cardLocX() > podMiddle && leftSeatPlayer()) {
        setLeftSeatPlayer(false);
      } else if (cardLocX() < podMiddle && !leftSeatPlayer()) {
        setLeftSeatPlayer(true);
      }
    }
  });

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
        setCardLocX(thisPlayerCard.getBoundingClientRect().x);

        if (
          staticTSRef === eventState().playerHopper &&
          thisPlayerState().elMounted &&
          playerCardMode() !== "dragging"
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
      thisPlayerCard.style.position = "absolute";
      thisPlayerCard.style.pointerEvents = "none";
      thisPlayerCard.style.touchAction = "none";
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

      updatePlayer(playerID, { address: { podId: podId, seat: 0 } });

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
      setCardLocX(thisPlayerCard.getBoundingClientRect().x);
    }
  };

  const dragEnd = () => {
    thisPlayerCard.style.position = "static";
    thisPlayerCard.style.pointerEvents = "auto";
    thisPlayerCard.style.touchAction = "auto";
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
    } else if (
      podHovered() &&
      thisPodState()?.podSeats.find((seat) => !seat.filled)
    ) {
      updatePlayer(playerID, {
        address: {
          podId: thisPodState()!.podId,
          seat: thisPodState()!.podSeats.find((seat) => !seat.filled)!
            .seatNumber,
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
    //This code prevents duplicat player cards add adds the player card ref to the state
    if (
      thisPlayerState().elMounted?.parentElement &&
      thisPlayerState().elMounted !== thisPlayerCard
    ) {
      if (
        thisPlayerCard.parentElement &&
        thisPlayerCard.parentElement.childElementCount > 0
      ) {
        thisPlayerState().elMounted?.remove();
        updatePlayer(playerID, { elMounted: thisPlayerCard });
      }
    }
    updatePlayer(playerID, { elMounted: thisPlayerCard });
  });

  return (
    <div
      class={styles.playerCardCNT}
      ref={thisPlayerCard}
      onMouseDown={(event) => {
        if (!thisPodState() || thisPodState()!.podStatus === "seating") {
          dragInit(event);
        }
      }}
      onTouchStart={(event) => {
        if (!thisPodState() || thisPodState()!.podStatus === "seating") {
          dragInit(event);
        }
      }}
    >
      <Switch fallback={<></>}>
        <Match when={playerCardMode() === "noSeat"}>
          <div
            class={`${
              leftSeatPlayer() ? styles.playerLVisCNT : styles.playerRVisCNT
            }`}
          >
            <div class={styles.playerIcon}></div>
            <div class={styles.playerName}>{playerName}</div>
          </div>
        </Match>
        <Match when={playerCardMode() === "dragging"}>
          <Portal>
            <div class={styles.playerCardCNT} ref={thisPlayerVis}>
              <div
                class={`${
                  leftSeatPlayer() ? styles.playerLVisCNT : styles.playerRVisCNT
                }`}
              >
                <div class={styles.playerIcon}></div>
                <div class={styles.playerName}>{playerName}</div>
              </div>
            </div>
          </Portal>
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
