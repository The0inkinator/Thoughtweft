import "./playerCard.css";
import { useEventContext } from "~/context/EventContext";
import { createSignal, Switch, Match, onMount, createEffect } from "solid-js";

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
  const [eventState] = useEventContext();
  //Local State
  const [playerCardMode, setPlayerCardMode] = createSignal<CardMode>("noSeat");
  const [playerCardParent, setPlayerCardParent] =
    createSignal<HTMLDivElement>();
  //refs
  let thisPlayerCard!: HTMLDivElement;
  const thisPlayerState = () => {
    return eventState().evtPlayerList.find((player) => player.id === playerID)!;
  };
  const playerPodId = () => {
    const podToCheck = eventState().evtPods.find(
      (pod) => pod.podNumber === thisPlayerState().pod
    );

    if (podToCheck?.podId) {
      return podToCheck.podId;
    } else {
      return 0;
    }
  };

  onMount(() => {
    console.log(playerPodId());
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

  onMount(() => {
    setTimeout(updateChild, 1);
  });

  return (
    <div class="playerCardCont" ref={thisPlayerCard} onclick={() => {}}>
      <Switch fallback={<></>}>
        <Match when={playerCardMode() === "noSeat"}>
          <div class="playerName" onclick={() => {}}>
            {playerName}
          </div>
        </Match>
        <Match when={playerCardMode() === "dragging"}>
          <></>
        </Match>
        <Match when={playerCardMode() === "hoveringSeat"}>
          <></>
        </Match>
        <Match when={playerCardMode() === "seated"}>
          <></>
        </Match>
      </Switch>
    </div>
  );
}
