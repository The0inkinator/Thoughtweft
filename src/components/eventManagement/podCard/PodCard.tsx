import "./podCard.css";
import {
  createEffect,
  createSignal,
  For,
  onMount,
  createMemo,
  ErrorBoundary,
  Switch,
  Match,
} from "solid-js";
import { useEventContext } from "~/context/EventContext";
import DisplayFrame from "../displayFrame";
import PlayerSeat from "../playerSeat";
import { PodSizes, PodStatusModes } from "~/typing/eventTypes";
import { PairPlayers } from "./playerManagement";
import styles from "./podCard.module.css";
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

  //Timer logic
  const [draftTimerHou, setDraftTimerHou] = createSignal<number>(0);
  const [draftTimerMin, setDraftTimerMin] = createSignal<number>(0);
  const [draftTimerSec, setDraftTimerSec] = createSignal<number>(0);
  let draftTimerStarted = false;

  createEffect(() => {
    if (
      draftTimerStarted === false &&
      thisPodState()?.podStatus === "drafting"
    ) {
      draftTimerStarted = true;
      const totalTime = thisPodState()!.podDraftTime;
      const totalHours = Math.floor(totalTime / 60);
      const totalMins = totalTime - totalHours * 60;
      const totalSecs = 0;
      let tempSec;
      let tempMin;
      let tempHour;
      setDraftTimerHou(totalHours);
      setDraftTimerMin(totalMins);
      setDraftTimerSec(totalSecs);

      const loop = () => {
        if (draftTimerSec() > 0) {
          tempSec = draftTimerSec() - 1;
          setDraftTimerSec(tempSec);
          setTimeout(loop, 1000);
        } else if (draftTimerMin() > 0) {
          tempMin = draftTimerMin() - 1;
          tempSec = 59;
          setDraftTimerMin(tempMin);
          setDraftTimerSec(tempSec);
          setTimeout(loop, 1000);
        } else if (draftTimerHou() > 0) {
          tempHour = draftTimerHou() - 1;
          tempMin = 59;
          tempSec = 59;
          setDraftTimerHou(tempHour);
          setDraftTimerMin(tempMin);
          setDraftTimerSec(tempSec);
          setTimeout(loop, 1000);
        }
      };

      setTimeout(loop, 1000);
    }
  });

  const DraftingPodCard = () => {
    return (
      <>
        <button
          type="submit"
          style={{ color: "red" }}
          onClick={() => {
            updatePod(podId, { round: 1 });
            PairPlayers(eventState(), podId).map((match) => {
              updatePod(podId, { newMatch: match });
            });

            console.log(thisPodState()?.podMatches);
            updatePod(podId, { status: "pairing" });
          }}
        >
          Advance to Matches
        </button>
        <div>
          {draftTimerHou()} {draftTimerMin()} {draftTimerSec()}
        </div>
      </>
    );
  };

  const PairingPodCard = () => {
    return (
      <>
        <div>Pairing Round {thisPodState()?.currentRound}</div>
        {/* Table Display */}
        <div class={styles.pairingTableCont}>
          <For each={thisPodState()?.podMatches}>
            {(match) => (
              <div class={styles.matchCont}>
                <PlayerSeat
                  seatNumber={match.player1Seat}
                  podId={podId}
                  tableSide="R"
                ></PlayerSeat>
              </div>
            )}
          </For>
          {/* <div class="podSeats">
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
          </div> */}
        </div>
      </>
    );
  };

  const PlayingPodCard = () => {
    return (
      <>
        <div>Round {thisPodState()?.currentRound}</div>
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
          <Match when={thisPodState()?.podStatus === "pairing"}>
            <PairingPodCard />
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
