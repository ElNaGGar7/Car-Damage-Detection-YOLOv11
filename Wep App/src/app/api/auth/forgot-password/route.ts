import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    // Check if user exists
    let userExists = false;
    for (const [, user] of store.users) {
      if (user.email === email.toLowerCase()) {
        userExists = true;
        break;
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في النظام' },
      { status: 500 }
    );
  }
}
