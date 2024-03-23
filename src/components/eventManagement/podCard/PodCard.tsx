import "./podCard.css";
import { createSignal, For } from "solid-js";

//TYPING
interface PodInputs {
  id: number;
}

//MAIN FUNCTION
export default function PodBox({ id }: PodInputs) {
  //Context State

  //State
  const [inputValue, setInputValue] = createSignal<string>("");

  return (
    <div class="podBoxContainer">
      <div class="podNumber">Pod # {id}</div>
      {/* replace empty array below */}
      <For each={[]}>{(playerObj) => <>{/* playerCard */}</>}</For>
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
              // add player function
              setInputValue("");
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
    </div>
  );
}
