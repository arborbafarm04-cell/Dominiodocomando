import React, { useState } from 'react';
import { useFactionStore } from '@/store/factionStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, X } from 'lucide-react';

interface FactionManagerProps {
  playerId: string;
  playerName: string;
}

export default function FactionManager({ playerId, playerName }: FactionManagerProps) {
  const { factions, playerFactionId, createFaction, deleteFaction, addMember, removeMember, setPlayerFaction } = useFactionStore();
  const [newFactionName, setNewFactionName] = useState('');
  const [newFactionDescription, setNewFactionDescription] = useState('');
  const [selectedMemberToRemove, setSelectedMemberToRemove] = useState<string | null>(null);
  const [isCreatingFaction, setIsCreatingFaction] = useState(false);

  const playerFaction = playerFactionId ? factions[playerFactionId] : null;
  const isLeader = playerFaction?.leaderId === playerId;

  const handleCreateFaction = () => {
    if (!newFactionName.trim()) return;

    const colors = [0xff4500, 0x00eaff, 0x00ff00, 0xff00ff, 0xffff00, 0xff8800];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    createFaction(newFactionName, playerId, playerName, randomColor, newFactionDescription);
    setNewFactionName('');
    setNewFactionDescription('');
    setIsCreatingFaction(false);
  };

  const handleRemoveMember = (memberId: string) => {
    if (playerFaction && isLeader) {
      removeMember(playerFaction.id, memberId);
      setSelectedMemberToRemove(null);
    }
  };

  const handleLeaveFaction = () => {
    if (playerFaction) {
      if (isLeader && playerFaction.members.length > 1) {
        alert('Como líder, você não pode sair da facção enquanto houver membros. Remova todos os membros primeiro.');
        return;
      }
      removeMember(playerFaction.id, playerId);
      setPlayerFaction(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-6 h-6 text-secondary" />
        <h2 className="text-2xl font-bold text-white">Facções</h2>
      </div>

      {playerFaction ? (
        <Card className="bg-gray-900 border-secondary p-4 mb-4">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-secondary mb-2">{playerFaction.name}</h3>
            {playerFaction.description && (
              <p className="text-gray-300 text-sm mb-2">{playerFaction.description}</p>
            )}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: `#${playerFaction.color.toString(16).padStart(6, '0')}` }}
              />
              <span className="text-gray-400 text-sm">
                Líder: {playerFaction.leaderName}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Membros: {playerFaction.members.length}
            </p>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-semibold text-white mb-2">Membros:</h4>
            <div className="space-y-2">
              {playerFaction.memberNames.map((name, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                  <span className="text-gray-300">{name}</span>
                  {isLeader && playerFaction.members[index] !== playerId && (
                    <button
                      onClick={() => handleRemoveMember(playerFaction.members[index])}
                      className="text-red-500 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {isLeader && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Convidar Membro
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-secondary">
                  <DialogHeader>
                    <DialogTitle className="text-white">Convidar Membro</DialogTitle>
                  </DialogHeader>
                  <p className="text-gray-400 text-sm">
                    Funcionalidade de convite será implementada com integração de jogadores online.
                  </p>
                </DialogContent>
              </Dialog>
            )}
            <Button
              variant="destructive"
              onClick={handleLeaveFaction}
              className="flex-1"
            >
              Sair da Facção
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="bg-gray-900 border-secondary p-4 mb-4">
          <p className="text-gray-400 mb-4">Você não está em nenhuma facção.</p>
          <Dialog open={isCreatingFaction} onOpenChange={setIsCreatingFaction}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Criar Facção
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-secondary">
              <DialogHeader>
                <DialogTitle className="text-white">Criar Nova Facção</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Nome da Facção</label>
                  <Input
                    value={newFactionName}
                    onChange={(e) => setNewFactionName(e.target.value)}
                    placeholder="Digite o nome da facção"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Descrição (opcional)</label>
                  <Input
                    value={newFactionDescription}
                    onChange={(e) => setNewFactionDescription(e.target.value)}
                    placeholder="Digite uma descrição"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingFaction(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateFaction}
                    disabled={!newFactionName.trim()}
                    className="flex-1"
                  >
                    Criar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      )}

      {/* List all factions */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Todas as Facções</h3>
        <div className="space-y-2">
          {Object.values(factions).map((faction) => (
            <Card
              key={faction.id}
              className="bg-gray-800 border-gray-700 p-3 hover:border-secondary transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: `#${faction.color.toString(16).padStart(6, '0')}` }}
                    />
                    <h4 className="font-semibold text-white">{faction.name}</h4>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Líder: {faction.leaderName} • {faction.members.length} membros
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
