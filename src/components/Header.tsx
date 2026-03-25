import { useEffect, useState } from "react";
import { Image } from "@/components/ui/image";
import { useDirtyMoneyStore } from "@/store/dirtyMoneyStore";
import { useCleanMoneyStore } from "@/store/cleanMoneyStore";
import { usePlayerStore } from "@/store/playerStore";
import { useSpinVault } from "@/hooks/useSpinVault";
import { useNavigate } from "react-router-dom";
import { usePlayerInitialization } from "@/hooks/usePlayerInitialization";
import { useMember } from "@/integrations";
import {
  Droplet,
  Shield,
  Zap,
  Coins,
  Gem,
  Crown,
  Pencil,
} from "lucide-react";

const LOGO_SRC =
  "https://static.wixstatic.com/media/50f4bf_01590cb08b7048babbfed83e2830a27c~mv2.png";

export default function Header() {
  const { dirtyMoney } = useDirtyMoneyStore();
  const { cleanMoney } = useCleanMoneyStore();
  const { playerName, setPlayerName, level } = usePlayerStore();
  const { spins, timeUntilNextGain, formatTime } = useSpinVault();
  const navigate = useNavigate();
  const { member } = useMember();

  usePlayerInitialization();

  const [avatarUrl, setAvatarUrl] = useState(
    "https://static.wixstatic.com/media/50f4bf_a888df3d639f415b853110e459edba8c~mv2.png"
  );
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName || "COMANDANTE");

  useEffect(() => {
    const savedName = localStorage.getItem("playerName");
    const savedAvatar = localStorage.getItem("playerAvatar");

    if (savedName) setPlayerName(savedName);
    if (savedAvatar) setAvatarUrl(savedAvatar);
  }, [setPlayerName]);

  useEffect(() => {
    setTempName(playerName || "COMANDANTE");
  }, [playerName]);

  const savePlayerName = () => {
    const finalName = tempName.trim() || "COMANDANTE";
    setPlayerName(finalName);
    localStorage.setItem("playerName", finalName);
    setEditingName(false);
  };

  const girosPorMinuto = Math.max(1, level || 1);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-2 pt-1">
      <div
        className="mx-auto max-w-[1680px] overflow-hidden rounded-[18px] border shadow-[0_0_20px_rgba(0,0,0,0.38)]"
        style={{
          borderColor: "rgba(212,175,55,0.28)",
          background:
            "linear-gradient(90deg, rgba(8,5,5,0.97) 0%, rgba(24,10,10,0.97) 32%, rgba(14,8,8,0.97) 68%, rgba(8,5,5,0.97) 100%)",
        }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,180,0,0.05),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(255,0,0,0.04),transparent_24%)]" />

          <div className="relative px-2.5 md:px-3 py-1.5">
            <div className="flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-2">
              {/* LOGO REDUZIDO */}
              <div className="flex items-center justify-center 2xl:justify-start min-w-[90px]">
                <Image
                  src={LOGO_SRC}
                  alt="Logo"
                  width={90}
                  height={36}
                  className="object-contain drop-shadow-[0_0_10px_rgba(255,200,0,0.16)]"
                />
              </div>

              {/* BLOCO CENTRAL */}
              <div className="flex-1">
                <div className="rounded-[16px] border border-white/10 bg-white/[0.04] backdrop-blur-lg px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="flex flex-col xl:flex-row xl:items-center gap-2.5">
                    {/* IDENTIDADE */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 rounded-full blur-xl bg-yellow-400/20" />
                        <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden border-[2px] border-yellow-500 shadow-[0_0_14px_rgba(255,200,0,0.20)]">
                          <Image
                            src={avatarUrl}
                            className="w-full h-full object-cover"
                            alt="Avatar do jogador"
                          />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <Crown className="w-3.5 h-3.5 text-yellow-300 shrink-0" />

                          {editingName ? (
                            <input
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value.slice(0, 18))}
                              onBlur={savePlayerName}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") savePlayerName();
                                if (e.key === "Escape") {
                                  setTempName(playerName || "COMANDANTE");
                                  setEditingName(false);
                                }
                              }}
                              autoFocus
                              className="bg-black/70 border border-yellow-500/60 rounded-md px-2 py-1 text-yellow-300 font-black text-sm outline-none w-[150px] md:w-[190px]"
                            />
                          ) : (
                            <div
                              className="flex items-center gap-1.5 min-w-0 cursor-pointer group"
                              onClick={() => setEditingName(true)}
                              title="Clique para editar o nome"
                            >
                              <span className="text-yellow-300 font-black text-sm md:text-base truncate tracking-wide max-w-[150px] md:max-w-[210px]">
                                {playerName || "COMANDANTE"}
                              </span>
                              <Pencil className="w-3 h-3 text-yellow-300/70 group-hover:text-yellow-200 shrink-0" />
                            </div>
                          )}
                        </div>

                        <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white text-[9px] px-2 py-1 font-black uppercase tracking-[0.12em]">
                          <Shield className="w-3 h-3" />
                          COMANDANTE DE ELITE
                        </div>
                      </div>
                    </div>

                    {/* STATS */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
                      <StatCard
                        icon={<Zap className="w-3 h-3" />}
                        label="Nível"
                        value={String(level)}
                        tone="yellow"
                      />
                      <StatCard
                        icon={<Shield className="w-3 h-3" />}
                        label="Poder"
                        value="1.2M"
                        tone="red"
                      />
                      <StatCard
                        icon={<Coins className="w-3 h-3" />}
                        label="Sujo"
                        value={formatMoney(dirtyMoney)}
                        tone="green"
                      />
                      <StatCard
                        icon={<Coins className="w-3 h-3" />}
                        label="Limpo"
                        value={formatMoney(cleanMoney)}
                        tone="cyan"
                      />
                      <StatCard
                        icon={<Gem className="w-3 h-3" />}
                        label="Giros"
                        value={String(spins)}
                        tone="purple"
                      />
                    </div>

                    {/* BOTÃO */}
                    {member?._id && (
                      <div className="shrink-0">
                        <button
                          onClick={() => navigate("/money-laundering")}
                          className="w-full xl:w-auto flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-white font-black tracking-[0.05em] border border-cyan-300/20 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 hover:from-cyan-500 hover:via-sky-500 hover:to-blue-600 shadow-[0_0_14px_rgba(0,180,255,0.16)] transition-all text-xs"
                          title="Operações de Lavagem"
                        >
                          <Droplet className="w-3.5 h-3.5" />
                          LAVAGEM
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* TIMER / GIROS */}
              <div className="min-w-[170px]">
                <div className="rounded-[16px] border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-lg text-center">
                  <div className="text-[9px] uppercase tracking-[0.14em] text-slate-300">
                    Próximo ganho
                  </div>

                  <div className="flex gap-1.5 justify-center mt-2">
                    {formatTimer(formatTime(timeUntilNextGain)).map((t, i) => (
                      <div
                        key={i}
                        className="min-w-[38px] rounded-md px-2 py-1.5 text-sm font-black text-white border"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(5,5,5,0.95) 0%, rgba(20,20,20,0.95) 100%)",
                          borderColor: "rgba(255,255,255,0.08)",
                        }}
                      >
                        {t}
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] mt-1.5 text-cyan-300 font-bold">
                    +{girosPorMinuto} giros/min
                  </div>

                  <div className="text-[9px] mt-0.5 text-slate-400">
                    mesmo valor do nível
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-yellow-500/35 to-transparent" />
      </div>
    </header>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "yellow" | "red" | "green" | "cyan" | "purple";
}) {
  const toneClasses = {
    yellow: "text-yellow-300",
    red: "text-red-300",
    green: "text-green-300",
    cyan: "text-cyan-300",
    purple: "text-fuchsia-300",
  };

  return (
    <div className="rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div
        className={`flex items-center justify-center gap-1 text-[9px] uppercase tracking-[0.10em] ${toneClasses[tone]}`}
      >
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-white font-black text-xs md:text-sm tracking-wide">
        {value}
      </div>
    </div>
  );
}

function formatMoney(v: number) {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + "B";
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(1) + "K";
  return String(v);
}

function formatTimer(t: string) {
  const parts = t.split(":");
  return parts.length === 2 ? parts : ["45", "00"];
}