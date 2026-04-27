"use client";

import dynamic from "next/dynamic";
import type { EventItem } from "./EventMap";

const EventMap = dynamic(() => import("./EventMap"), { ssr: false });

export default function EventMapClient({ events, height, zoom }: {
    events: EventItem[];
    height?: number | string;
    zoom?: number;
}) {
    return <EventMap events={events} height={height} zoom={zoom} />;
}
