import "./podCard.css";
import { createEffect, createSignal, For, onMount } from "solid-js";
import { useEventContext } from "~/context/EventContext";
import DisplayFrame from "../displayFrame";
import PlayerSeat from "../playerSeat";

interface PodCardInputs {
  podSize: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  podNumber: number;
}

//MAIN FUNCTION
export default function PodCard({ podSize, podNumber }: PodCardInputs) {
  //Context State
  const [eventState, { editPodSize, updateSeatsInPod, removePod }] =
    useEventContext();
  const thisPodState = () => {
    return eventState().evtPods.filter((pod) => pod.podNumber === podNumber)[0];
  };
  const thisPodSeats = () => {
    return eventState().evtSeats.filter((seat) => seat.podNumber === podNumber);
  };

  const firstHalfSeats = () => {
    const allEvtSeats = eventState().evtSeats.filter(
      (seat) => seat.podNumber === podNumber
    );

    return allEvtSeats.filter((seat, index) => index < allEvtSeats.length / 2);
  };

  const secondHalfSeats = () => {
    const allEvtSeats = eventState().evtSeats.filter(
      (seat) => seat.podNumber === podNumber
    );

    return allEvtSeats.filter((seat, index) => index >= allEvtSeats.length / 2);
  };

  createEffect(() => {
    if (thisPodState().podSize !== thisPodSeats().length) {
      updateSeatsInPod(podNumber);
    }
  });

  return (
    <DisplayFrame>
      <div class="podCardCont">
        <div class="podTitle">
          Pod {podNumber}
          <button
            type="submit"
            style={{ color: "red" }}
            onClick={() => {
              editPodSize({ podNumber, podSize: 10 });
              updateSeatsInPod(podNumber);
            }}
          >
            Make pod 10
          </button>
          <button
            type="submit"
            style={{ color: "red" }}
            onClick={() => {
              editPodSize({ podNumber, podSize: 7 });
              updateSeatsInPod(podNumber);
            }}
          >
            Make pod 7
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
          <div class="podSeatsUp">
            <For each={secondHalfSeats()}>
              {(seat) => (
                <PlayerSeat
                  seatNumber={seat.seatNumber}
                  podNumber={podNumber}
                  seatFacing="left"
                ></PlayerSeat>
              )}
            </For>
          </div>
          <div class="podTable"></div>
          <div class="podSeatsDown">
            <For each={firstHalfSeats()}>
              {(seat) => (
                <PlayerSeat
                  seatNumber={seat.seatNumber}
                  podNumber={podNumber}
                  seatFacing="right"
                ></PlayerSeat>
              )}
            </For>
          </div>
        </div>
      </div>
    </DisplayFrame>
  );
}
