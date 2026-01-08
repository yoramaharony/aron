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
                secondary: "var(--text-secondary)",
                // Quiet Luxury additions
                sage: {
                    DEFAULT: "var(--color-sage)",
                    mist: "var(--color-sage-mist)",
                    dark: "var(--color-sage-dark)",
                },
                ivory: "var(--bg-ivory)",
                paper: "var(--bg-paper)",
                charcoal: "var(--text-primary)",
            },
            fontFamily: {
                serif: ['var(--font-cardo)', 'serif'],
                sans: ['var(--font-inter)', 'sans-serif'],
            }
        },
    },
    plugins: [],
};
export default config;
