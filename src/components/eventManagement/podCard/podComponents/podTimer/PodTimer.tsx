import { createEffect, createSignal } from "solid-js";
import styles from "./podTimer.module.css";
import { Event } from "~/typing/eventTypes";

interface PodTimerInputs {
  eventData: Event;
  podId: number;
}

export default function PodTimer({ eventData, podId }: PodTimerInputs) {
  //Local State
  const [draftTimerHou, setDraftTimerHou] = createSignal<number>(0);
  const [draftTimerMin, setDraftTimerMin] = createSignal<number>(0);
  const [draftTimerSec, setDraftTimerSec] = createSignal<number>(0);
  //Values
  const thisPodState = eventData.evtPods.find((pod) => pod.podId === podId);
  let draftTimerStarted = false;

  createEffect(() => {
    if (draftTimerStarted === false && thisPodState?.podStatus === "drafting") {
      draftTimerStarted = true;
      const totalTime = thisPodState!.podDraftTime;
      const totalHours = Math.floor(totalTime / 60);
      const totalMins = totalTime - totalHours * 60;
      const totalSecs = 0;
      let tempSec;
      let tempMin;
      let tempHour;
      setDraftTimerHou(totalHours);
      setDraftTimerMin(totalMins);
      setDraftTimerSec(totalSecs);

      const loop = () => {
        if (draftTimerSec() > 0) {
          tempSec = draftTimerSec() - 1;
          setDraftTimerSec(tempSec);
          setTimeout(loop, 1000);
        } else if (draftTimerMin() > 0) {
          tempMin = draftTimerMin() - 1;
          tempSec = 59;
          setDraftTimerMin(tempMin);
          setDraftTimerSec(tempSec);
          setTimeout(loop, 1000);
        } else if (draftTimerHou() > 0) {
          tempHour = draftTimerHou() - 1;
          tempMin = 59;
          tempSec = 59;
          setDraftTimerHou(tempHour);
          setDraftTimerMin(tempMin);
          setDraftTimerSec(tempSec);
          setTimeout(loop, 1000);
        }
      };

      setTimeout(loop, 1000);
    }
  });
  return (
    <div>
      {draftTimerHou()} {draftTimerMin()} {draftTimerSec()}
    </div>
  );
}
