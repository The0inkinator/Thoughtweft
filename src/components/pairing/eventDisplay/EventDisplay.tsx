import PodBox from "../podBox/PodBox";
import { usePodContext } from "../../../context/PodContext";
import { For } from "solid-js";

export default function EventDisplay() {
  const [podList] = usePodContext();
  return (
    <div class="eventDisplayContainer">
      <For each={podList()}>{(pod) => <PodBox id={pod.podNumber} />}</For>
    </div>
  );
}
