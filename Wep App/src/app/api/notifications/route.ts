import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);
  if (!token) return null;
  return await verifyToken(token);
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    const userNotifications = Array.from(store.notifications.values())
      .filter(n => n.userId === payload.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, notifications: userNotifications });
  } catch {
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 });
  }
}
