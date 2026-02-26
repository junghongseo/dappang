"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addBakeryAction } from "@/app/actions/addBakery";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const formSchema = z.object({
    bakeryName: z.string().min(1, "베이커리 이름을 입력해주세요."),
    instagramId: z.string().min(1, "인스타그램 아이디를 입력해주세요."),
});

type FormValues = z.infer<typeof formSchema>;

export function AddBakeryForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bakeryName: "",
            instagramId: "",
        },
    });

    const onSubmit = (data: FormValues) => {
        setErrorMsg(null);
        startTransition(async () => {
            const result = await addBakeryAction(data);
            if (result.success) {
                router.push("/");
            } else {
                setErrorMsg(result.error ?? "알 수 없는 오류가 발생했습니다.");
            }
        });
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
                <label
                    className="block text-sm font-semibold text-text-main-light dark:text-stone-300"
                    htmlFor="bakeryName"
                >
                    베이커리 이름
                </label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-sub-light dark:text-stone-400">
                        <span className="material-symbols-outlined text-[20px]">
                            storefront
                        </span>
                    </div>
                    <input
                        {...register("bakeryName")}
                        className="block w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-surface-light dark:bg-stone-800 py-3 pl-10 pr-3 text-text-main-light dark:text-stone-200 placeholder:text-stone-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:text-sm shadow-sm transition-shadow"
                        id="bakeryName"
                        placeholder="예: 런던 베이글 뮤지엄"
                        type="text"
                        disabled={isPending}
                    />
                </div>
                {errors.bakeryName && (
                    <p className="text-red-500 text-xs">{errors.bakeryName.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label
                    className="block text-sm font-semibold text-text-main-light dark:text-stone-300"
                    htmlFor="instagramId"
                >
                    인스타그램 아이디 또는 URL
                </label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-sub-light dark:text-stone-400">
                        <span className="material-symbols-outlined text-[20px]">
                            alternate_email
                        </span>
                    </div>
                    <input
                        {...register("instagramId")}
                        className="block w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-surface-light dark:bg-stone-800 py-3 pl-10 pr-3 text-text-main-light dark:text-stone-200 placeholder:text-stone-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:text-sm shadow-sm transition-shadow"
                        id="instagramId"
                        placeholder="@bakery_id"
                        type="text"
                        disabled={isPending}
                    />
                </div>
                {errors.instagramId && (
                    <p className="text-red-500 text-xs">{errors.instagramId.message}</p>
                )}
            </div>


            {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                    {errorMsg}
                </div>
            )}

            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-stone-200 dark:border-stone-700">
                <Link
                    href="/"
                    className="inline-flex w-full justify-center items-center rounded-lg bg-transparent px-5 py-3 text-sm font-semibold text-text-sub-light dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-text-main-light dark:hover:text-stone-200 sm:w-auto transition-colors border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
                >
                    취소
                </Link>
                <button
                    className="inline-flex w-full justify-center items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-hover sm:w-auto transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                    type="submit"
                    disabled={isPending}
                >
                    <span className="material-symbols-outlined text-lg mr-2">
                        {isPending ? "hourglass_empty" : "add"}
                    </span>
                    {isPending ? "추가 중..." : "베이커리 추가하기"}
                </button>
            </div>
        </form>
    );
}
