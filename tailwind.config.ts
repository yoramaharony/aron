import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                gold: "var(--color-gold)",
                magenta: "var(--color-magenta)",
                secondary: "var(--text-secondary)",
                surface: "var(--bg-surface)",
                card: "var(--bg-card)",
                elevated: "var(--bg-elevated)",
                primaryText: "var(--text-primary)",
                tertiary: "var(--text-tertiary)",
            },
            fontFamily: {
                // Keep `font-serif` available, but map it to the same font as the rest of the app.
                serif: ['var(--font-inter)', 'sans-serif'],
                sans: ['var(--font-inter)', 'sans-serif'],
            }
        },
    },
    plugins: [],
};
export default config;
