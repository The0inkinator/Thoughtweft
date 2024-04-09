import { createEffect, createSignal, onMount } from "solid-js";
import "./TestElement.css";
import { useTestContext } from "~/context/TestContext";
import { useEventContext } from "~/context/EventContext";

type ElementStates = "inSlot" | "dragging";

interface TestIntf {
  input: number;
}

export default function TestElement({ input }: TestIntf) {
  const [testState, setTestState] = createSignal<ElementStates>("dragging");
  const [eventState] = useEventContext();
  const signalInput = () => {
    return input;
  };

  return (
    <div
      class="testElement"
      style={{ color: testState() === "dragging" ? "blue" : "red" }}
      onClick={() => {
        setTestState("inSlot");
      }}
    >
      {signalInput()}
    </div>
  );
}
