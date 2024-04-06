import { createSignal } from "solid-js";

export default function TestBox() {
  const [mode, setMode] = createSignal<boolean>(false);
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
    ></div>
  );
}
