"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect } from "react";

function LeafletThemePatch() {
    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = `
            .leaflet-container { border-radius: inherit !important; }
            .leaflet-container img { max-width: none !important; max-height: none !important; }
            .leaflet-tile { max-width: none !important; }
            .leaflet-control-zoom { border: 1px solid rgba(124,58,237,0.3) !important; border-radius: 10px !important; overflow: hidden !important; box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important; }
            .leaflet-control-zoom-in, .leaflet-control-zoom-out { background-color: rgba(15,20,50,0.92) !important; color: rgba(167,139,250,0.85) !important; width: 30px !important; height: 30px !important; line-height: 30px !important; }
            .leaflet-control-zoom-in:hover, .leaflet-control-zoom-out:hover { background-color: rgba(124,58,237,0.25) !important; color: #fff !important; }
            .leaflet-control-zoom-in { border-bottom: 1px solid rgba(124,58,237,0.2) !important; }
            .leaflet-control-attribution { background: rgba(10,15,35,0.8) !important; color: rgba(224,242,254,0.3) !important; font-size: 10px !important; }
            .leaflet-control-attribution a { color: rgba(167,139,250,0.55) !important; }
            .leaflet-popup-content-wrapper { background: rgba(15,25,50,0.96) !important; border: 1px solid rgba(124,58,237,0.25) !important; border-radius: 14px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important; color: #E0F2FE !important; }
            .leaflet-popup-tip { background: rgba(15,25,50,0.96) !important; }
            .leaflet-popup-close-button { color: rgba(224,242,254,0.35) !important; }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);
    return null;
}

export interface EventItem {
    id: string;
    user_id?: string;
    username: string;
    title: string;
    address: string;
    lat: number;
    lng: number;
    event_date: string;
    event_time?: string | null;
    ref_url: string | null;
    approved?: boolean;
}

function makeIcon(color: string, glow: string, size = 28) {
    const s = size;
    const svg = `
        <svg width="${s}" height="${Math.round(s * 1.35)}" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 24 14 24S28 23.333 28 14C28 6.268 21.732 0 14 0z"
                fill="${color}" filter="url(#glow)" style="filter:drop-shadow(0 2px 8px ${glow})"/>
            <circle cx="14" cy="14" r="5.5" fill="rgba(255,255,255,0.9)"/>
        </svg>`;
    return L.divIcon({
        html: svg,
        className: "",
        iconSize: [s, Math.round(s * 1.35)],
        iconAnchor: [s / 2, Math.round(s * 1.35)],
        popupAnchor: [0, -Math.round(s * 1.35)],
    });
}

const regularIcon  = makeIcon("rgba(124,58,237,0.95)", "rgba(124,58,237,0.6)", 18);
const approvedIcon = makeIcon("rgba(52,211,153,0.95)", "rgba(52,211,153,0.5)", 18);
const selectedIcon = makeIcon("rgba(251,191,36,0.98)", "rgba(251,191,36,0.7)", 22);

export default function EventMap({
    events,
    height = 300,
    zoom = 11,
    onMarkerClick,
    selectedId,
}: {
    events: EventItem[];
    height?: number | string;
    zoom?: number;
    onMarkerClick?: (ev: EventItem) => void;
    selectedId?: string;
}) {
    const center: [number, number] =
        events.length > 0 ? [events[0].lat, events[0].lng] : [41.0082, 28.9784];

    const h = typeof height === "number" ? `${height}px` : height;

    return (
        <>
        <LeafletThemePatch />
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: h, width: "100%" }}
            zoomControl={true}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                maxZoom={19}
            />
            {events.map((ev) => {
                const icon = ev.id === selectedId ? selectedIcon : ev.approved ? approvedIcon : regularIcon;
                return (
                    <Marker
                        key={ev.id}
                        position={[ev.lat, ev.lng]}
                        icon={icon}
                        eventHandlers={onMarkerClick ? { click: () => onMarkerClick(ev) } : undefined}
                    >
                        {!onMarkerClick && (
                            <Popup>
                                <div style={{ minWidth: 160 }}>
                                    <p style={{ fontWeight: 700, marginBottom: 4, color: "#E0F2FE", fontSize: 13 }}>{ev.title}</p>
                                    <p style={{ fontSize: 11, color: "rgba(224,242,254,0.6)", marginBottom: 4 }}>{ev.address}</p>
                                    <p style={{ fontSize: 11, color: "rgba(167,139,250,0.85)" }}>
                                        {new Date(ev.event_date + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                                        {ev.event_time ? ` · ${ev.event_time.slice(0, 5)}` : ""}
                                    </p>
                                    {ev.ref_url && (
                                        <a href={ev.ref_url} target="_blank" rel="noopener noreferrer"
                                           style={{ fontSize: 11, color: "rgba(124,58,237,0.9)", textDecoration: "none", display: "block", marginTop: 6 }}>
                                            Detaylar ›
                                        </a>
                                    )}
                                </div>
                            </Popup>
                        )}
                    </Marker>
                );
            })}
        </MapContainer>
        </>
    );
}
