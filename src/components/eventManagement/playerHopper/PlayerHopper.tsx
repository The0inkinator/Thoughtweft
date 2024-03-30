import "./playerHopper.css";
import DisplayFrame from "../displayFrame";
import { useEventContext } from "~/context/EventContext";
import { For } from "solid-js";

export default function PlayerHopper() {
  const [eventState] = useEventContext();
  return (
    <DisplayFrame>
      <div class="playerHopperCont">
        <div class="addPlayerBar">
          <input class="addPlayerInput"></input>
          <button type="submit" class="addPlayerButton"></button>
          <p></p>
          <input type="checkbox" id="addToPod"></input>
          <label for="addToPod">Add to Pod?</label>
        </div>
        <div class="podlessPlayerCont">
          <For each={eventState().evtPlayerList}>
            {(player) => {
              if (player.pod === undefined || player.pod === 0) {
                return <div>{player.name}</div>;
              } else return <></>;
            }}
          </For>
        </div>
      </div>
    </DisplayFrame>
  );
}
