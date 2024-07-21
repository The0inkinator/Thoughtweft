import { createEffect, createSignal, onMount } from "solid-js";
import styles from "./podTimer.module.css";
import { Event } from "~/typing/eventTypes";
import { useEventContext } from "~/context/EventContext";

interface PodTimerInputs {
  rawStartTime: Date;
  totalMin: number;
}

export default function PodTimer({ rawStartTime, totalMin }: PodTimerInputs) {
  //Context
  const [eventState, { updatePod }] = useEventContext();
  //Local State
  const [draftTimerHou, setDraftTimerHou] = createSignal<number>(0);
  const [draftTimerMin, setDraftTimerMin] = createSignal<number>(0);
  const [draftTimerSec, setDraftTimerSec] = createSignal<number>(0);
  //Values

  const timeTicker = () => {
    const startTime = new Date(rawStartTime);
    const currentTime = new Date();

    let monthsPast: number = 0;
    let daysPast: number = 0;
    monthsPast = currentTime.getMonth() - startTime.getMonth();
    daysPast = currentTime.getDate() - startTime.getDate();

    const adjustedSecs = currentTime.getSeconds() - startTime.getSeconds();
    const adjustedMins = currentTime.getMinutes() - startTime.getMinutes();
    const adjustedHours = currentTime.getHours() - startTime.getHours();
    const timerHours = Math.floor(totalMin / 60);
    const timerMins = Math.floor(totalMin - timerHours * 60);

    const elapsedSecs = adjustedSecs + adjustedMins * 60 + adjustedHours * 3600;
    const countedHours = Math.floor(elapsedSecs / 3600) + daysPast * 24;
    const countedMins = Math.floor((elapsedSecs - countedHours * 3600) / 60);
    const countedSecs = Math.floor(
      elapsedSecs - countedHours * 3600 - countedMins * 60
    );

    let hoursNegative: boolean = false;
    let minsNegative: boolean = false;
    let secsNegative: boolean = false;

    const displayHours = () => {
      const hoursLeft = timerHours - countedHours;

      if (monthsPast) {
        return 0;
      } else {
        if (hoursLeft >= 0) {
          return hoursLeft;
        } else {
          hoursNegative = true;
          return 0;
        }
      }
    };

    const displayMins = () => {
      const minsLeft = timerMins - countedMins;
      const secsInMinute = Math.abs(60 - countedSecs);

      if (minsLeft >= 0 && !hoursNegative) {
        if (secsInMinute === 60) {
          return minsLeft;
        } else {
          return minsLeft - 1;
        }
      } else {
        minsNegative = true;
        return 0;
      }
    };

    const displaySecs = () => {
      const secsInMinute = Math.abs(60 - countedSecs);

      if (!minsNegative) {
        if (secsInMinute === 60) {
          return 0;
        } else {
          return secsInMinute;
        }
      } else {
        return 0;
      }
    };

    setDraftTimerHou(displayHours());
    setDraftTimerMin(displayMins());
    setDraftTimerSec(displaySecs());

    setTimeout(timeTicker, 1000);
  };

  timeTicker();

  return (
    <div>
      {draftTimerHou()} {draftTimerMin()} {draftTimerSec()}
    </div>
  );
}
