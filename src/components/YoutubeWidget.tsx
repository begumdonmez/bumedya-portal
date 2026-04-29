// YouTube playlist ID — youtube.com/playlist?list=BURAYA_ID
// Ya da tek video ID — youtube.com/watch?v=BURAYA_ID  (VIDEO_ID olarak gir)
const YOUTUBE_PLAYLIST_ID = "";
const YOUTUBE_VIDEO_ID    = "";
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@BumedyaOfficial";

export default function YoutubeWidget() {
    const src = YOUTUBE_PLAYLIST_ID
        ? `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&rel=0`
        : YOUTUBE_VIDEO_ID
            ? `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0`
            : null;

    if (!src) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-6">
                <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor" style={{ color: "rgba(255,0,0,0.6)" }}>
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <div className="text-center">
                    <p className="text-sm font-semibold mb-1" style={{ color: "rgba(224,242,254,0.75)" }}>bumedya.</p>
                    <p className="text-xs" style={{ color: "rgba(224,242,254,0.3)" }}>@BumedyaOfficial</p>
                </div>
                {YOUTUBE_CHANNEL_URL && (
                    <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:opacity-80"
                       style={{ background: "rgba(255,0,0,0.12)", border: "1px solid rgba(255,0,0,0.25)", color: "rgba(255,100,100,0.9)" }}>
                        Kanala Git
                    </a>
                )}
            </div>
        );
    }

    return (
        <iframe
            src={src}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="rounded-xl w-full h-full"
            style={{ minHeight: 200 }}
        />
    );
}
