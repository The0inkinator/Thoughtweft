import "./playerHopper.css";
import DisplayFrame from "../displayFrame";
import { useEventContext } from "~/context/EventContext";
import {
  For,
  Owner,
  createEffect,
  createSignal,
  getOwner,
  onMount,
  runWithOwner,
} from "solid-js";
import { Player, SeatAddress } from "~/typing/eventTypes";
import PlayerCard from "../playerCard";
import { useHovRefContext } from "~/context/HovRefContext";
import { firstOpenSeatAddress } from "~/context/EventDataFunctions";

export default function PlayerHopper() {
  //Context State
  const [eventState, { updateSeat, setPlayerHopperEl, addPlayer }] =
    useEventContext();
  //Local State
  const [playerNameValue, setPlayerNameValue] = createSignal<string>("");
  const [addToPod, setAddToPod] = createSignal<boolean>(true);
  //Refs
  let playerHopper!: HTMLDivElement;
  //owner
  const hopperOwner = getOwner();

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
          podId={playerInfo.podId}
          seatNumber={playerInfo.seat}
        />
      </div>
    );
  };

  const createNewPlayer = (name: string, seatAddress?: SeatAddress) => {
    addPlayer(name, seatAddress);
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
  });

  const createPlayerFromSubmit = () => {
    runWithOwner(hopperOwner, () => {
      if (playerNameValue()) {
        if (addToPod()) {
          createNewPlayer(
            playerNameValue(),
            firstOpenSeatAddress(eventState())
          );
          setPlayerNameValue("");
        } else {
          createNewPlayer(playerNameValue());
          setPlayerNameValue("");
        }
      }
    });
  };

  return (
    <DisplayFrame>
      <div class="playerHopperCont" onClick={() => {}}>
        <div class="addPlayerBar">
          <input
            class="addPlayerName"
            value={playerNameValue()}
            placeholder="Player's name..."
            onInput={(event) => {
              setPlayerNameValue(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                createPlayerFromSubmit();
              }
            }}
          ></input>
          <button
            type="submit"
            style={{ width: "1rem", height: "1rem" }}
            class="addPlayerButton"
            onClick={() => {
              createPlayerFromSubmit();
            }}
          ></button>
          <p></p>
          <input
            type="checkbox"
            id="addToPod"
            checked={addToPod()}
            onClick={() => {
              if (addToPod()) {
                setAddToPod(false);
              } else if (!addToPod()) {
                setAddToPod(true);
              }
            }}
          ></input>
          <label for="addToPod">Add to Pod?</label>
        </div>
        <div class="podlessSeat" ref={playerHopper}>
          {/*Player cards are appended here*/}
        </div>
      </div>
    </DisplayFrame>
  );
}
