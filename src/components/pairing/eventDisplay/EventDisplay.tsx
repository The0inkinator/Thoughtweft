import PodBox from "../podBox/PodBox";
import { usePodContext } from "../../../context/PodContext";

export default function EventDisplay() {
  const [podList] = usePodContext();
  return (
    <div class="eventDisplayContainer">
      <PodBox />
    </div>
  );
}
