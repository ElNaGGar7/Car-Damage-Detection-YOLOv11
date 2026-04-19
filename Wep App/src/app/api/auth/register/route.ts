import { NextRequest, NextResponse } from 'next/server';
import { store, type User } from '@/lib/store';
import { generateToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    // Validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'الاسم والبريد الإلكتروني ورقم الهاتف وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'بريد إلكتروني غير صالح' },
        { status: 400 }
      );
    }

    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: 'رقم هاتف غير صالح (يجب أن يكون 11 رقم يبدأ بـ 01)' },
        { status: 400 }
      );
    }

    // Check if user exists
    for (const [, user] of store.users) {
      if (user.email === email.toLowerCase()) {
        return NextResponse.json(
          { success: false, message: 'هذا البريد الإلكتروني مسجل بالفعل' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser: User = {
      id: uuidv4(),
      name,
      email: email.toLowerCase(),
      phone: phone || undefined,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    store.users.set(newUser.id, newUser);

    // Generate token
    const token = await generateToken({ id: newUser.id, email: newUser.email, name: newUser.name });

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone },
      token,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    );
  }
}
