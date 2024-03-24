import { createEffect, createSignal, onMount } from "solid-js";
import "./TestElement.css";
import { useTestContext } from "~/context/TestContext";

type ElementStates = "inSlot" | "dragging";

export default function TestElement() {
  let ball!: HTMLDivElement;

  const [testState, { updateTestStateData, secondFunction }] = useTestContext();
  const [ballState, setBallState] = createSignal<ElementStates>("inSlot");

  let offsetX: number;
  let offsetY: number;

  onMount(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
  });

  const handleMouseMove = (event: MouseEvent) => {
    if (ballState() === "dragging") {
      const parent = ball.parentNode as HTMLDivElement;
      const parentX = parent.getBoundingClientRect().left;
      const parentY = parent.getBoundingClientRect().top;
      const newX = event.clientX - offsetX - parentX;
      const newY = event.clientY - offsetY - parentY;
      ball.style.left = `${newX}px`;
      ball.style.top = `${newY}px`;
    }
  };

  const handleMouseUp = () => {
    setBallState("inSlot");
  };

  return (
    <div class="testElement">
      <div class="bucket">
        <div
          id="ball"
          ref={ball}
          onMouseDown={(event) => {
            event.preventDefault();
            ball.style.position = "absolute";
            offsetX = event.clientX - ball.getBoundingClientRect().left;
            offsetY = event.clientY - ball.getBoundingClientRect().top;
            setBallState("dragging");
          }}
        ></div>
      </div>
      <div class="bucket"></div>
    </div>
  );
}
