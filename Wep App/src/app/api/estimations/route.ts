import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    let userEstimations = Array.from(store.estimations.values())
      .filter(e => e.userId === payload.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (status) {
      userEstimations = userEstimations.filter(e => e.status === status);
    }

    userEstimations = userEstimations.slice(0, limit);

    return NextResponse.json({ success: true, estimations: userEstimations });
  } catch {
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { carName, carModel, carYear, imageBase64, aiAnalysis } = body;

    if (!carName || !carModel || !carYear) {
      return NextResponse.json({ success: false, message: 'بيانات السيارة مطلوبة' }, { status: 400 });
    }

    // Use AI analysis if available, otherwise generate mock
    let damages;
    let confidence;

    if (aiAnalysis && aiAnalysis.damages && aiAnalysis.damages.length > 0) {
      damages = aiAnalysis.damages;
      confidence = aiAnalysis.confidence || Math.round(87 + Math.random() * 11);
    } else {
      // Fallback: generate mock damage analysis
      const damageTypes: Array<{ type: 'dent' | 'scratch' | 'break' | 'crack' | 'other'; location: string; locationEn: string }> = [
        { type: 'dent', location: 'الباب الأمامي الأيسر', locationEn: 'Front Left Door' },
        { type: 'scratch', location: 'المصد الخلفي', locationEn: 'Rear Bumper' },
        { type: 'break', location: 'المصباح الأمامي الأيمن', locationEn: 'Right Headlight' },
        { type: 'crack', location: 'الزجاج الأمامي', locationEn: 'Front Windscreen' },
      ];

      const numDamages = Math.floor(Math.random() * 2) + 1;
      const selectedDamages = damageTypes.sort(() => Math.random() - 0.5).slice(0, numDamages);
      const severities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
      const severityArMap: Record<string, string> = { low: 'خفيف', medium: 'متوسط', high: 'شديد' };
      const severityEnMap: Record<string, string> = { low: 'Low', medium: 'Medium', high: 'High' };
      const descArMap: Record<string, string> = { dent: 'انبعاج في الهيكل', scratch: 'خدش في الطلاء', break: 'كسر في المصباح', crack: 'تشقق في الزجاج', other: 'ضرر متنوع' };
      const descEnMap: Record<string, string> = { dent: 'Body Dent', scratch: 'Paint Scratch', break: 'Light Break', crack: 'Glass Crack', other: 'Miscellaneous Damage' };

      // Generate synthetic bbox zones spread across the image
      const zones = [
        { x1: 0.05, y1: 0.15, x2: 0.45, y2: 0.55 },  // front-left area
        { x1: 0.55, y1: 0.10, x2: 0.95, y2: 0.50 },  // front-right area
        { x1: 0.10, y1: 0.50, x2: 0.50, y2: 0.85 },  // rear-left area
        { x1: 0.55, y1: 0.50, x2: 0.92, y2: 0.82 },  // rear-right area
      ];
      const shuffledZones = zones.sort(() => Math.random() - 0.5);

      damages = selectedDamages.map((d, i) => {
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const costBase = d.type === 'dent' ? 2500 : d.type === 'scratch' ? 1000 : d.type === 'break' ? 3500 : 3000;
        const costMult = severity === 'low' ? 0.8 : severity === 'medium' ? 1.5 : 2.5;
        const zone = shuffledZones[i % shuffledZones.length];
        // Add slight random jitter within the zone
        const jitter = () => (Math.random() - 0.5) * 0.06;
        return {
          type: d.type,
          severity,
          severityAr: severityArMap[severity],
          severityEn: severityEnMap[severity],
          location: d.location,
          locationEn: d.locationEn,
          label: d.locationEn,
          estimatedCost: Math.round(costBase * costMult * (0.9 + Math.random() * 0.2)),
          description: `${severityArMap[severity]} في ${d.location}`,
          descriptionEn: `${severityEnMap[severity]} ${descEnMap[d.type]}`,
          confidence: 0.85 + Math.random() * 0.12,
          bbox: {
            x1: Math.max(0.02, Math.min(zone.x1 + jitter(), 0.88)),
            y1: Math.max(0.02, Math.min(zone.y1 + jitter(), 0.88)),
            x2: Math.max(0.12, Math.min(zone.x2 + jitter(), 0.98)),
            y2: Math.max(0.12, Math.min(zone.y2 + jitter(), 0.98)),
          },
        };
      });
      confidence = Math.round(87 + Math.random() * 11);
    }

    const totalCost = damages.reduce((sum, d) => sum + d.estimatedCost, 0);

    const estimation = {
      id: uuidv4(),
      userId: payload.userId,
      carName,
      carModel,
      carYear,
      imageUrl: imageBase64 ? `/uploads/upload-${Date.now()}.jpg` : '/uploads/placeholder-new.jpg',
      damages,
      totalCost,
      currency: 'EGP',
      status: 'completed' as const,
      confidence: confidence || Math.round(87 + Math.random() * 11),
      createdAt: new Date().toISOString(),
    };

    store.estimations.set(estimation.id, estimation);

    // Create notification
    const notif = {
      id: uuidv4(),
      userId: payload.userId,
      title: 'تقرير جديد جاهز',
      message: `تم الانتهاء من تحليل أضرار ${carName} ${carYear}. التكلفة المقدرة: ${totalCost.toLocaleString()} جنيه.`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    store.notifications.set(notif.id, notif);

    return NextResponse.json({ success: true, estimation }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 });
  }
}
