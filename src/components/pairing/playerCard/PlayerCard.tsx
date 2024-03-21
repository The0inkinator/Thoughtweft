import "./playerCard.css";
import { usePlayersContext } from "../../../context/PlayersContext";
import { createSignal, Switch, Match } from "solid-js";
interface PlayerCardInputs {
  name: string;
}

type CardMode = "display" | "edit";

export default function PlayerCard({ name }: PlayerCardInputs) {
  //Context State
  const [
    playersList,
    { editPlayerInList, addPlayerToList, makePlayersList },
  ]: any = usePlayersContext();
  const [cardMode, setCardMode] = createSignal<CardMode>("display");

  return (
    <div class="playerCardContainer">
      <div class="playerIcon"></div>

      <Switch fallback={<div class="playerName">{name}</div>}>
        <Match when={cardMode() === "display"}>
          <div class="playerName">{name}</div>
        </Match>
        <Match when={cardMode() === "edit"}>
          <input class="editPlayerName"></input>
        </Match>
      </Switch>
    </div>
  );
}
