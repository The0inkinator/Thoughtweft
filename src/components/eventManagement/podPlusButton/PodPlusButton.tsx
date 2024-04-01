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
  >(2);
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
              <button
                class="confirmSettingsButton"
                type="submit"
                onclick={() => {
                  if (eventState().evtSettings.playerCap > 0) {
                    setButtonMode("podsFull");
                  } else {
                    addPod(podSizeValue());
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
