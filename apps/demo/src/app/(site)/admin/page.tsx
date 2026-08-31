import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { destroyAdminSession, isAdminSessionValid } from "@/lib/admin-auth";
import { listContactMessages } from "@/lib/contact-store";

export const metadata: Metadata = { title: "관리자" };

async function logout(): Promise<void> {
  "use server";
  await destroyAdminSession();
  redirect("/admin/login");
}

export default async function AdminPage() {
  if (!(await isAdminSessionValid())) {
    redirect("/admin/login");
  }

  const messages = await listContactMessages();

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-light">Admin</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">문의 목록</h1>
            <p className="mt-1 text-sm text-gray-400">총 {messages.length}건의 문의가 접수되었습니다.</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
            >
              로그아웃
            </button>
          </form>
        </header>

        {messages.length === 0 ? (
          <p className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 text-center text-sm text-gray-400">
            아직 접수된 문의가 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-white">
                    {entry.name} <span className="font-normal text-gray-500">&lt;{entry.email}&gt;</span>
                  </p>
                  <time dateTime={entry.createdAt} className="text-xs text-gray-500">
                    {new Date(entry.createdAt).toLocaleString("ko-KR")}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{entry.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
