import "./eventDisplay.css";
import { For, createEffect, createSignal } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import PodCard from "../podCard/PodCard";
import PlayerCard from "../playerCard/PlayerCard";

export default function EventDisplay() {
  //Context State
  const [eventState, { addPlayer, testSignal }] = useEventContext();
  //Local State
  const [inputValue, setInputValue] = createSignal<string>("");

  createEffect(() => {
    console.log(eventState());
  });

  return (
    <>
      <div id="eventDisplayHeader">
        <div id="playerNameInputContainer">
          <input
            id="playerNameInput"
            type="text"
            placeholder="Player's Name"
            value={inputValue()}
            onInput={(event) => {
              setInputValue(event.target.value);
            }}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                addPlayer(inputValue());
                setInputValue("");
                // console.log(eventState());
              }
            }}
          ></input>
          <button
            id="playerNameSubmit"
            type="submit"
            onClick={() => {
              addPlayer(inputValue());
              testSignal();
              setInputValue("");
            }}
          ></button>
        </div>
      </div>
      <div class="eventDisplayContainer">
        <For each={eventState().pods}>
          {(pod) => <PodCard id={pod.podNumber} />}
        </For>
        <For each={eventState().playerList}>
          {(player) => <PlayerCard id={player.id} name={player.name} />}
        </For>
      </div>
    </>
  );
}
