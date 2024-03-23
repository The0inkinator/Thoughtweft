import "./podCard.css";
import { createSignal, For } from "solid-js";

//MAIN FUNCTION
export default function PodCard() {
  //Context State

  return (
    <div class="podCardContainer">
      <div class="podNumber">Pod #</div>
      {/* replace empty array below */}
      <For each={[]}>{(playerObj) => <>{/* playerCard */}</>}</For>
    </div>
  );
}
