"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

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
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: h, width: "100%" }}
            zoomControl={true}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
                                📍 {ev.address}
                            </p>
                            <p style={{ fontSize: 11, color: "rgba(167,139,250,0.85)", marginBottom: ev.ref_url ? 6 : 0 }}>
                                {new Date(ev.event_date + "T00:00:00").toLocaleDateString("tr-TR", {
                                    day: "numeric", month: "long", year: "numeric",
                                })}
                            </p>
                            {ev.ref_url && (
                                <a href={ev.ref_url} target="_blank" rel="noopener noreferrer"
                                   style={{ fontSize: 11, color: "rgba(124,58,237,0.9)", textDecoration: "none", display: "block" }}>
                                    Detaylar →
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
    );
}
