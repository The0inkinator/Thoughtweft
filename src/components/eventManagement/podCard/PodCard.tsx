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
import Seat from "../seat";
import { MatchData, PodSizes, PodStatusModes } from "~/typing/eventTypes";
import PairPlayers from "./pairingFunctions/pairPlayers";
import styles from "./podCard.module.css";
import MatchCard from "../matchCard";
import CreateStandings from "./pairingFunctions/createStandings";
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
  const [shuffleMode, setShuffleMode] = createSignal<"default" | "confirm">(
    "default"
  );

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
      <>
        <div class={styles.podTitle}>
          Pod: {thisPodState()?.podNumber} Id: {thisPodState()?.podId} Status:{" "}
          {thisPodState()?.podStatus} Rounds: {thisPodState()?.podRounds}
          <p></p>
          {/* POD SIZE DROP DOWN */}
          <button
            class={styles.podSizeDrop}
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
              class={styles.podSizeMenu}
              style={{
                display: podSizeDrop() === "open" ? "block" : "none",
              }}
            >
              <For each={podOptions}>
                {(option: PodSizes) => (
                  <div
                    class={styles.podSizeOption}
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
        </div>
        {/* Table Display */}
        <div
          class={styles.tableCNT}
          style={{ height: `${rightSeats().length * 3}rem` }}
        >
          <div class={styles.leftSeats}>
            <For each={leftSeats()}>
              {(seat) => (
                <Seat podId={podId} seatNumber={seat.seatNumber}></Seat>
              )}
            </For>
          </div>
          <div class={styles.tableVis}></div>
          <div class={styles.rightSeats}>
            <For each={rightSeats()}>
              {(seat) => (
                <Seat podId={podId} seatNumber={seat.seatNumber}></Seat>
              )}
            </For>
          </div>
        </div>
      </>
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
        <div class={styles.podTitle}>
          Pod: {thisPodState()?.podNumber} Id: {thisPodState()?.podId} Status:{" "}
          {thisPodState()?.podStatus} Rounds: {thisPodState()?.podRounds}{" "}
        </div>
        <button
          type="submit"
          style={{ color: "red" }}
          onClick={() => {
            updatePod(podId, { round: 1 });
            PairPlayers(eventState(), podId).map((match: MatchData) => {
              updatePod(podId, { newMatch: match });
            });
            eventState()
              .evtPlayerList.filter((player) => player.podId === podId)
              .map((filteredPlayer) => {
                updatePlayer(filteredPlayer.id, {
                  fullPodRecord: { podId: podId, w: 0, l: 0, d: 0 },
                });
              });
            updatePod(podId, { status: "pairing" });
          }}
        >
          Pair Round 1
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
        <div class={styles.podTitle}>
          Pod: {thisPodState()?.podNumber} Id: {thisPodState()?.podId} Status:{" "}
          {thisPodState()?.podStatus} Rounds: {thisPodState()?.podRounds}{" "}
        </div>
        <div>Pairing Round {thisPodState()?.currentRound}</div>
        <button
          type="submit"
          style={{ color: "red" }}
          onClick={() => {
            updatePod(podId, { status: "playing" });
          }}
        >
          Begin Round {thisPodState()?.currentRound}
        </button>

        {/* Match Cards */}
        <div class={styles.pairingTableCont}>
          <For
            each={thisPodState()?.podMatches.filter(
              (match) => match.matchRound === thisPodState()?.currentRound
            )}
          >
            {(match) => (
              <MatchCard
                podId={podId}
                matchInfo={match}
                matchCardState="pairing"
              ></MatchCard>
            )}
          </For>
        </div>
      </>
    );
  };

  //Progressing from this card updates round, creates new Matches, and records players performance.
  const PlayingPodCard = () => {
    return (
      <>
        <div class={styles.podTitle}>
          Pod: {thisPodState()?.podNumber} Id: {thisPodState()?.podId} Status:{" "}
          {thisPodState()?.podStatus} Rounds: {thisPodState()?.podRounds}{" "}
        </div>
        <div> Round {thisPodState()?.currentRound}</div>
        <div>timer</div>
        <button
          type="submit"
          style={{ color: "red" }}
          onClick={() => {
            const remainingMatches = thisPodState()?.podMatches.filter(
              (match) => !match.winner
            );
            if (remainingMatches?.length === 0) {
              let newRound = thisPodState()!.currentRound! + 1;
              if (newRound <= thisPodState()!.podRounds) {
                //Push records to player's data
                thisPodState()
                  ?.podMatches.filter(
                    (match) => match.matchRound === thisPodState()?.currentRound
                  )
                  .map((currentMatch) => {
                    if (currentMatch.winner === "draw") {
                      updatePlayer(currentMatch.p1Id, {
                        matchRecord: { podId: podId, result: { d: 1 } },
                      });
                      updatePlayer(currentMatch.p2Id, {
                        matchRecord: { podId: podId, result: { d: 1 } },
                      });
                    } else if (currentMatch.winner === "p1") {
                      updatePlayer(currentMatch.p1Id, {
                        matchRecord: { podId: podId, result: { w: 1 } },
                      });
                      updatePlayer(currentMatch.p2Id, {
                        matchRecord: { podId: podId, result: { l: 1 } },
                      });
                    } else if (currentMatch.winner === "p2") {
                      updatePlayer(currentMatch.p1Id, {
                        matchRecord: { podId: podId, result: { l: 1 } },
                      });
                      updatePlayer(currentMatch.p2Id, {
                        matchRecord: { podId: podId, result: { w: 1 } },
                      });
                    }
                  });
                // Update to new round
                updatePod(podId, { round: newRound });

                //Pair matches for next round
                PairPlayers(eventState(), podId).map((match: MatchData) => {
                  updatePod(podId, { newMatch: match });
                });

                //update pod status
                updatePod(podId, { status: "pairing" });
              } else {
                updatePod(podId, { status: "finished" });
              }
            } else {
              console.log("Ongoing Matches");
            }
          }}
        >
          Pair Round {thisPodState()!.currentRound! + 1}
        </button>
        {/* Table Display */}
        <div class={styles.pairingTableCont}>
          <For
            each={thisPodState()?.podMatches.filter(
              (match) => match.matchRound === thisPodState()?.currentRound
            )}
          >
            {(match) => (
              <MatchCard
                podId={podId}
                matchInfo={match}
                matchCardState="playing"
              ></MatchCard>
            )}
          </For>
        </div>
      </>
    );
  };

  const FinishedPodCard = () => {
    return (
      <>
        <div class={styles.standingsCNT}>
          <For each={CreateStandings(eventState(), podId)}>
            {(standing) => (
              <div class={styles.standing}>
                <div class={styles.standingEntry}>{standing.rank}</div>
                <div class={styles.standingEntry}>{standing.name}</div>
                <div class={styles.standingEntry}>{standing.points}</div>
                <div
                  class={styles.standingEntry}
                >{`${standing.record.w} - ${standing.record.d} - ${standing.record.l}`}</div>
                <div class={styles.standingEntry}>{standing.omw}%</div>
                <div class={styles.standingEntry}>{standing.gw}%</div>
                <div class={styles.standingEntry}>{standing.omw}%</div>
              </div>
            )}
          </For>
        </div>
      </>
    );
  };

  return (
    <DisplayFrame>
      <ErrorBoundary fallback={<>oops!</>}>
        <div
          // style={{
          //   "background-color": thisPodState()?.podHovered ? "red" : "green",
          // }}
          onMouseEnter={() => {
            updatePod(podId, { hovered: true });
          }}
          onMouseLeave={() => {
            updatePod(podId, { hovered: false });
          }}
        >
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
        </div>
      </ErrorBoundary>
    </DisplayFrame>
  );
}
