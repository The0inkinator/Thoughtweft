import "./podBox.css";
import PlayerCard from "../playerCard";
import { createSignal, For } from "solid-js";
import { usePlayersContext } from "../../../context/PlayersContext";

//TYPING

//MAIN FUNCTION
export default function PodBox() {
  //Context State
  const [playersState]: any = usePlayersContext();
  //State
  const [playersInPod, setPlayersInPod] = createSignal<string[]>([
    "Keldan",
    "Aiden",
  ]);
  const [inputValue, setInputValue] = createSignal<string>("");

  const addPlayer = () => {
    if (inputValue()) {
      const newPlayerList: string[] = [...playersInPod(), inputValue()];
      setPlayersInPod(newPlayerList);
      console.log(playersInPod());
      setInputValue("");
    }
  };

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
          value={inputValue()}
          onInput={(event) => {
            setInputValue(event.target.value);
          }}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              addPlayer();
            }
          }}
        ></input>
        <button
          id="playerNameSubmit"
          type="submit"
          onClick={() => {
            addPlayer();
          }}
        ></button>
      </div>
    </div>
  );
}
