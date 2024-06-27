import styles from "./displayFrame.module.css";
import { For, createSignal, children, createEffect } from "solid-js";

//MAIN FUNCTION
export default function DisplayFrame(props: any) {
  //Local State
  const [bgVisible, setBgVisible] = createSignal<boolean>(true);
  let thisDisplayFrame!: HTMLDivElement;

  const setZInitial = () => {
    thisDisplayFrame.style.zIndex = "initial";
    document.removeEventListener("mouseup", setZInitial);
  };

  return (
    <div
      class={styles.evtDisplayFrame}
      ref={thisDisplayFrame}
      onMouseDown={() => {
        thisDisplayFrame.style.zIndex = "1";
        document.addEventListener("mouseup", setZInitial);
      }}
    >
      <div class={styles.evtDisplayFrameContent}>
        {props.children}
        <div
          class={styles.evtDisplayFrameBG}
          style={{ visibility: bgVisible() ? "visible" : "hidden" }}
        ></div>
      </div>
    </div>
  );
}
