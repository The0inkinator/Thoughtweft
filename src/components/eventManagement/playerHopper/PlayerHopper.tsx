import "./playerHopper.css";
import DisplayFrame from "../displayFrame";
import { useEventContext } from "~/context/EventContext";
import { For, onMount } from "solid-js";

export default function PlayerHopper() {
  const [eventState, { updateSeat }] = useEventContext();

  let podlessSeat!: HTMLDivElement;

  onMount(() => {
    updateSeat(0, 0, podlessSeat);
  });

  return (
    <DisplayFrame>
      <div
        class="playerHopperCont"
        onClick={() => {
          console.log(eventState());
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
