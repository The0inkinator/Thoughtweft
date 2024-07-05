import { Event } from "~/typing/eventTypes";
import styles from "./playerInput.module.css";
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
import PlayerCard from "~/components/eventManagement/playerCard";
import {
  firstOpenSeatAddress,
  firstPodSeat,
} from "~/context/EventDataFunctions";

interface PlayerInputInputs {
  podId: number;
}

export default function PlayerInput({ podId }: PlayerInputInputs) {
  //Context State
  const [eventState, { updateSeat, setPlayerHopperEl, addPlayer }] =
    useEventContext();
  //Local State
  const [playerNameValue, setPlayerNameValue] = createSignal<string>("");
  //Refs
  //Values
  const inputOwner = getOwner();

  const createPlayerFromData = (playerInfo: Player) => {
    return (
      <PlayerCard
        playerID={playerInfo.id}
        playerName={playerInfo.name}
        podId={playerInfo.podId}
        seatNumber={playerInfo.seat}
      />
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

  //Create player cards for players in the event
  onMount(() => {
    eventState().evtPlayerList.map((player) => {
      if (player.podId === podId) {
        createPlayerFromData(player);
      }
    });
  });

  const createPlayerFromSubmit = () => {
    runWithOwner(inputOwner, () => {
      if (playerNameValue() && firstPodSeat(eventState(), podId)) {
        createNewPlayer(playerNameValue(), firstPodSeat(eventState(), podId));
        setPlayerNameValue("");
      } else {
        console.log("pod full");
      }
    });
  };

  return (
    <div>
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
          style={{ width: "1.2rem", height: "1.2rem" }}
          class="addPlayerButton"
          onClick={() => {
            createPlayerFromSubmit();
          }}
        ></button>
      </div>
    </div>
  );
}
