import { useMember } from '@/integrations';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';

import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { Mail, User, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ProfilePageContent() {
  const { member, actions } = useMember();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await actions.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const memberName = member?.contact?.firstName || member?.profile?.nickname || 'Jogador';
  const memberEmail = member?.loginEmail || 'Email não disponível';
  const memberPhoto = member?.profile?.photo?.url || 'https://static.wixstatic.com/media/50f4bf_a888df3d639f415b853110e459edba8c~mv2.png?originWidth=128&originHeight=128';
  const createdDate = member?._createdDate ? new Date(member._createdDate).toLocaleDateString('pt-BR') : 'Data não disponível';

  return (
    <div className="min-h-screen bg-background flex flex-col">


      <main className="flex-1 w-full max-w-[120rem] mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Profile Header */}
          <div className="bg-background/50 backdrop-blur-sm border-2 border-secondary/30 rounded-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-secondary relative" style={{
                  boxShadow: '0 0 30px rgba(0,234,255,0.8), inset 0 0 15px rgba(0,234,255,0.3)'
                }}>
                  <Image
                    src={memberPhoto}
                    alt={memberName}
                    width={120}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
                  {memberName}
                </h1>
                <p className="font-paragraph text-lg text-secondary mb-4">
                  Jogador Multiplayer
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-foreground">
                    <Mail className="w-5 h-5 text-secondary" />
                    <span className="font-paragraph">{memberEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Calendar className="w-5 h-5 text-secondary" />
                    <span className="font-paragraph">Membro desde {createdDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Member Status */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-background/50 backdrop-blur-sm border border-secondary/30 rounded-lg p-6"
            >
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-secondary" />
                Status da Conta
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-paragraph text-foreground/70">Status:</span>
                  <span className="font-heading text-sm font-bold text-green-400">
                    ✓ Ativo
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-paragraph text-foreground/70">Email Verificado:</span>
                  <span className="font-heading text-sm font-bold text-green-400">
                    ✓ Sim
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-paragraph text-foreground/70">Tipo de Login:</span>
                  <span className="font-heading text-sm font-bold text-secondary">
                    Google OAuth
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Account Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-background/50 backdrop-blur-sm border border-secondary/30 rounded-lg p-6"
            >
              <h2 className="font-heading text-xl font-bold text-foreground mb-4">
                Ações
              </h2>
              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-logo-gradient-start hover:bg-orange-600 text-white font-heading rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sair da Conta
                </button>
                <p className="font-paragraph text-xs text-foreground/50 text-center">
                  Você será desconectado e redirecionado para a página de login
                </p>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-background/50 backdrop-blur-sm border border-secondary/30 rounded-lg p-6"
          >
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">
              Informações da Conta
            </h2>
            <div className="space-y-3 font-paragraph text-foreground/70">
              <p>
                Sua conta está conectada ao Wix Members e sincronizada com o sistema de jogo multiplayer.
              </p>
              <p>
                Todos os seus dados de progresso e estatísticas são salvos automaticamente na nuvem.
              </p>
              <p className="text-xs">
                ID do Membro: <span className="text-foreground/50 font-mono">{member?.loginEmail}</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <MemberProtectedRoute messageToSignIn="Faça login para acessar seu perfil">
      <ProfilePageContent />
    </MemberProtectedRoute>
  );
}
