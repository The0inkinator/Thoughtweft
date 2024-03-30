import "./displayFrame.css";
import { For, createSignal, children, createEffect } from "solid-js";

//MAIN FUNCTION
export default function DisplayFrame(props: any) {
  //Local State
  const [bgVisible, setBgVisible] = createSignal<boolean>(true);

  return (
    <div class="evtDisplayFrame">
      <div class="evtDisplayFrameContent">
        {props.children}
        <div
          class="evtDisplayFrameBG"
          style={{ visibility: bgVisible() ? "visible" : "hidden" }}
        ></div>
      </div>
    </div>
  );
}
