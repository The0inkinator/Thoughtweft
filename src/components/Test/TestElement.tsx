import { createSignal } from "solid-js";
import styles from "./TestElement.module.css";
import { useTestContext } from "~/context/TestContext";

type ElementStates = "inSlot" | "dragging";

export default function TestElement() {
  let ball!: HTMLDivElement;

  const [testState, { updateTestStateData, secondFunction }] = useTestContext();
  const [elementState, setElementState] = createSignal<ElementStates>("inSlot");

  return (
    <div class={styles.testElement}>
      <div
        id={styles.element}
        ref={ball}
        onClick={() => {
          console.log(ball.getBoundingClientRect());
        }}
      ></div>
      <div class={styles.bucketOne}></div>
      <div class={styles.bucketTwo}></div>
    </div>
  );
}
