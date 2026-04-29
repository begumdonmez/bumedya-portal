"use client";

import dynamic from "next/dynamic";
import type { EventItem } from "./EventMap";

const EventMap = dynamic(() => import("./EventMap"), { ssr: false });

export default function EventMapClient({ events, height, zoom, onMarkerClick, selectedId }: {
    events: EventItem[];
    height?: number | string;
    zoom?: number;
    onMarkerClick?: (ev: EventItem) => void;
    selectedId?: string;
}) {
    return <EventMap events={events} height={height} zoom={zoom} onMarkerClick={onMarkerClick} selectedId={selectedId} />;
}
