"use client";

import dynamic from "next/dynamic";
import type { EventItem } from "./EventMap";

const EventMap = dynamic(() => import("./EventMap"), {
    ssr: false,
    loading: () => <div className="skeleton w-full h-full min-h-[160px]" />,
});

export default function EventMapClient({ events, height, zoom, onMarkerClick, selectedId }: {
    events: EventItem[];
    height?: number | string;
    zoom?: number;
    onMarkerClick?: (ev: EventItem) => void;
    selectedId?: string;
}) {
    return <EventMap events={events} height={height} zoom={zoom} onMarkerClick={onMarkerClick} selectedId={selectedId} />;
}
