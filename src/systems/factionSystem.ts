export interface Faction {
  id: string;
  name: string;
  leaderId: string;
  members: string[];
}

export function createFaction(name: string, leaderId: string): Faction {
  return {
    id: crypto.randomUUID(),
    name,
    leaderId,
    members: [leaderId],
  };
}

export function addMember(faction: Faction, playerId: string): Faction {
  faction.members.push(playerId);
  return faction;
}
