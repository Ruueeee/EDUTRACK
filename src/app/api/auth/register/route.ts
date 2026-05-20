import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['STUDENT', 'INSTRUCTOR']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ data: null, error: validation.error.flatten() }, { status: 400 });
    }

    const { name, email, password, role } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ data: null, error: 'User already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
      },
    });

    return NextResponse.json({
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
      error: null,
    });
  } catch (error) {
    return NextResponse.json({ data: null, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
