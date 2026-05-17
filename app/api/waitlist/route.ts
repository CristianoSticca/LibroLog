import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email non valida' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Email non valida' }, { status: 400 });
  }

  const supabase = await createClient();
  const normalizedEmail = email.toLowerCase().trim();

  const { error } = await supabase
    .from('waitlist')
    .insert({ email: normalizedEmail });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ message: 'Sei già in lista!' }, { status: 200 });
    }
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }

  // Notifica a te
  await transporter.sendMail({
    from: `"LibroLog" <${process.env.SMTP_USER}>`,
    to: 'info@cristianosticca.com',
    subject: '📚 Nuova iscrizione alla waitlist',
    text: `Nuova iscrizione alla waitlist LibroLog:\n\n${normalizedEmail}\n`,
  });

  return NextResponse.json({ message: 'Iscritto con successo!' }, { status: 201 });
}
