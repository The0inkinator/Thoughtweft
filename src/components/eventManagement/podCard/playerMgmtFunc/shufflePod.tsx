import { useEventContext } from "~/context/EventContext";

export default function shufflePod(podId: number) {
  const [eventState, { updatePlayer }] = useEventContext();
  const shuffleArray = eventState().evtPlayerList.filter(
    (player) => player.podId === podId
  );
  for (let i = shuffleArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffleArray[i], shuffleArray[j]] = [shuffleArray[j], shuffleArray[i]];
  }

  shuffleArray.map((shuffledPlayer, index) => {
    const playerToEdit = eventState().evtPlayerList.find(
      (player) => shuffledPlayer.id === player.id
    );

    if (playerToEdit) {
      updatePlayer(playerToEdit.id, {
        address: { podId: 0, seat: 0 },
      });
    }
  });

  shuffleArray.map((shuffledPlayer, index) => {
    const playerToEdit = eventState().evtPlayerList.find(
      (player) => shuffledPlayer.id === player.id
    );

    if (playerToEdit) {
      updatePlayer(playerToEdit.id, {
        address: { podId: podId, seat: index + 1 },
      });
    }
  });
}
