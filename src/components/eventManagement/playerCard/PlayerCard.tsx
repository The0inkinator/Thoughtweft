import "./playerCard.css";
import { useEventContext } from "~/context/EventContext";
import { createSignal, Switch, Match } from "solid-js";
interface PlayerCardInputs {
  name: string;
  id: number;
}

type CardMode = "display" | "edit";

export default function PlayerCard({ id, name }: PlayerCardInputs) {
  //Context State
  const [eventState] = useEventContext();
  //State
  const [cardMode, setCardMode] = createSignal<CardMode>("display");
  const [playerName, setPlayerName] = createSignal<string>(
    eventState().playerList[id].name
  );

  const PlayerNameCard = () => {
    return <div class="playerName">{eventState().playerList[id].name}</div>;
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
                //edit player in list
                setCardMode("display");
              }
            }}
          ></input>
          <button
            class="submitNewPlayerName"
            type="submit"
            onclick={() => {
              // edit player in list
              setCardMode("display");
            }}
          ></button>
        </Match>
      </Switch>
    </div>
  );
}
