import { ImageResponse } from "next/og";

export const alt = "bumedya. — dijital fanzin ve topluluk";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div style={{
                width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
                background: "#F5EEE2", color: "#2A1D17", padding: 80, fontFamily: "serif",
            }}>
                <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#8A7564" }}>Sayı 01 · dijital fanzin</div>
                <div style={{ display: "flex", flexDirection: "column", fontSize: 128, lineHeight: 1 }}>
                    <span>Üret.</span>
                    <span style={{ color: "#B4401F", fontStyle: "italic" }}>Paylaş.</span>
                    <span>Büyü.</span>
                </div>
                <div style={{ display: "flex", fontSize: 44 }}>bumedya<span style={{ color: "#B4401F" }}>.</span></div>
            </div>
        ),
        size,
    );
}
