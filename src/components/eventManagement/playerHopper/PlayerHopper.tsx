import "./playerHopper.css";
import DisplayFrame from "../displayFrame";
import { useEventContext } from "~/context/EventContext";
import { For, createSignal, onMount } from "solid-js";
import { Player } from "~/typing/eventTypes";
import PlayerCard from "../playerCard";

export default function PlayerHopper() {
  //Context State
  const [eventState, { updateSeat, setPlayerHopperEl }] = useEventContext();
  //Local State
  const [startingPlayerCards, setStartingPlayerCards] = createSignal<Player[]>(
    []
  );

  let playerHopper!: HTMLDivElement;

  onMount(() => {
    setPlayerHopperEl(playerHopper);
    setStartingPlayerCards(eventState().evtPlayerList);
  });

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
        <div class="podlessSeat" ref={playerHopper}>
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
