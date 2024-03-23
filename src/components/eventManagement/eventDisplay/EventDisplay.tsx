import "./eventDisplay.css";
import { For, createSignal } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import PodCard from "../podCard/PodCard";

export default function EventDisplay() {
  //Context State
  const [eventState, { addPlayer }] = useEventContext();
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
              console.log(eventState());
            }
          }}
        ></input>
        <button
          id="playerNameSubmit"
          type="submit"
          onClick={() => {
            // add player function
            setInputValue("");
          }}
        ></button>
      </div>
      <For each={eventState().pods}>{(pod) => <PodCard />}</For>
    </div>
  );
}
