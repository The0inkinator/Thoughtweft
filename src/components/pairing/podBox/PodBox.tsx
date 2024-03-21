import "./podBox.css";
import PlayerCard from "../playerCard";
import { createSignal, For } from "solid-js";

export default function PodBox() {
  const [playersInPod, setPlayersInPod] = createSignal<string[]>([
    "Keldan",
    "Aiden",
  ]);

  return (
    <div class="podBoxContainer">
      <For each={playersInPod()}>
        {(playerName) => (
          <>
            <PlayerCard name={playerName} />
          </>
        )}
      </For>
      <div id="playerNameInputContainer">
        <input
          id="playerNameInput"
          type="text"
          placeholder="Player's Name"
        ></input>
        <button
          id="playerNameSubmit"
          type="submit"
          onClick={() => {
            console.log("Hello");
          }}
        ></button>
      </div>
    </div>
  );
}
