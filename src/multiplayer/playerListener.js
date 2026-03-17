import { db } from "./firebaseClient";
import { ref, onValue } from "firebase/database";

export function listenPlayers(callback){
  const playersRef = ref(db, "players");
  onValue(playersRef, (snapshot)=>{
    const data = snapshot.val();
    callback(data);
  });
}
