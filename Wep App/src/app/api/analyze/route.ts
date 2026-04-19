import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);
  if (!token) return null;
  return await verifyToken(token);
}

interface BBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface DamageResult {
  type: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  estimatedCost: number;
  description: string;
  confidence?: number;
  bbox?: BBox; // ده المفتاح السحري اللي بيشغل الرسم عندك
}

// ─── الربط مع FastAPI ───
async function runYOLOModel(imageBase64: string, carName: string): Promise<any> {
  try {
    const response = await fetch('http://localhost:8000/predict_full', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        image: imageBase64,
        carInfo: { carName: carName } 
      }),
    });

    if (!response.ok) throw new Error('FastAPI connection failed');

    const data = await response.json();
    if (data.success) {
      return {
        damages: data.results, // دي اللي جواها الـ bbox دلوقتي
        annotatedImage: data.annotated_image, 
        avgConf: data.avg_conf
      };
    }
    return null;
  } catch (error) {
    console.error('[YOLO Bridge Error]:', error);
    return null;
  }
}

function generateRecommendation(damages: any[], totalCost: number): string {
  const hasHigh = damages.some(d => d.severity === 'high');
  if (hasHigh) {
    return 'يوجد أضرار شديدة ننصح بزيارة ورشة صيانة معتمدة فوراً لتجنب تفاقم المشكلة. يمكنك الحصول على عروض أسعار من أكثر من ورشة لتوفير 20-30% من التكلفة.';
  }
  if (damages.length >= 3) {
    return 'عدد الأضرار كبير. ننصح بفحص الهيكل بالكامل في ورشة معتمدة للتأكد من عدم وجود أضرار خفية إضافية.';
  }
  return `التكلفة المقدرة ${totalCost.toLocaleString()} ج.م. ننصح بزيارة ورشة صيانة معتمدة للحصول على عرض سعر دقيق ومقارنته مع عروض أخرى.`;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { carName, carModel, carYear, imageBase64 } = body;

    let damages: DamageResult[] = [];
    let annotatedImage = null;
    let confidence = 90;
    let usedAI = false;
    let modelStatus = 'fallback';

    if (imageBase64) {
      const aiResult = await runYOLOModel(imageBase64, carName || '');

      if (aiResult && aiResult.damages.length > 0) {
        // ✅ بننقل الداتا بالظبط زي ما جاية من البايثون (شاملة الـ bbox)
        damages = aiResult.damages;
        annotatedImage = aiResult.annotatedImage;
        confidence = Math.min(97, Math.round(aiResult.avgConf * 100));
        usedAI = true;
        modelStatus = 'yolo';
      } else if (aiResult) {
        modelStatus = 'yolo_no_damage';
      } else {
        modelStatus = 'error';
      }
    }

    const totalCost = damages.length > 0 ? damages.reduce((sum, d) => sum + d.estimatedCost, 0) : 0;
    const noDamageMessage = damages.length === 0
      ? 'الموديل لم يكشف عن أضرار واضحة. تأكد من وضوح الصورة والجزء المتضرر.'
      : null;

    return NextResponse.json({
      success: true,
      analysis: {
        id: uuidv4(),
        damages, // هتتبعت للـ Dashboard وفيها الـ x1, y1, x2, y2
        annotatedImage, 
        totalCost,
        currency: 'EGP',
        confidence,
        carInfo: { carName: carName || 'غير محدد', carModel, carYear },
        usedAI,
        model: 'YOLOv11 High-Tech Detection',
        modelStatus,
        noDamageMessage,
        recommendation: damages.length > 0 ? generateRecommendation(damages, totalCost) : noDamageMessage,
        processedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ أثناء التحليل' }, { status: 500 });
  }
}
