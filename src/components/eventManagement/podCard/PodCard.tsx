import "./podCard.css";
import { createEffect, createSignal, For, onMount, Index } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import DisplayFrame from "../displayFrame";
import PlayerSeat from "../playerSeat";
import TestElement from "~/components/Test/TestElement";
import { PodSizes } from "~/context/EventContext";
import TestBox from "~/components/Test/TestBox";
interface PodCardInputs {
  podSize: PodSizes;
  podNumber: number;
  podId: number;
}

//MAIN FUNCTION
export default function PodCard({ podSize, podNumber, podId }: PodCardInputs) {
  //Context State
  const [eventState, { editPodSize, updatePodSize, removePod }] =
    useEventContext();
  //Local State
  const thisPodState = () => {
    return eventState().evtPods.filter((pod) => pod.podNumber === podNumber)[0];
  };
  const thisPodSeats = () => {
    return eventState().evtSeats.filter((seat) => seat.podNumber === podNumber);
  };

  const [podSizeBtn, setPodSizeBtn] = createSignal<PodSizes>(podSize);

  const podOptions: PodSizes[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const [podSizeDrop, setPodSizeDrop] = createSignal<"open" | "close">("close");

  // const firstHalfSeats = () => {
  //   const allEvtSeats = eventState().evtSeats.filter(
  //     (seat) => seat.podNumber === podNumber
  //   );

  //   return allEvtSeats.filter((seat, index) => index < allEvtSeats.length / 2);
  // };

  // const secondHalfSeats = () => {
  //   const allEvtSeats = eventState().evtSeats.filter(
  //     (seat) => seat.podNumber === podNumber
  //   );

  //   return allEvtSeats.filter((seat, index) => index >= allEvtSeats.length / 2);
  // };

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
              removePod(podNumber);
            }}
          >
            Remove Pod
          </button>
        </div>
        <div class="tableCont">
          <div class="podSeatsUp"></div>
          <div class="podTable"></div>
          <div class="podSeatsDown">
            {/* <For each={firstHalfSeats()}>
              {(seat) => (
                // <PlayerSeat
                //   key={`seat-${seat.seatNumber}`}
                //   seatNumber={seat.seatNumber}
                //   podNumber={podNumber}
                //   seatFacing="right"
                // ></PlayerSeat>
                <div>
                  <TestElement input={seat.seatNumber} />
                </div>
              )}
            </For> */}
            <Index each={eventState().evtPods[podId].podSeats}>
              {(pod) => (
                <TestBox
                  seatNumber={pod().seatNumber}
                  podNumber={pod().podNumber}
                ></TestBox>
              )}
            </Index>
          </div>
        </div>
      </div>
    </DisplayFrame>
  );
}
