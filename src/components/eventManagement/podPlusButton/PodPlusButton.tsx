import "./podPlusButton.css";
import {
  createEffect,
  createSignal,
  For,
  onMount,
  Switch,
  Match,
} from "solid-js";
import { useEventContext } from "~/context/EventContext";
import DisplayFrame from "../displayFrame";

interface PodPlusButtonInputs {}

type ButtonMode = "add" | "settings" | "podsFull";

//MAIN FUNCTION
export default function PodPlusButton() {
  //Context State
  const [eventState, { addPod }] = useEventContext();
  //Local State
  const [buttonMode, setButtonMode] = createSignal<ButtonMode>("add");
  const [podSizeValue, setPodSizeValue] = createSignal<
    2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  >(8);
  const [podRoundsValue, setPodRoundsValue] = createSignal<number>(3);
  const [draftTimeValue, setDraftTimeValue] = createSignal<number>(50);
  const [roundTimeValue, setRoundTimeValue] = createSignal<number>(50);
  //refs
  let podPlusButtonBGRef!: HTMLDivElement;

  return (
    <DisplayFrame>
      <div class="podPlusButtonCont">
        <Switch>
          <Match when={buttonMode() === "add"}>
            <button
              class="addButton"
              type="submit"
              onclick={() => {
                setButtonMode("settings");
              }}
            >
              New
            </button>
          </Match>
          <Match when={buttonMode() === "settings"}>
            <div class="settingsCont">
              Pod Size
              <input
                type="number"
                min={2}
                max={12}
                value={podSizeValue()}
                onInput={(event) => {
                  const inputValue = event.target.valueAsNumber;
                  if (inputValue >= 2 && inputValue <= 12) {
                    const newNumber = inputValue as
                      | 2
                      | 3
                      | 4
                      | 5
                      | 6
                      | 7
                      | 8
                      | 9
                      | 10
                      | 11
                      | 12;
                    setPodSizeValue(newNumber);
                  }
                }}
              ></input>
              Pod Rounds
              <input
                type="number"
                min={1}
                value={podRoundsValue()}
                onInput={(event) => {
                  const inputValue = event.target.valueAsNumber;

                  setPodRoundsValue(inputValue);
                }}
              ></input>
              Draft Time
              <input
                type="number"
                min={1}
                value={draftTimeValue()}
                onInput={(event) => {
                  const inputValue = event.target.valueAsNumber;

                  setDraftTimeValue(inputValue);
                }}
              ></input>
              Round Time
              <input
                type="number"
                min={1}
                value={roundTimeValue()}
                onInput={(event) => {
                  const inputValue = event.target.valueAsNumber;

                  setRoundTimeValue(inputValue);
                }}
              ></input>
              <button
                class="confirmSettingsButton"
                type="submit"
                onclick={() => {
                  if (eventState().evtSettings.playerCap > 0) {
                    setButtonMode("podsFull");
                  } else {
                    addPod(
                      podSizeValue(),
                      podRoundsValue(),
                      draftTimeValue(),
                      roundTimeValue()
                    );
                    setButtonMode("add");
                  }
                }}
              >
                Submit
              </button>
            </div>
          </Match>
          <Match when={buttonMode() === "podsFull"}>
            <></>
          </Match>
        </Switch>
      </div>
    </DisplayFrame>
  );
}
