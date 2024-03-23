import { createSignal } from "solid-js";
import "./TestElement.css";
import { useTestContext } from "~/context/TestContext";

type ElementStates = "inSlot" | "dragging";

export default function TestElement() {
  const [testState, { updateTestStateData, secondFunction }] = useTestContext();
  const [elementState, setElementState] = createSignal<ElementStates>("inSlot");

  return (
    <div class="TestElement">
      <div id="element"></div>
      <div class="bucketOne"></div>
      <div class="bucketTwo"></div>
    </div>
  );
}
