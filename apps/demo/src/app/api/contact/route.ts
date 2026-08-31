import { NextResponse } from "next/server";
import { appendContactMessage } from "@/lib/contact-store";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { name, email, message } = body as Record<string, unknown>;
  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return NextResponse.json({ error: "이름, 이메일, 메시지를 모두 입력해주세요." }, { status: 400 });
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();
  if (!trimmedName || !trimmedEmail || !trimmedMessage) {
    return NextResponse.json({ error: "이름, 이메일, 메시지를 모두 입력해주세요." }, { status: 400 });
  }

  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return NextResponse.json({ error: "올바른 이메일 주소를 입력해주세요." }, { status: 400 });
  }

  if (trimmedName.length > 200 || trimmedEmail.length > 320 || trimmedMessage.length > 5000) {
    return NextResponse.json({ error: "입력 길이가 너무 깁니다." }, { status: 400 });
  }

  const record = await appendContactMessage({
    name: trimmedName,
    email: trimmedEmail,
    message: trimmedMessage,
  });

  return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
}
