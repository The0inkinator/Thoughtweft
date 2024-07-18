import {
  createEffect,
  createSignal,
  For,
  onMount,
  runWithOwner,
  Show,
  ErrorBoundary,
  Switch,
  Match,
  onCleanup,
  getOwner,
  Owner,
} from "solid-js";
import { useEventContext } from "~/context/EventContext";
import DisplayFrame from "../displayFrame";
import Seat from "../seat";
import { MatchData, PodSizes, PodStatusModes } from "~/typing/eventTypes";
import PairPlayers from "./playerMgmtFunc/pairPlayers";
import styles from "./podCard.module.css";
import MatchCard from "../matchCard";
import CreateStandings from "./playerMgmtFunc/createStandings";
import PodTimer from "./podComponents/podTimer/PodTimer";
import PlayerInput from "./podComponents/playerInput/PlayerInput";
import { Portal } from "solid-js/web";
import PlayerCard from "../playerCard/PlayerCard";
import PodOverlay from "./podComponents/podOverlay/podOverlay";
import shrinkPod from "./playerMgmtFunc/shrinkPod";
interface PodCardInputs {
  podSize: PodSizes;
  podNumber: number;
  podId: number;
}

//MAIN FUNCTION
export default function PodCard({ podSize, podNumber, podId }: PodCardInputs) {
  //Context State
  const [
    eventState,
    { updatePodSize, removePod, updatePlayer, updatePod, removePlayer },
  ] = useEventContext();
  //Local State
  const [standings, setStandings] = createSignal(
    CreateStandings(eventState(), podId)
  );
  //Refs
  let thisPod!: HTMLDivElement;
  let overlayMenu!: HTMLDivElement;
  const podOwner = getOwner();

  const thisPodState = () => {
    return eventState().evtPods.find((pod) => pod.podId === podId);
  };

  const thisPodSeats = () => {
    return eventState().evtSeats.filter((seat) => seat.podId === podId);
  };

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
    updatePod(podId, { podOwner: podOwner as Owner });
    if (!thisPodState()?.podSaves) {
      //Save Pod State
      updatePod(podId, { addPodSave: "add" });
    }
  });

  const SeatingPodCard = () => {
    return (
      <>
        <PlayerInput podId={podId} />
        <div class={styles.podTitle}>
          {/* ADVANCE TO DRAFTING */}
          <button
            type="submit"
            style={{ color: "red" }}
            onClick={() => {
              runWithOwner(thisPodState()!.podOwner!, () => {
                shrinkPod(podId);
              });
              updatePod(podId, { status: "drafting" });
              //Save Pod State
              updatePod(podId, { addPodSave: "add" });
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
            //Save Pod State
            updatePod(podId, { addPodSave: "add" });
          }}
        >
          Pair Round 1
        </button>
        <PodTimer eventData={eventState()} podId={podId}></PodTimer>
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

  const PairingPodCard = () => {
    return (
      <>
        <button
          type="submit"
          style={{ color: "red" }}
          onClick={() => {
            updatePod(podId, { status: "playing" });
            //Save Pod State
            updatePod(podId, { addPodSave: "add" });
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

                //Save Pod State
                updatePod(podId, { addPodSave: "add" });
              } else {
                CreateStandings(eventState(), podId);
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
        <button
          onclick={() => {
            updatePod(podId, { status: "playing" });
          }}
        >
          Back
        </button>
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
          <For each={standings()}>
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
                  input={`${standing.record.w} - ${standing.record.l} - ${standing.record.d}`}
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

  const draggedPlayer = () =>
    eventState().evtPlayerList.find(
      (player) => player.podId === podId && player.seat === 0
    );

  const MenuButton = () => {
    return (
      <>
        {thisPodState()?.currentSave}
        <button
          onClick={() => {
            updatePod(podId, { menuOpen: true });
            updatePod(podId, { overlayOpen: true });
          }}
          style={{ color: "black" }}
        >
          Menu
        </button>
      </>
    );
  };

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
          <div class={styles.podTitle}></div>
          <Switch fallback={<>oops!</>}>
            <Match when={thisPodState()?.podStatus === "seating"}>
              <MenuButton />
              <SeatingPodCard />
            </Match>
            <Match when={thisPodState()?.podStatus === "drafting"}>
              <MenuButton />
              <DraftingPodCard />
            </Match>
            <Match when={thisPodState()?.podStatus === "pairing"}>
              <MenuButton />
              <PairingPodCard />
            </Match>
            <Match when={thisPodState()?.podStatus === "playing"}>
              <MenuButton />
              <PlayingPodCard />
            </Match>
            <Match when={thisPodState()?.podStatus === "finished"}>
              <MenuButton />
              <FinishedPodCard />
            </Match>
          </Switch>
        </div>
        <PodOverlay podId={podId} />

        <Portal>
          <Show when={draggedPlayer()}>
            <PlayerCard
              playerID={draggedPlayer()!.id}
              staticPodId={podId}
              seatNumber={draggedPlayer()!.seat}
              playerName={draggedPlayer()!.name}
              draggingCard={true}
            ></PlayerCard>
          </Show>
        </Portal>
      </ErrorBoundary>
    </DisplayFrame>
  );
}
