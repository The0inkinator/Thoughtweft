import "./eventDisplay.css";
import { For, createEffect, createSignal } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import PodCard from "../podCard/PodCard";
import PlayerCard from "../playerCard/PlayerCard";

const SampleEvent2 = {
  pods: [
    {
      podNumber: 1,
      podSize: 6,
      registeredPlayers: [{ id: 0, name: "Keldan", pod: 1 }],
    },
    { podNumber: 2, podSize: 4, registeredPlayers: [] },
  ],
  playerList: [{ id: 0, name: "Keldan", pod: 1 }],
};

export default function EventDisplay() {
  //Context State
  const [eventState, { addPlayer, testSignal }] = useEventContext();
  //Local State
  const [inputValue, setInputValue] = createSignal<string>("");

  createEffect(() => {
    console.log(eventState());
  });

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
            testSignal();
            setInputValue("");
          }}
        ></button>
      </div>
      <For each={eventState().pods}>
        {(pod) => <PodCard id={pod.podNumber} />}
      </For>
      <For each={eventState().playerList}>
        {(player) => <PlayerCard id={player.id} name={player.name} />}
      </For>
    </div>
  );
}
