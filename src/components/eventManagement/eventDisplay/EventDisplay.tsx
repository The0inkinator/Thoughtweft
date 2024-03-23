import { For } from "solid-js";
import { useEventContext } from "~/context/EventContext";

export default function EventDisplay() {
  const [eventState] = useEventContext();
  console.log(eventState());
  return <div class="eventDisplayContainer"></div>;
}
