import { createEffect, onCleanup, onMount, Show } from "solid-js";
import styles from "./podMenu.module.css";
import { useEventContext } from "~/context/EventContext";

interface PodMenuInputs {
  podId: number;
}

export default function PlayerMenu({ podId }: PodMenuInputs) {
  //Context State
  const [eventState, { updatePlayer, updatePod }] = useEventContext();

  const thisPodState = () =>
    eventState().evtPlayerList.find((pod) => pod.podId === podId);

  return <div></div>;
}
