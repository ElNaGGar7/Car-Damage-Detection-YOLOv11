import { SignJWT, jwtVerify } from 'jose';
import type { User } from './store';

const JWT_SECRET = new TextEncoder().encode('autocost-ai-secret-key-2024-development-only');

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
}

export async function generateToken(user: Pick<User, 'id' | 'email' | 'name'>): Promise<string> {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  return token;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
}
