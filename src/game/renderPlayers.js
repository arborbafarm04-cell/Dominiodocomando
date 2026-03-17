import { listenPlayers } from "../multiplayer/playerListener";

export function renderPlayers(setPlayers) {
  listenPlayers((players) => {
    setPlayers(players);
  });
}
