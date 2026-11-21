export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname || null,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt
  };
}
