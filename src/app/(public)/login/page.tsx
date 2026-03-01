"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (data.success) {
                router.push("/admin");
                router.refresh();
            } else {
                setError(data.error || "로그인에 실패했습니다.");
            }
        } catch {
            setError("서버 연결에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
            <div className="w-full max-w-sm">
                {/* 브랜딩 */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl">
                            bakery_dining
                        </span>
                    </div>
                    <h1 className="font-display text-3xl font-bold text-primary dark:text-amber-500">
                        다빵 캘린더
                    </h1>
                    <p className="text-sm text-text-sub-light dark:text-text-sub-dark mt-1">
                        관리자 인증이 필요합니다
                    </p>
                </div>

                {/* 로그인 폼 */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 p-6 space-y-5"
                >
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-text-main-light dark:text-text-main-dark mb-2"
                        >
                            관리자 비밀번호
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg text-text-sub-light dark:text-text-sub-dark">
                                lock
                            </span>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호를 입력하세요"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-text-main-light dark:text-text-main-dark placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg p-3">
                            <span className="material-symbols-outlined text-lg">
                                error
                            </span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined text-lg animate-spin">
                                    sync
                                </span>
                                인증 중...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">
                                    login
                                </span>
                                로그인
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-xs text-text-sub-light dark:text-text-sub-dark mt-6">
                    이 페이지는 관리자 전용입니다
                </p>
            </div>
        </div>
    );
}
