import "./podCard.css";
import {
  createEffect,
  createSignal,
  For,
  onMount,
  Index,
  createMemo,
  ErrorBoundary,
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
  const [eventState, { updatePodSize, removePod }] = useEventContext();
  //Local State
  const [localPodNumber, setLocalPodNumber] = createSignal(podNumber);

  const thisPodState = () => {
    return eventState().evtPods.find((pod) => pod.podId === podId);
  };

  const thisPodSeats = () => {
    return eventState().evtSeats.filter((seat) => seat.podId === podId);
  };

  const [podSizeBtn, setPodSizeBtn] = createSignal<PodSizes>(podSize);

  const podOptions: PodSizes[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const [podSizeDrop, setPodSizeDrop] = createSignal<"open" | "close">("close");

  onMount(() => {
    updatePodSize(podId, thisPodState()!.podSize);
  });

  return (
    <DisplayFrame>
      <ErrorBoundary fallback={<>oops!</>}>
        <div class="podCardCont">
          <div class="podTitle">
            Pod {thisPodState()?.podNumber}
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
                        updatePodSize(podId, option);
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
                  <PlayerSeat
                    seatNumber={seat.seatNumber}
                    podId={podId}
                  ></PlayerSeat>
                  // <TestBox seatNumber={seat.seatNumber} podId={podId}></TestBox>
                )}
              </For>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DisplayFrame>
  );
}
