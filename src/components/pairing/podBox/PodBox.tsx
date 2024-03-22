import "./podBox.css";
import PlayerCard from "../playerCard";
import { createSignal, For } from "solid-js";
import { usePlayersContext } from "../../../context/PlayersContext";

//TYPING
interface PodInputs {
  id: number;
}

//MAIN FUNCTION
export default function PodBox({ id }: PodInputs) {
  //Context State
  const [playersList, { editPlayerInList, addPlayerToList, makePlayersList }] =
    usePlayersContext();
  //State
  const [inputValue, setInputValue] = createSignal<string>("");

  const playersInThisPod = () => {
    let playersArray = playersList().filter((player) => player.pod === 1);
    return playersArray;
  };

  return (
    <div class="podBoxContainer">
      <div class="podNumber">Pod # {id}</div>
      <For each={playersInThisPod()}>
        {(playerObj) => (
          <>
            <PlayerCard name={playerObj.name} id={playerObj.id} />
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
              addPlayerToList(inputValue(), playersList().length + 1);
              setInputValue("");
            }
          }}
        ></input>
        <button
          id="playerNameSubmit"
          type="submit"
          onClick={() => {
            addPlayerToList(inputValue(), playersList().length + 1);
            setInputValue("");
          }}
        ></button>
      </div>
    </div>
  );
}
