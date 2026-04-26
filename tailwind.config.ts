import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}", // src içindeki her şeyi tara
        "../app/**/*.{js,ts,jsx,tsx,mdx}", // root'ta app kaldıysa onu da tara
    ],
    theme: {
        extend: {
            colors: {
                'ana-lacivert': '#0A0F1E',
                'canli-mor': '#7C3AED',
                'buz-mavisi': '#E0F2FE',
            },
        },
    },
    plugins: [],
};
export default config;