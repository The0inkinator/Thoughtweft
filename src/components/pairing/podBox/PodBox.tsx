import "./podBox.css";
import PlayerCard from "../playerCard";
import { createSignal, For } from "solid-js";
import { usePlayersContext } from "../../../context/PlayersContext";

//TYPING

//MAIN FUNCTION
export default function PodBox() {
  //Context State
  const [
    playersList,
    { editPlayerInList, addPlayerToList, makePlayersList },
  ]: any = usePlayersContext();
  //State
  const [inputValue, setInputValue] = createSignal<string>("");

  const addPlayer = () => {
    if (inputValue()) {
      const PlayerName: string = inputValue();
      const PlayerId: number = playersList().length + 1;
      const NewPlayer = { name: PlayerName, id: PlayerId };
      addPlayerToList(NewPlayer);
      setInputValue("");
    }
  };

  return (
    <div class="podBoxContainer">
      <For each={playersList()}>
        {(playerObj) => (
          <>
            <PlayerCard name={playerObj.name} />
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
