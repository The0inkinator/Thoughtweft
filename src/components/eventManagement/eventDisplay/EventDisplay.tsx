import "./eventDisplay.css";
import { For, createSignal } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import PodCard from "../podCard/PodCard";

const SampleEvent = {
  pods: [
    { podNumber: 1, podSize: 8, registeredPlayers: [] },
    { podNumber: 2, podSize: 4, registeredPlayers: [] },
  ],
  playerList: [],
};

export default function EventDisplay() {
  //Context State
  const [eventState, { addPlayer, makeEvent }] = useEventContext();
  //Local State
  const [inputValue, setInputValue] = createSignal<string>("");

  return (
    <div class="eventDisplayContainer">
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

            setInputValue("");
          }}
        ></button>
      </div>
      <For each={eventState().pods}>
        {(pod) => <PodCard id={pod.podNumber} />}
      </For>
    </div>
  );
}
