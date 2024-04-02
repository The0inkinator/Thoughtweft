import { createEffect, createSignal, onMount } from "solid-js";
import "./TestElement.css";
import { useTestContext } from "~/context/TestContext";

type ElementStates = "inSlot" | "dragging";

interface TestIntf {
  input: number;
}

export default function TestElement({ input }: TestIntf) {
  const [testState, setTestState] = createSignal<ElementStates>("dragging");

  return (
    <div
      class="testElement"
      style={{ color: testState() === "dragging" ? "blue" : "red" }}
      onClick={() => {
        setTestState("inSlot");
      }}
    >
      {input}
    </div>
  );
}
