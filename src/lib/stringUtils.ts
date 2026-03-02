/**
 * 텍스트 클리닝 (요약용, 태그 제거)
 */
export function stripHtml(text: string) {
    if (!text) return "";
    return text.replace(/<[^>]*>?/gm, '').replace(/\[?https?:\/\/[^\s<\]\)]+\]?/g, "").trim();
}

/**
 * 텍스트 내의 URL(인스타그램 등)을 아이콘 형태의 외부 링크 버턴 HTML 문자열로 변환
 */
export function formatLinksToIcons(text: string) {
    if (!text) return "";
    const regex = /<a\s+(?:[^>]*?\s+)?href=(['"])(.*?)\1[^>]*>.*?<\/a>|\[?(https?:\/\/[^\s<\]\)]+)\]?/gi;
    return text.replace(regex, (match, quote, aHref, rawUrl) => {
        const url = aHref || rawUrl;
        if (!url) return match;
        const cleanUrl = url.replace(/^[\[\(]/, '').replace(/[\]\)]$/, '');
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 transition-colors mx-1 align-middle bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded px-1.5 py-0.5 border border-stone-200 dark:border-stone-700" title="해당 링크 열기" onclick="event.stopPropagation()">
            <span class="material-symbols-outlined text-[14px]">link</span>
            <span class="text-[11px] font-bold ml-0.5">링크</span>
        </a>`;
    });
}
