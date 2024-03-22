import "./playerCard.css";
import { usePlayersContext } from "../../../context/PlayersContext";
import { createSignal, Switch, Match } from "solid-js";
interface PlayerCardInputs {
  name: string;
  id: number;
}

type CardMode = "display" | "edit";

export default function PlayerCard({ id }: PlayerCardInputs) {
  //Context State
  const [playersList, { editPlayerInList, addPlayerToList, makePlayersList }] =
    usePlayersContext();
  //State
  const [cardMode, setCardMode] = createSignal<CardMode>("display");
  const [playerName, setPlayerName] = createSignal<string>(
    playersList()[id - 1].name
  );

  const PlayerNameCard = () => {
    return (
      <div class="playerName">
        {playersList()[id - 1].name} {id}
      </div>
    );
  };

  return (
    <div
      class="playerCardContainer"
      onClick={() => {
        setCardMode("edit");
      }}
      onFocusIn={() => {
        setCardMode("edit");
      }}
      onFocusOut={() => {
        setCardMode("display");
      }}
    >
      <div class="playerIcon"></div>

      <Switch fallback={<PlayerNameCard />}>
        <Match when={cardMode() === "display"}>
          <PlayerNameCard />
        </Match>
        <Match when={cardMode() === "edit"}>
          <input
            class="editPlayerName"
            value={playerName()}
            onInput={(event) => {
              setPlayerName(event.target.value);
            }}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                editPlayerInList(id, playerName());
                setCardMode("display");
              }
            }}
          ></input>
          <button
            class="submitNewPlayerName"
            type="submit"
            onclick={() => {
              editPlayerInList(id, playerName());
              setCardMode("display");
            }}
          ></button>
        </Match>
      </Switch>
    </div>
  );
}
