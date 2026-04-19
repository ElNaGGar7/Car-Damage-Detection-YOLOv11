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

    const user = store.users.get(payload.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 });
    }

    const { password: _, ...profile } = user;
    return NextResponse.json({ success: true, user: profile });
  } catch {
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    const user = store.users.get(payload.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 });
    }

    const body = await request.json();
    const { name, phone, avatar } = body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    store.users.set(user.id, user);

    const { password: _, ...profile } = user;
    return NextResponse.json({ success: true, user: profile });
  } catch {
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 });
  }
}
