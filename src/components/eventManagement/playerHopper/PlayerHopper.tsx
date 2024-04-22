import "./playerHopper.css";
import DisplayFrame from "../displayFrame";
import { useEventContext } from "~/context/EventContext";
import { For, createEffect, createSignal, onMount } from "solid-js";
import { Player } from "~/typing/eventTypes";
import PlayerCard from "../playerCard";
import { useHovRefContext } from "~/context/HovRefContext";

export default function PlayerHopper() {
  //Context State
  const [eventState, { updateSeat, setPlayerHopperEl }] = useEventContext();
  const [hovRefState, { updateHovRef }] = useHovRefContext();
  //Local State
  const [startingPlayerCards, setStartingPlayerCards] = createSignal<Player[]>(
    []
  );

  let playerHopper!: HTMLDivElement;

  const draggedPlayer = () => {
    return eventState().evtPlayerList.find(
      (player) => player.dragging === true
    );
  };

  onMount(() => {
    setPlayerHopperEl(playerHopper);
    setStartingPlayerCards(eventState().evtPlayerList);
  });

  // createEffect(() => {
  //   if (!draggedPlayer() && hovRefState() !== playerHopper) {
  //     updateHovRef(playerHopper);
  //   }
  // });

  return (
    <DisplayFrame>
      <div
        class="playerHopperCont"
        onClick={() => {
          // console.log(eventState());
        }}
      >
        <div class="addPlayerBar">
          <input class="addPlayerInput"></input>
          <button type="submit" class="addPlayerButton"></button>
          <p></p>
          <input type="checkbox" id="addToPod"></input>
          <label for="addToPod">Add to Pod?</label>
        </div>
        <div
          class="podlessSeat"
          ref={playerHopper}
          onMouseEnter={() => {
            updateHovRef(playerHopper);
          }}
        >
          <For each={startingPlayerCards()}>
            {(player) => (
              <PlayerCard
                playerID={player.id}
                playerName={player.name}
                podNumber={player.pod}
                seatNumber={player.seat}
              />
            )}
          </For>
        </div>
      </div>
    </DisplayFrame>
  );
}
