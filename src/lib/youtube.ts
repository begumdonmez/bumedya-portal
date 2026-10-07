/** YouTube bağlantısından 11 karakterlik video kimliğini çıkarır; geçersizse null. */
export function parseYoutubeId(input: string): string | null {
    const s = input.trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
    try {
        const u = new URL(s);
        const host = u.hostname.replace(/^www\.|^m\./, "");
        let id: string | null = null;
        if (host === "youtu.be") id = u.pathname.slice(1);
        else if (host === "youtube.com" || host === "youtube-nocookie.com") {
            id = u.searchParams.get("v")
                ?? u.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1]
                ?? null;
        }
        return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    } catch {
        return null;
    }
}
