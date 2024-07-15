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
import { openSeatFromPod } from "~/context/EventDataFunctions";

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

  const createPlayerFromSubmit = () => {
    runWithOwner(thisPodState()!.podOwner as Owner, () => {
      if (playerNameValue() && openSeatFromPod(eventState(), podId)) {
        addPlayer(playerNameValue(), {
          podId: openSeatFromPod(eventState(), podId)!.podId,
          seat: openSeatFromPod(eventState(), podId)!.seatNumber,
        });
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
