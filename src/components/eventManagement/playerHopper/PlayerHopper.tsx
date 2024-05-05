import "./playerHopper.css";
import DisplayFrame from "../displayFrame";
import { useEventContext } from "~/context/EventContext";
import { For, createEffect, createSignal, onMount } from "solid-js";
import { Player, PlayerAddress } from "~/typing/eventTypes";
import PlayerCard from "../playerCard";
import { useHovRefContext } from "~/context/HovRefContext";

export default function PlayerHopper() {
  //Context State
  const [eventState, { updateSeat, setPlayerHopperEl, addPlayer }] =
    useEventContext();
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

  const createPlayerFromData = (playerInfo: Player) => {
    return (
      <div>
        <PlayerCard
          playerID={playerInfo.id}
          playerName={playerInfo.name}
          podNumber={playerInfo.pod}
          seatNumber={playerInfo.seat}
        />
      </div>
    );
  };

  const createNewPlayer = (name: string, playerAddress?: PlayerAddress) => {
    addPlayer(name, playerAddress);
    const newPlayer = eventState().evtPlayerList.findLast((player) => true);
    if (newPlayer) {
      createPlayerFromData(newPlayer);
    } else {
      console.log("New Player Not Found");
    }
  };

  //Set hopper element and appends any players already in the event
  onMount(() => {
    setPlayerHopperEl(playerHopper);
    eventState().evtPlayerList.map((player) => {
      createPlayerFromData(player);
    });

    createNewPlayer("sup");
  });

  return (
    <DisplayFrame>
      <div class="playerHopperCont" onClick={() => {}}>
        <div class="addPlayerBar">
          <input class="addPlayerInput"></input>
          <button
            type="submit"
            style={{ width: "1rem", height: "1rem" }}
            class="addPlayerButton"
            onClick={() => {
              addPlayer("Da Boi");
            }}
          ></button>
          <p></p>
          <input type="checkbox" id="addToPod"></input>
          <label for="addToPod">Add to Pod?</label>
        </div>
        <div class="podlessSeat" ref={playerHopper}>
          {/*Player cards are appended here*/}
        </div>
      </div>
    </DisplayFrame>
  );
}
