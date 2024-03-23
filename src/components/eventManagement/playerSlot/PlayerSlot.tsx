import "./playerSlot.css";

interface PlayerSlotInput {
  podNumber: number;
  slotNumber: number;
  filled: boolean;
}

export default function PlayerSlot({
  podNumber,
  slotNumber,
  filled,
}: PlayerSlotInput) {
  return <div class="playerSlotContainer">{slotNumber}</div>;
}
