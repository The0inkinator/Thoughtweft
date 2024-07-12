import { createEffect, onCleanup, onMount, Show } from "solid-js";
import styles from "./podMenu.module.css";
import { useEventContext } from "~/context/EventContext";
import {
  ChangePodSizeBtn,
  RemovePodBtn,
  ShrinkPodBtn,
  ShufflePlayersBtn,
} from "./podMenuButtons";

interface PodMenuInputs {
  podId: number;
}

export default function PodMenu({ podId }: PodMenuInputs) {
  //Context State
  const [eventState, { updatePlayer, updatePod }] = useEventContext();

  const thisPodState = () =>
    eventState().evtPlayerList.find((pod) => pod.podId === podId);

  return (
    <div>
      <RemovePodBtn podId={podId} />
      <ShrinkPodBtn podId={podId} />
      <ShufflePlayersBtn podId={podId} />
      <ChangePodSizeBtn podId={podId} />
    </div>
  );
}
