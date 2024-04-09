import "./podCard.css";
import {
  createEffect,
  createSignal,
  For,
  onMount,
  Index,
  createMemo,
} from "solid-js";
import { useEventContext } from "~/context/EventContext";
import DisplayFrame from "../displayFrame";
import PlayerSeat from "../playerSeat";
import TestElement from "~/components/Test/TestElement";
import { PodSizes } from "~/typing/eventTypes";
import TestBox from "~/components/Test/TestBox";
interface PodCardInputs {
  podSize: PodSizes;
  podNumber: number;
  podId: number;
}

//MAIN FUNCTION
export default function PodCard({ podSize, podNumber, podId }: PodCardInputs) {
  //Context State
  const [eventState, { updatePodSize, removePod, changePodNumber }] =
    useEventContext();
  //Local State

  const thisPodSeats = createMemo(() =>
    eventState().evtSeats.filter((seat) => seat.podId === podId)
  );

  const [podSizeBtn, setPodSizeBtn] = createSignal<PodSizes>(podSize);

  const podOptions: PodSizes[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const [podSizeDrop, setPodSizeDrop] = createSignal<"open" | "close">("close");

  return (
    <DisplayFrame>
      <div class="podCardCont">
        <div class="podTitle">
          Pod {podNumber}
          <p></p>
          <button
            class="podSizeDrop"
            type="button"
            onMouseUp={() => {
              if (podSizeDrop() === "close") {
                setPodSizeDrop("open");
              }
            }}
          >
            {podSizeBtn()}
            <div
              class="podSizeMenu"
              style={{
                display: podSizeDrop() === "open" ? "block" : "none",
              }}
            >
              <For each={podOptions}>
                {(option: PodSizes) => (
                  <div
                    class="podSizeOption"
                    style={{
                      display: podSizeDrop() === "open" ? "block" : "none",
                    }}
                    onClick={() => {
                      setPodSizeBtn(option);
                      setPodSizeDrop("close");
                      updatePodSize(podNumber, option);
                    }}
                  >
                    {option}
                  </div>
                )}
              </For>
            </div>
          </button>
          <button
            type="submit"
            style={{ color: "red" }}
            onClick={() => {
              removePod(podId);
            }}
          >
            Remove Pod
          </button>
        </div>
        <div class="tableCont">
          <div class="podSeatsUp"></div>
          <div class="podTable"></div>
          <div class="podSeatsDown">
            <For each={thisPodSeats()}>
              {(seat) => (
                <TestBox seatNumber={seat.seatNumber} podId={podId}></TestBox>
              )}
            </For>
          </div>
        </div>
      </div>
    </DisplayFrame>
  );
}
