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
import { createPlayerFromData } from "~/components/eventManagement/eventController/EventController";

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

  const thisPodState = () =>
    eventState().evtPods.find((pod) => pod.podId === podId);

  const createNewPlayer = (name: string, seatAddress?: SeatAddress) => {
    addPlayer(name, seatAddress);
    const newPlayer = eventState().evtPlayerList.findLast((player) => true);
    if (newPlayer) {
      createPlayerFromData(newPlayer);
    } else {
      console.log("New Player Not Found");
    }
  };

  const createPlayerFromSubmit = () => {
    if (thisPodState()?.podOwner) {
      runWithOwner(thisPodState()?.podOwner, () => {
        if (playerNameValue() && firstPodSeat(eventState(), podId)) {
          createNewPlayer(playerNameValue(), firstPodSeat(eventState(), podId));
          setPlayerNameValue("");
          console.log(eventState().evtPlayerList);
        } else {
          console.log("pod full");
        }
      });
    } else {
      runWithOwner(inputOwner, () => {
        if (playerNameValue() && firstPodSeat(eventState(), podId)) {
          createNewPlayer(playerNameValue(), firstPodSeat(eventState(), podId));
          setPlayerNameValue("");
          console.log(eventState().evtPlayerList);
        } else {
          console.log("pod full");
        }
      });
    }
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
