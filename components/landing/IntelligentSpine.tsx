'use client';

import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export function IntelligentSpine() {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // Text Refs - Updated for 10 Steps
    const textRef1 = useRef<HTMLDivElement>(null);
    const textRef2 = useRef<HTMLDivElement>(null);
    const textRef3 = useRef<HTMLDivElement>(null);
    const textRef4 = useRef<HTMLDivElement>(null);
    const textRef5 = useRef<HTMLDivElement>(null);
    const textRef6 = useRef<HTMLDivElement>(null);
    const textRef7 = useRef<HTMLDivElement>(null);
    const textRef8 = useRef<HTMLDivElement>(null);
    const textRef9 = useRef<HTMLDivElement>(null);
    const textRef10 = useRef<HTMLDivElement>(null);

    // Array of refs for loop convenience
    const textRefs = [textRef1, textRef2, textRef3, textRef4, textRef5, textRef6, textRef7, textRef8, textRef9, textRef10];

    useGSAP(() => {
        if (!containerRef.current || !svgRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
            }
        });

        // Define animation chunks (10 steps over the scroll duration)
        // Each step takes roughly 1 "unit" of scroll time

        // --- STEP 1: Define Your Legacy ---
        tl.fromTo(textRef1.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, 0)
            .to('#chaos-group', { opacity: 0, duration: 2 }, 0.5) // clear chaos
            .to(textRef1.current, { opacity: 0, y: -50, duration: 1 }, 2);

        // --- STEP 2: Funding Strategy (Grid appears) ---
        tl.fromTo(textRef2.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, 2)
            .to('#grid-group', { opacity: 1, scale: 1, duration: 2 }, 2.5)
            .to(textRef2.current, { opacity: 0, y: -50, duration: 1 }, 4);

        // --- STEP 3: Intake + Diligence (Blueprint/Filter) ---
        tl.fromTo(textRef3.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, 4)
            .to(textRef3.current, { opacity: 0, y: -50, duration: 1 }, 6);

        // --- STEP 4: Curated Opportunities (Scanner) ---
        tl.fromTo(textRef4.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, 6)
            .to('#scanner-group', { opacity: 1, duration: 1 }, 6.5)
            .to('.opp-card', { y: 300, stagger: 0.1, duration: 2 }, 6.5)
            .to(textRef4.current, { opacity: 0, y: -50, duration: 1 }, 8);

        // --- STEP 5: Decide in Seconds ---
        tl.fromTo(textRef5.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, 8)
            .to(textRef5.current, { opacity: 0, y: -50, duration: 1 }, 10);

        // --- STEP 6: Leverage Engine (Zap) ---
        tl.fromTo(textRef6.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, 10)
            .to(textRef6.current, { opacity: 0, y: -50, duration: 1 }, 12);

        // --- STEP 7: Ugly Work (Box) ---
        tl.fromTo(textRef7.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, 12)
            .to('#box-group', { opacity: 1, duration: 1 }, 12.5)
            .to(textRef7.current, { opacity: 0, y: -50, duration: 1 }, 14);

        // --- STEP 8: Verification (Checkmark) ---
        tl.fromTo(textRef8.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, 14)
            .to(textRef8.current, { opacity: 0, y: -50, duration: 1 }, 16);

        // --- STEP 9: Compounding Impact (Sunburst) ---
        tl.fromTo(textRef9.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, 16)
            .to('#bloom-group', { opacity: 1, duration: 1 }, 16.5)
            .to('.sunburst-ray', { scale: 1.5, opacity: 1, stagger: 0.05, duration: 2 }, 17)
            .to(textRef9.current, { opacity: 0, y: -50, duration: 1 }, 18);

        // --- STEP 10: Iterate (Loop) ---
        tl.fromTo(textRef10.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, 18)
            .to(textRef10.current, { opacity: 0, y: -50, duration: 1 }, 20);


    }, { scope: containerRef });

    const stepData = [
        { title: "1. Define your legacy", desc: "Turn intent into a Blueprint. Causes, geographies, time horizons." },
        { title: "2. Convert to strategy", desc: "Budget, allocations, and strict governance rules." },
        { title: "3. Intake & Diligence", desc: "We absorb the chaos. Standardized intake, deep financials, risk flags." },
        { title: "4. Curated Feed", desc: "Only aligned opportunities. Clear use of funds. No noise." },
        { title: "5. Decide in seconds", desc: "Review simplified key facts. With one click, choose to Pass, Shortlist for later, or Leverage our network. Reversible decisions." },
        { title: "6. The Leverage Engine", desc: "Turn $1 into $3. Challenge grants, matching groups, conditional terms." },
        { title: "7. The \"Ugly Work\"", desc: "Agreements, disbursements, tax packs. We handle the machine." },
        { title: "8. Verification", desc: "Evidence required. No narrative fluff. Verified outcomes only." },
        { title: "9. Impact Compounds", desc: "Institutional memory. Playbooks that get smarter over time." },
        { title: "10. Iterate", desc: "Update your blueprint. Spin up new pillars. Your legacy evolves." }
    ];

    return (
        <div ref={containerRef} className="relative h-[700vh] bg-[var(--bg-paper)]">
            {/* Reduced height to accommodate faster pacing */}

            {/* STICKY VISUAL STAGE */}
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
                <svg ref={svgRef} viewBox="0 0 800 600" className="w-full h-full max-w-4xl opacity-90">
                    <defs>
                        <filter id="glow-spine" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* THE SPINE (Global) */}
                    <line x1="400" y1="0" x2="400" y2="600" stroke="var(--border-strong)" strokeWidth="1" />

                    {/* 1. MISSION (Chaos - repurposed) */}
                    <g id="chaos-group" opacity="1">
                        {[
                            { cx: 360, cy: 260 }, { cx: 420, cy: 290 }, { cx: 380, cy: 310 }, { cx: 440, cy: 270 },
                            { cx: 390, cy: 330 }, { cx: 410, cy: 260 }, { cx: 370, cy: 300 }, { cx: 430, cy: 320 },
                            { cx: 355, cy: 280 }, { cx: 445, cy: 300 }, { cx: 400, cy: 340 }, { cx: 400, cy: 255 },
                            { cx: 365, cy: 305 }, { cx: 435, cy: 275 }, { cx: 395, cy: 295 }, { cx: 405, cy: 315 },
                        ].map((dot, i) => (
                            <circle key={i} id={`chaos-dot-${i}`} cx={dot.cx} cy={dot.cy} r="3" fill="var(--text-tertiary)" />
                        ))}
                    </g>

                    {/* 2. GRID */}
                    <g id="grid-group" opacity="0">
                        <rect x="350" y="250" width="100" height="100" fill="none" stroke="var(--text-primary)" strokeWidth="1" />
                        <line x1="400" y1="250" x2="400" y2="350" stroke="var(--text-primary)" strokeWidth="0.5" />
                        <line x1="350" y1="300" x2="450" y2="300" stroke="var(--text-primary)" strokeWidth="0.5" />
                    </g>

                    {/* 4. OPPORTUNITIES (Scanner) */}
                    <g id="scanner-group" opacity="0" transform="translate(0, 50)">
                        <rect className="opp-card accepted" x="380" y="100" width="40" height="30" rx="2" fill="var(--bg-surface)" stroke="var(--text-secondary)" />
                        <rect className="opp-card rejected" x="330" y="80" width="40" height="30" rx="2" fill="var(--bg-surface)" stroke="var(--text-tertiary)" />
                        <rect className="opp-card rejected" x="430" y="120" width="40" height="30" rx="2" fill="var(--bg-surface)" stroke="var(--text-tertiary)" />
                    </g>

                    {/* 7. EXECUTION (Box) */}
                    <g id="box-group" opacity="0" transform="translate(400, 300)">
                        <rect x="-40" y="-40" width="80" height="80" fill="var(--text-primary)" rx="4" />
                        <circle cx="0" cy="-60" r="8" fill="var(--color-sage)" />
                    </g>

                    {/* 9. CHANGE (Sunburst) */}
                    <g id="bloom-group" opacity="0" transform="translate(400, 300)">
                        {[
                            { x2: 100, y2: 0 }, { x2: 86.6, y2: 50 }, { x2: 50, y2: 86.6 }, { x2: 0, y2: 100 },
                            { x2: -50, y2: 86.6 }, { x2: -86.6, y2: 50 }, { x2: -100, y2: 0 }, { x2: -86.6, y2: -50 },
                            { x2: -50, y2: -86.6 }, { x2: 0, y2: -100 }, { x2: 50, y2: -86.6 }, { x2: 86.6, y2: -50 }
                        ].map((coords, i) => (
                            <line key={i} className="sunburst-ray" x1="0" y1="0" x2={coords.x2} y2={coords.y2} stroke="var(--color-sage)" strokeWidth="2" opacity="0" />
                        ))}
                    </g>

                </svg>
            </div>

            {/* TEXT SECTIONS (Overlay) */}
            <div className="absolute top-0 left-0 w-full">
                {stepData.map((step, i) => (
                    <div
                        key={i}
                        className={`h-[70vh] flex items-center ${
                            i % 2 === 0
                                ? 'justify-start pr-6 pl-[clamp(1.5rem,10vw,20rem)]'
                                : 'justify-end pl-6 pr-[clamp(1.5rem,10vw,20rem)]'
                        } pointer-events-none`}
                    >
                        <div
                            ref={textRefs[i]}
                            className="p-8 rounded-xl border border-[rgba(255,255,255,0.10)] backdrop-blur max-w-md opacity-0 shadow-[0_18px_60px_-35px_rgba(0,0,0,0.85)] bg-[radial-gradient(900px_500px_at_20%_0%,rgba(255,43,214,0.14),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]"
                        >
                            <h3 className="font-serif text-2xl mb-2 text-[var(--color-gold)]">{step.title}</h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
