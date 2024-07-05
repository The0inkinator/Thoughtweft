import {
  createEffect,
  createSignal,
  For,
  onMount,
  createMemo,
  Show,
  ErrorBoundary,
  Switch,
  Match,
  onCleanup,
} from "solid-js";
import { useEventContext } from "~/context/EventContext";
import DisplayFrame from "../displayFrame";
import Seat from "../seat";
import { MatchData, PodSizes, PodStatusModes } from "~/typing/eventTypes";
import PairPlayers from "./pairingFunctions/pairPlayers";
import styles from "./podCard.module.css";
import MatchCard from "../matchCard";
import CreateStandings from "./pairingFunctions/createStandings";
import PodTimer from "./podComponents/podTimer/PodTimer";
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
  //Refs
  let thisPod!: HTMLDivElement;
  let overlayMenu!: HTMLDivElement;

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

  createEffect(() => {
    if (thisPodState()?.popUpOn && thisPodState()?.popUpRef !== overlayMenu) {
      updatePod(podId, { popUpRef: overlayMenu });
    }
  });

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
        <PodTimer eventData={eventState()} podId={podId}></PodTimer>
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

  interface StandingsEntryInputs {
    inputWidth: string | number;
    input: string | number;
    name: boolean;
  }

  const StandingsEntry = ({
    inputWidth,
    input,
    name,
  }: StandingsEntryInputs) => {
    return (
      <div
        class={name ? styles.standingEntryName : styles.standingEntry}
        style={{
          width:
            typeof inputWidth === "number" ? `${inputWidth}rem` : inputWidth,
        }}
      >
        {input}
      </div>
    );
  };

  const FinishedPodCard = () => {
    return (
      <>
        <div class={styles.standingsCNT}>
          <div class={styles.standing}>
            <StandingsEntry name={false} inputWidth={3} input={"Rank"} />
            <StandingsEntry name={false} inputWidth={"40%"} input={"Player"} />
            <StandingsEntry name={false} inputWidth={4} input={"Points"} />
            <StandingsEntry name={false} inputWidth={8} input={"Record"} />
            <StandingsEntry name={false} inputWidth={4} input={"OMW"} />
            <StandingsEntry name={false} inputWidth={4} input={"GW"} />
            <StandingsEntry name={false} inputWidth={4} input={"OGW"} />
          </div>
          <For each={CreateStandings(eventState(), podId)}>
            {(standing) => (
              <div class={styles.standing}>
                <StandingsEntry
                  name={false}
                  inputWidth={3}
                  input={standing.rank}
                />
                <StandingsEntry
                  name={true}
                  inputWidth={"40%"}
                  input={standing.name}
                />
                <StandingsEntry
                  name={false}
                  inputWidth={4}
                  input={standing.points}
                />
                <StandingsEntry
                  name={false}
                  inputWidth={8}
                  input={`${standing.record.w} - ${standing.record.d} - ${standing.record.l}`}
                />
                <StandingsEntry
                  name={false}
                  inputWidth={4}
                  input={`${standing.omw}%`}
                />
                <StandingsEntry
                  name={false}
                  inputWidth={4}
                  input={`${standing.gw}%`}
                />
                <StandingsEntry
                  name={false}
                  inputWidth={4}
                  input={`${standing.ogw}%`}
                />
              </div>
            )}
          </For>
        </div>
      </>
    );
  };

  const handleMove = (event: TouchEvent | MouseEvent) => {
    const boundingBox = thisPod.getBoundingClientRect();
    if (event instanceof TouchEvent) {
      if (
        event.touches[0].clientX >= boundingBox.left &&
        event.touches[0].clientX <= boundingBox.right &&
        event.touches[0].clientY >= boundingBox.top &&
        event.touches[0].clientY <= boundingBox.bottom
      ) {
        updatePod(podId, { hovered: true });
      } else {
        updatePod(podId, { hovered: false });
      }
    } else if (event instanceof MouseEvent) {
      if (
        event.clientX >= boundingBox.left &&
        event.clientX <= boundingBox.right &&
        event.clientY >= boundingBox.top &&
        event.clientY <= boundingBox.bottom
      ) {
        updatePod(podId, { hovered: true });
      } else {
        updatePod(podId, { hovered: false });
      }
    }
  };

  onMount(() => {
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("mousemove", handleMove);
    updatePod(podId, { ref: thisPod });

    onCleanup(() => {
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("mousemove", handleMove);
    });
  });

  return (
    <DisplayFrame>
      <ErrorBoundary fallback={<>oops!</>}>
        <div
          ref={thisPod}
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
        <Show when={thisPodState()?.popUpOn}>
          <div class={styles.overlayMenu} ref={overlayMenu}></div>
        </Show>
      </ErrorBoundary>
    </DisplayFrame>
  );
}
