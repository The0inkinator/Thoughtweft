import { createSignal, onMount, onCleanup } from "solid-js";
import { useEventContext } from "~/context/EventContext";

interface TestBoxInputs {
  seatNumber: number;
  podId: number;
}

export default function TestBox({ seatNumber, podId }: TestBoxInputs) {
  const [mode, setMode] = createSignal<boolean>(false);
  const [eventState, { updateSeat }] = useEventContext();
  const thisSeatState = () => {
    return eventState()
      .evtPods.find((pod) => (pod.podId = podId))!
      .podSeats.find((seat) => (seat.seatNumber = seatNumber))!;
  };

  onMount(() => {
    console.log(`seat ${seatNumber} added`);
  });

  onCleanup(() => {
    console.log(`seat ${seatNumber} cleaned up`);
  });

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
      {/* PdID: {thisSeatState().podId} St#: {thisSeatState().seatNumber} */}
    </div>
  );
}
