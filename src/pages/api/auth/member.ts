import type { APIRoute } from 'astro';

// Mock member data for development
const mockMember = {
  _id: 'test-user-123',
  loginEmail: 'test@example.com',
  loginEmailVerified: true,
  status: 'APPROVED',
  contact: {
    firstName: 'Test',
    lastName: 'User',
  },
  profile: {
    nickname: 'TestUser',
    title: 'Player',
  },
  // Datas convertidas para strings ISO (JSON-friendly)
  _createdDate: new Date().toISOString(),
  _updatedDate: new Date().toISOString(),
};

export const GET: APIRoute = async () => {
  // Em produção, aqui você validaria a sessão e retornaria o membro real
  // Por enquanto, retorna dados mockados para desenvolvimento
  return new Response(JSON.stringify(mockMember), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};