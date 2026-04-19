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

    const userEstimations = Array.from(store.estimations.values()).filter(e => e.userId === payload.userId);
    const totalEstimations = userEstimations.length;
    const completedEstimations = userEstimations.filter(e => e.status === 'completed').length;
    const pendingEstimations = userEstimations.filter(e => e.status === 'pending').length;
    const totalCost = userEstimations.reduce((sum, e) => sum + e.totalCost, 0);
    const averageCost = totalEstimations > 0 ? Math.round(totalCost / totalEstimations) : 0;
    // Saved money is estimated as 30% of what they would have paid without the system
    const savedMoney = Math.round(totalCost * 0.3);

    return NextResponse.json({
      success: true,
      stats: {
        totalEstimations,
        savedMoney,
        completedEstimations,
        pendingEstimations,
        averageCost,
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 });
  }
}
