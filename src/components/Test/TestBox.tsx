import { createSignal, onMount } from "solid-js";
import { useEventContext } from "~/context/EventContext";

interface TestBoxInputs {
  seatNumber: number;

  podNumber: number;
}

export default function TestBox({ seatNumber, podNumber }: TestBoxInputs) {
  const [mode, setMode] = createSignal<boolean>(false);
  const [eventState, { updateSeat }] = useEventContext();

  return (
    <div
      style={{
        width: "2rem",
        height: "2rem",
        "background-color": mode() === false ? "blue" : "red",
      }}
      onClick={() => {
        if (mode()) {
          setMode(false);
        } else {
          setMode(true);
        }
      }}
    >
      {podNumber}
    </div>
  );
}
