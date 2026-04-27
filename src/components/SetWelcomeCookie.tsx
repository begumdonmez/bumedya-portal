"use client";

import { useEffect } from "react";

export default function SetWelcomeCookie() {
    useEffect(() => {
        document.cookie = "bumedya_welcomed=1; path=/; max-age=31536000; SameSite=Lax";
    }, []);
    return null;
}
