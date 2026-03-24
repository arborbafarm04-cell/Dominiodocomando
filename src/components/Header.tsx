import { useEffect, useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import { useDirtyMoneyStore } from "@/store/dirtyMoneyStore";
import { useCleanMoneyStore } from "@/store/cleanMoneyStore";
import { usePlayerStore } from "@/store/playerStore";
import { useSpinVault } from "@/hooks/useSpinVault";
import { useNavigate } from "react-router-dom";
import { useMember } from "@/integrations";
import { LogOut } from "lucide-react";

const LOGO_SRC = "https://static.wixstatic.com/media/50f4bf_01590cb08b7048babbfed83e2830a27c~mv2.png";

export default function Header() {
  const { dirtyMoney } = useDirtyMoneyStore();
  const { cleanMoney } = useCleanMoneyStore();
  const { playerName, setPlayerName, resetPlayer, level } = usePlayerStore();
  const { spins, timeUntilNextGain, formatTime } = useSpinVault();
  const { actions, member } = useMember();
  const navigate = useNavigate();

  const [avatarUrl, setAvatarUrl] = useState(
    "https://static.wixstatic.com/media/50f4bf_a888df3d639f415b853110e459edba8c~mv2.png"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem("playerName");
    const savedAvatar = localStorage.getItem("playerAvatar");

    if (savedName) setPlayerName(savedName);
    if (savedAvatar) setAvatarUrl(savedAvatar);
  }, []);

  const handleLogout = async () => {
    localStorage.clear();
    resetPlayer();
    if (member) await actions.logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">

      {/* FUNDO */}
      <div
        className="w-full px-4 py-2"
        style={{
          background:
            "linear-gradient(90deg, #1a0a07 0%, #2b0d09 40%, #120807 100%)",
          borderBottom: "2px solid #d4af37",
        }}
      >

        <div className="flex items-center justify-between max-w-[1400px] mx-auto">

          {/* 🔥 ESQUERDA - LOGO */}
          <div className="flex items-center">
            <Image
              src={LOGO_SRC}
              alt="Logo"
              width={180}
              height={80}
              className="object-contain"
            />
          </div>

          {/* 🔥 CENTRO */}
          <div className="flex items-center gap-6">

            {/* AVATAR */}
            <div className="flex items-center gap-4">
              <div className="w-[70px] h-[70px] rounded-full border-4 border-yellow-500 overflow-hidden">
                <Image src={avatarUrl} className="w-full h-full object-cover" />
              </div>

              <div>
                <div className="text-yellow-400 font-bold text-xl">
                  {playerName}
                </div>

                <div className="bg-red-600 text-white text-xs px-3 py-1 font-bold uppercase">
                  COMANDANTE DE ELITE
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="flex gap-6 text-white text-sm">

              <Stat label="NÍVEL" value={level} />
              <Stat label="PODER" value="1.2M" />
              <Stat label="DINHEIRO SUJO" value={`$${formatMoney(dirtyMoney)}`} />
              <Stat label="DINHEIRO LIMPO" value={`$${formatMoney(cleanMoney)}`} />
              <Stat label="GIROS" value={spins} />

            </div>
          </div>

          {/* 🔥 DIREITA - TIMER */}
          <div className="text-white text-center">

            <div className="text-xs uppercase">
              PRÓXIMO GANHO DE GIROS EM:
            </div>

            <div className="flex gap-2 justify-center mt-1">
              {formatTimer(formatTime(timeUntilNextGain)).map((t, i) => (
                <div
                  key={i}
                  className="bg-black px-3 py-2 text-xl font-bold border border-gray-700"
                >
                  {t}
                </div>
              ))}
            </div>

            <div className="text-xs mt-1 text-gray-400">
              Tempo até próximo giro
            </div>

          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            <LogOut />
          </button>

        </div>
      </div>
    </header>
  );
}

/* COMPONENTE STAT */
function Stat({ label, value }: any) {
  return (
    <div className="flex flex-col text-center">
      <span className="text-yellow-400 text-xs">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

/* FORMATADORES */
function formatMoney(v: number) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(1) + "K";
  return v;
}

function formatTimer(t: string) {
  const parts = t.split(":");
  return parts.length === 2 ? parts : ["45", "00"];
}
