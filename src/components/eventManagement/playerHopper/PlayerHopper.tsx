import "./playerHopper.css";
import DisplayFrame from "../displayFrame";
import { useEventContext } from "~/context/EventContext";
import { For, createSignal, onMount } from "solid-js";
import { Player } from "~/context/EventContext";
import PlayerCard from "../playerCard";

export default function PlayerHopper() {
  //Context State
  const [eventState, { updateSeat }] = useEventContext();
  //Local State
  const [startingPlayerCards, setStartingPlayerCards] = createSignal<Player[]>(
    []
  );

  let podlessSeat!: HTMLDivElement;

  onMount(() => {
    updateSeat(0, 0, podlessSeat);
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
        <div class="podlessSeat" ref={podlessSeat}>
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
