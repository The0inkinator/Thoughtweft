import styles from "./playerMenu.module.css";

interface PlayerMenuInputs {
  ref: HTMLDivElement;
}

export default function PlayerMenu({ ref }: PlayerMenuInputs) {
  return <div ref={ref}>Menu</div>;
}
