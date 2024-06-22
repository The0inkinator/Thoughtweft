import "./podCard.css";
import {
  createEffect,
  createSignal,
  For,
  onMount,
  Index,
  createMemo,
  ErrorBoundary,
  Switch,
  Match,
} from "solid-js";
import { useEventContext } from "~/context/EventContext";
import DisplayFrame from "../displayFrame";
import PlayerSeat from "../playerSeat";
import TestElement from "~/components/Test/TestElement";
import { PodSizes, PodStatusModes } from "~/typing/eventTypes";
import TestBox from "~/components/Test/TestBox";
interface PodCardInputs {
  podSize: PodSizes;
  podNumber: number;
  podId: number;
}

//MAIN FUNCTION
export default function PodCard({ podSize, podNumber, podId }: PodCardInputs) {
  //Context State
  const [eventState, { updatePodSize, removePod, updatePlayer, updatePod }] =
    useEventContext();
  //Local State
  const [localPodNumber, setLocalPodNumber] = createSignal(podNumber);
  const [shuffleMode, setShuffleMode] = createSignal<"default" | "confirm">(
    "default"
  );

  const [localPodStatus, setLocalPodStatus] =
    createSignal<PodStatusModes>("seating");

  const thisPodState = () => {
    return eventState().evtPods.find((pod) => pod.podId === podId);
  };

  const thisPodSeats = () => {
    return eventState().evtSeats.filter((seat) => seat.podId === podId);
  };

  const [podSizeBtn, setPodSizeBtn] = createSignal<PodSizes>(podSize);
  const podOptions: PodSizes[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const [podSizeDrop, setPodSizeDrop] = createSignal<"open" | "close">("close");

  const leftSeats = () => {
    return thisPodSeats().filter(
      (seat, index) => index >= thisPodSeats().length / 2
    );
  };
  const rightSeats = () => {
    return thisPodSeats().filter(
      (seat, index) => index < thisPodSeats().length / 2
    );
  };

  onMount(() => {
    updatePodSize(podId, thisPodState()!.podSize);
  });

  const shufflePod = () => {
    const shuffleArray = eventState().evtPlayerList.filter(
      (player) => player.podId === podId
    );
    for (let i = shuffleArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffleArray[i], shuffleArray[j]] = [shuffleArray[j], shuffleArray[i]];
    }

    shuffleArray.map((shuffledPlayer, index) => {
      const playerToEdit = eventState().evtPlayerList.find(
        (player) => shuffledPlayer.id === player.id
      );

      if (playerToEdit) {
        updatePlayer(playerToEdit.id, {
          address: { podId: 0, seat: 0 },
        });
      }
    });

    shuffleArray.map((shuffledPlayer, index) => {
      const playerToEdit = eventState().evtPlayerList.find(
        (player) => shuffledPlayer.id === player.id
      );

      if (playerToEdit) {
        updatePlayer(playerToEdit.id, {
          address: { podId: podId, seat: index + 1 },
        });
      }
    });
  };

  const shrinkPod = () => {
    const playersInPod = eventState().evtPlayerList.filter(
      (player) => player.podId === podId
    );
    const seatsInPod = eventState().evtPods.find(
      (pod) => pod.podId === podId
    )!.podSeats;

    playersInPod.map((player, index) => {
      const firstOpenSeat = seatsInPod.find((seat) => !seat.filled);

      if (firstOpenSeat && firstOpenSeat.seatNumber < player.seat) {
        updatePlayer(player.id, {
          address: { podId: podId, seat: firstOpenSeat.seatNumber },
        });
      }
    });

    updatePodSize(podId, playersInPod.length);
    setPodSizeBtn(playersInPod.length as PodSizes);
  };

  const SeatingPodCard = () => {
    return (
      <div class="podCardCont">
        <div class="podTitle">
          Pod: {thisPodState()?.podNumber} Id: {thisPodState()?.podId} Status:{" "}
          {thisPodState()?.podStatus} Rounds: {thisPodState()?.podRounds}
          <p></p>
          {/* POD SIZE DROP DOWN */}
          <button
            class="podSizeDrop"
            type="button"
            onMouseUp={() => {
              if (podSizeDrop() === "close") {
                setPodSizeDrop("open");
              }
            }}
            onfocusout={() => {
              if (podSizeDrop() === "open") {
                setPodSizeDrop("close");
              }
            }}
          >
            {podSizeBtn()}
            <div
              class="podSizeMenu"
              style={{
                display: podSizeDrop() === "open" ? "block" : "none",
              }}
            >
              <For each={podOptions}>
                {(option: PodSizes) => (
                  <div
                    class="podSizeOption"
                    style={{
                      display: podSizeDrop() === "open" ? "block" : "none",
                    }}
                    onClick={() => {
                      setPodSizeBtn(option);
                      setPodSizeDrop("close");
                      updatePodSize(podId, option);
                    }}
                  >
                    {option}
                  </div>
                )}
              </For>
            </div>
          </button>
          {/* REMOVE POD */}
          <button
            type="submit"
            style={{ color: "red" }}
            onClick={() => {
              removePod(podId);
            }}
          >
            Remove Pod
          </button>
          <p></p>
          {/* SHRINK POD */}
          <button
            type="submit"
            style={{ color: "red" }}
            onClick={() => {
              shrinkPod();
            }}
          >
            Shrink Pod
          </button>
          {/* SHUFFLE PLAYERS */}
          <Switch fallback={<></>}>
            <Match when={shuffleMode() === "default"}>
              <button
                type="submit"
                style={{ color: "red" }}
                onClick={() => {
                  setShuffleMode("confirm");
                }}
              >
                Shuffle Players
              </button>
            </Match>
            <Match when={shuffleMode() === "confirm"}>
              <button type="submit" style={{ color: "black" }}>
                Are you Sure?
              </button>
              <button
                type="submit"
                style={{ color: "green" }}
                onClick={() => {
                  shufflePod();
                  setShuffleMode("default");
                }}
              >
                ✔
              </button>
              <button
                type="submit"
                style={{ color: "red" }}
                onClick={() => {
                  setShuffleMode("default");
                }}
              >
                X
              </button>
            </Match>
          </Switch>
        </div>
        {/* ADVANCE TO DRAFTING */}
        <button
          type="submit"
          style={{ color: "red" }}
          onClick={() => {
            shrinkPod();
            updatePod(podId, { status: "drafting" });
          }}
        >
          Advance to Drafting
        </button>
        {/* Table Display */}
        <div class="tableCont">
          <div class="podSeats">
            <For each={rightSeats()}>
              {(seat) => (
                <PlayerSeat
                  seatNumber={seat.seatNumber}
                  podId={podId}
                  tableSide="R"
                ></PlayerSeat>
              )}
            </For>
            <div class="podTable"></div>
            <For each={leftSeats()}>
              {(seat) => (
                <PlayerSeat
                  seatNumber={seat.seatNumber}
                  podId={podId}
                  tableSide="L"
                ></PlayerSeat>
              )}
            </For>
          </div>
        </div>
      </div>
    );
  };

  const DraftingPodCard = () => {
    return (
      <>
        <button
          type="submit"
          style={{ color: "red" }}
          onClick={() => {
            shrinkPod();
            updatePod(podId, { status: "playing" });
          }}
        >
          Advance to Round 1
        </button>
      </>
    );
  };

  const PlayingPodCard = () => {
    return (
      <>
        {/* Table Display */}
        <div class="tableCont">
          <div class="podSeats">
            <For each={rightSeats()}>
              {(seat) => (
                <PlayerSeat
                  seatNumber={seat.seatNumber}
                  podId={podId}
                  tableSide="R"
                ></PlayerSeat>
              )}
            </For>
            <div class="podTable"></div>
            <For each={leftSeats()}>
              {(seat) => (
                <PlayerSeat
                  seatNumber={seat.seatNumber}
                  podId={podId}
                  tableSide="L"
                ></PlayerSeat>
              )}
            </For>
          </div>
        </div>
      </>
    );
  };

  const FinishedPodCard = () => {
    return <></>;
  };

  return (
    <DisplayFrame>
      <ErrorBoundary fallback={<>oops!</>}>
        <Switch fallback={<>oops!</>}>
          <Match when={thisPodState()?.podStatus === "seating"}>
            <SeatingPodCard />
          </Match>
          <Match when={thisPodState()?.podStatus === "drafting"}>
            <DraftingPodCard />
          </Match>
          <Match when={thisPodState()?.podStatus === "playing"}>
            <PlayingPodCard />
          </Match>
          <Match when={thisPodState()?.podStatus === "finished"}>
            <FinishedPodCard />
          </Match>
        </Switch>
      </ErrorBoundary>
    </DisplayFrame>
  );
}
