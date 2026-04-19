import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);
  if (!token) return null;
  return await verifyToken(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    const { id } = await params;
    const estimation = store.estimations.get(id);

    if (!estimation || estimation.userId !== payload.userId) {
      return NextResponse.json({ success: false, message: 'التقدير غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, estimation });
  } catch {
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    const { id } = await params;
    const estimation = store.estimations.get(id);

    if (!estimation || estimation.userId !== payload.userId) {
      return NextResponse.json({ success: false, message: 'التقدير غير موجود' }, { status: 404 });
    }

    store.estimations.delete(id);

    return NextResponse.json({ success: true, message: 'تم حذف التقدير بنجاح' });
  } catch {
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 });
  }
}
