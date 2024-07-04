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
import { FullSeat, Pod } from "~/typing/eventTypes";
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
  let startingPodRef: HTMLDivElement;

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

  const podHovered: () => { hovered: boolean; state?: Pod } = () => {
    const foundPod = eventState().evtPods.find((pod) => pod.podHovered);
    if (foundPod) {
      return { hovered: true, state: foundPod };
    } else {
      return { hovered: false };
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
      return seat;
    } else {
      return eventState().playerHopper;
    }
  };

  createEffect(() => {
    if (
      cardLocX() !== thisPlayerCard.getBoundingClientRect().x &&
      playerCardMode() !== "dragging"
    ) {
      setCardLocX(thisPlayerCard.getBoundingClientRect().x);
    } else if (
      thisPlayerVis &&
      cardLocX() !== thisPlayerVis.getBoundingClientRect().x &&
      playerCardMode() === "dragging"
    ) {
      setCardLocX(thisPlayerVis.getBoundingClientRect().x);
    }
  });
  createEffect(() => {
    if (thisPodState()?.podRef && thisPodState()?.podRef?.parentElement) {
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
      //----------------------
      thisPlayerVis.style.zIndex = "10";
      thisPlayerVis.style.position = "absolute";
      thisPlayerVis.style.left = `${
        thisPlayerCard.getBoundingClientRect().left
      }px`;
      thisPlayerVis.style.top = `${
        thisPlayerCard.getBoundingClientRect().top
      }px`;

      if (event instanceof MouseEvent) {
        thisPlayerCard.style.pointerEvents = "none";
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
      if (event instanceof MouseEvent) {
        const x = event.clientX - xOffset + window.scrollX;
        const y = event.clientY - yOffset + window.scrollY;
        thisPlayerVis.style.left = `${x + window.scrollX}px`;
        thisPlayerVis.style.top = `${y + window.scrollY}px`;
      } else if (event instanceof TouchEvent) {
        console.log("touch move triggered");
        const x = event.touches[0].clientX - xOffset + window.scrollX;
        const y = event.touches[0].clientY - yOffset + window.scrollY;
        thisPlayerVis.style.left = `${x + window.scrollX}px`;
        thisPlayerVis.style.top = `${y + window.scrollY}px`;
      }
      setCardLocX(thisPlayerVis.getBoundingClientRect().x);

      if (podHovered().hovered) {
        updatePlayer(playerID, {
          address: { podId: podHovered().state!.podId, seat: 0 },
        });
      }
    }
  };

  const dragEnd = () => {
    thisPlayerCard.style.position = "static";
    thisPlayerCard.style.pointerEvents = "auto";
    //----------------------
    thisPlayerVis.style.position = "static";
    thisPlayerVis.style.left = `0px`;
    thisPlayerVis.style.top = `0px`;
    setPlayerCardMode("noSeat");
    updatePlayer(playerID, { drag: false });

    if (
      podHovered().hovered &&
      hoveredSeat() &&
      !hoveredSeat()?.filled &&
      hoveredSeat()?.podId === podHovered().state?.podId
    ) {
      updatePlayer(playerID, {
        address: {
          podId: hoveredSeat()!.podId,
          seat: hoveredSeat()!.seatNumber,
        },
      });
    } else if (
      podHovered().hovered &&
      podHovered().state!.podSeats.find((seat) => !seat.filled)
    ) {
      updatePlayer(playerID, {
        address: {
          podId: podHovered().state!.podId,
          seat: podHovered().state!.podSeats.find((seat) => !seat.filled)!
            .seatNumber,
        },
      });
    } else if (!podHovered().hovered || thisPlayerState().seat === 0) {
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
    //Prevents duplicate player cards add adds the player card ref to the state
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
    setCardLocX(thisPlayerCard.getBoundingClientRect().x);
    setTimeout(() => {
      if (thisPodState()?.podRef) {
        const podRects = thisPodState()!.podRef!.getBoundingClientRect();
        if (cardLocX() < podRects.left + podRects.width / 2) {
          setLeftSeatPlayer(true);
        }
      }
    }, 1);
  });

  createEffect(() => {
    console.log(playerCardMode());
  });

  return (
    <div
      class={styles.playerCardCNT}
      ref={thisPlayerCard}
      // style={{
      //   outline:
      //     playerCardMode() === "dragging"
      //       ? "solid thin blue"
      //       : "solid thin red",
      // }}
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
            <div
              class={styles.playerIcon}
              style={{
                "background-color":
                  playerCardMode() === "dragging" ? "red" : "grey",
              }}
            ></div>
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
                <div
                  class={styles.playerIcon}
                  style={{
                    "background-color":
                      playerCardMode() === "dragging" ? "red" : "grey",
                  }}
                ></div>
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
