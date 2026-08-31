import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { checkAdminPassword, createAdminSession, isAdminSessionValid } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "관리자 로그인" };

async function login(formData: FormData): Promise<void> {
  "use server";
  const password = String(formData.get("password") ?? "");
  if (!checkAdminPassword(password)) {
    redirect("/admin/login?error=1");
  }
  await createAdminSession();
  redirect("/admin");
}

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdminSessionValid()) {
    redirect("/admin");
  }
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-light">Admin</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">관리자 로그인</h1>
        <p className="mt-2 text-sm text-gray-400">문의 목록을 보려면 비밀번호를 입력하세요.</p>
        <form action={login} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-300">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              // biome-ignore lint/a11y/noAutofocus: single-field login form, focus helps here
              autoFocus
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2.5 text-sm text-white focus:border-accent focus:outline-none"
            />
          </div>
          {error ? <p className="text-sm text-red-400">비밀번호가 올바르지 않습니다.</p> : null}
          <button
            type="submit"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-light"
          >
            로그인
          </button>
        </form>
      </div>
    </main>
  );
}
