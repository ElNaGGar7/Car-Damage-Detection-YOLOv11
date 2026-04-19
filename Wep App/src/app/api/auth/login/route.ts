import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { generateToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    // Find user
    let foundUser = null;
    for (const [, user] of store.users) {
      if (user.email === email.toLowerCase()) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // Compare password
    const isValid = await bcrypt.compare(password, foundUser.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // Generate token
    const token = await generateToken({ id: foundUser.id, email: foundUser.email, name: foundUser.name });

    return NextResponse.json({
      success: true,
      user: { id: foundUser.id, name: foundUser.name, email: foundUser.email, phone: foundUser.phone, avatar: foundUser.avatar },
      token,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
