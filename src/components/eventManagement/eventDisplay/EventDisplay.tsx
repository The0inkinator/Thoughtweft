import "./eventDisplay.css";
import { For, createEffect, createSignal, onMount } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import PodCard from "../podCard/PodCard";
import PlayerCard from "../playerCard/PlayerCard";
import BuildEvent from "../BuildEvent";
import { style } from "solid-js/web";

export default function EventDisplay() {
  //Context State
  const [eventState, { makeEvent }] = useEventContext();
  //Local State
  const [inputValue, setInputValue] = createSignal<string>("");

  onMount(() => {
    makeEvent(BuildEvent());
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
                // addPlayer(inputValue());
                setInputValue("");
                // console.log(eventState());
              }
            }}
          ></input>
          <button
            id="playerNameSubmit"
            type="submit"
            onClick={() => {
              // addPlayer(inputValue());
              setInputValue("");
            }}
          ></button>
          <button
            type="submit"
            onkeypress={(event) => {
              if (event.key === "Enter") {
                console.log(eventState());
              }
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
