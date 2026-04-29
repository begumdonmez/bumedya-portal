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
    username: string;
    title: string;
    address: string;
    lat: number;
    lng: number;
    event_date: string;
    ref_url: string | null;
}

const markerIcon = L.divIcon({
    html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:rgba(124,58,237,0.9);border:2px solid rgba(167,139,250,0.9);box-shadow:0 0 12px rgba(124,58,237,0.7)"></span>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -12],
});

export default function EventMap({
    events,
    height = 300,
    zoom = 11,
}: {
    events: EventItem[];
    height?: number | string;
    zoom?: number;
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
            {events.map((ev) => (
                <Marker key={ev.id} position={[ev.lat, ev.lng]} icon={markerIcon}>
                    <Popup>
                        <div style={{ minWidth: 160 }}>
                            <p style={{ fontWeight: 700, marginBottom: 4, color: "#E0F2FE", fontSize: 13 }}>
                                {ev.title}
                            </p>
                            <p style={{ fontSize: 11, color: "rgba(224,242,254,0.6)", marginBottom: 4 }}>
                                {ev.address}
                            </p>
                            <p style={{ fontSize: 11, color: "rgba(167,139,250,0.85)", marginBottom: ev.ref_url ? 6 : 0 }}>
                                {new Date(ev.event_date + "T00:00:00").toLocaleDateString("tr-TR", {
                                    day: "numeric", month: "long", year: "numeric",
                                })}
                            </p>
                            {ev.ref_url && (
                                <a href={ev.ref_url} target="_blank" rel="noopener noreferrer"
                                   style={{ fontSize: 11, color: "rgba(124,58,237,0.9)", textDecoration: "none", display: "block" }}>
                                    Detaylar ›
                                </a>
                            )}
                            <p style={{ fontSize: 10, color: "rgba(224,242,254,0.25)", marginTop: 6 }}>
                                @{ev.username}
                            </p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
        </>
    );
}
