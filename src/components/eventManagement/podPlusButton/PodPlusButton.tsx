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

interface PodPlusButtonInputs {}

type ButtonMode = "add" | "settings" | "podsFull";

//MAIN FUNCTION
export default function PodPlusButton() {
  //Context State
  const [eventState] = useEventContext();
  //Local State
  const [buttonMode, setButtonMode] = createSignal<ButtonMode>("add");
  //refs
  let podPlusButtonBGRef!: HTMLDivElement;

  // createEffect(() => {
  //   if (buttonMode() !== "settings") {
  //     podPlusButtonBGRef.style.opacity = "0";
  //   } else {
  //     podPlusButtonBGRef.style.opacity = "1";
  //   }
  // });

  return (
    <div class="evtDisplayFrame">
      <div class="evtDisplayContent">
        <Switch>
          <Match when={buttonMode() === "add"}>
            <button
              class="addButton"
              type="submit"
              onclick={() => {
                setButtonMode("settings");
              }}
            ></button>
          </Match>
          <Match when={buttonMode() === "settings"}>
            <div class="settingsCont">
              <button
                class="confirmSettingsButton"
                type="submit"
                onclick={() => {
                  if (eventState().evtSettings.playerCap > 0) {
                    setButtonMode("podsFull");
                  } else {
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
        <div class="evtDisplayBG" ref={podPlusButtonBGRef}></div>
      </div>
    </div>
  );
}
