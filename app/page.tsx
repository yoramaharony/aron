'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Zap, Lock, Filter, FileText, CheckCircle, ChevronRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IntelligentSpine } from '@/components/landing/IntelligentSpine';
import { RotatingVideoBackground } from '@/components/landing/RotatingVideoBackground';
import { AronLogo } from '@/components/layout/AronLogo';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  // Support direct invite links like "/?invite=XXXX-XXXX-XXXX"
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) setInviteCode(invite);
  }, []);

  const handleInviteContinue = async () => {
    setInviteLoading(true);
    setInviteError('');
    try {
      const res = await fetch('/api/invites/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode }),
      });
      const data = await res.json();
      if (!res.ok || !data?.valid) {
        throw new Error('Invalid invite code');
      }

      const role = data.intendedRole === 'donor' ? 'donor' : 'requestor';
      router.push(`/auth/signup?invite=${encodeURIComponent(inviteCode)}&role=${encodeURIComponent(role)}`);
    } catch (e: any) {
      setInviteError(e?.message || 'Invalid invite code');
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] font-sans selection:bg-[rgba(255,43,214,0.25)] selection:text-[var(--text-primary)]">

      {/* HEADER */}
      <header className="p-6 md:px-12 md:py-8 flex justify-between items-end max-w-7xl mx-auto w-full z-10 relative border-b border-transparent">
        <div className="flex flex-col items-center">
          <div className="mb-2">
            <AronLogo imgClassName="aron-logo aron-logo-animated-soft h-[53px] w-auto object-contain" />
          </div>
          <span className="text-[10px] font-medium tracking-[0.25em] text-[var(--text-secondary)] uppercase text-center">
            Channel Your Legacy
          </span>
        </div>

        <Link href="/auth/login">
          <Button
            variant="ghost"
            className="text-sm font-semibold px-6 rounded-sm text-[var(--text-primary)]
              bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]
              border border-[rgba(255,255,255,0.14)]
              shadow-[0_18px_60px_-40px_rgba(0,0,0,0.75)]
              hover:bg-[linear-gradient(180deg,rgba(255,43,214,0.12),rgba(255,255,255,0.02))]
              hover:border-[rgba(255,43,214,0.45)]
              hover:shadow-[0_22px_70px_-42px_rgba(255,43,214,0.35)]
              active:translate-y-[1px]
              focus-visible:shadow-[0_0_0_3px_rgba(255,43,214,0.22),0_18px_60px_-40px_rgba(0,0,0,0.75)]
              transition-[background,border-color,box-shadow,transform] duration-300"
          >
            Member Login
          </Button>
        </Link>
      </header>

      <main className="flex-1">
        {/* 1) HERO SECTION */}
        <section className="relative overflow-hidden min-h-screen flex items-center">
          <RotatingVideoBackground className="pointer-events-none" />
          <div className="relative w-full px-6 py-24 md:py-32 max-w-5xl mx-auto text-center z-10">
            <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-8">
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-[1.1] text-[var(--text-primary)]">
              A Private Foundation.<br />
              <span className="text-[var(--text-secondary)] italic">Without the Headcount.</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed font-light">
              Aron is the invite-only operating system for high-conviction donors. Define your legacy, see your impact forecast, and deploy capital with governance—without building a team.
            </motion.p>

            <motion.div variants={fadeInUp} className="text-[var(--color-gold)] font-medium text-lg italic font-serif">
              Define your legacy → we turn it into a governed portfolio.
            </motion.div>

            {/* Invite Gate */}
            <motion.div variants={fadeInUp} className="max-w-md mx-auto pt-8">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-widest text-[var(--text-secondary)] uppercase text-left pl-1">
                  Invite Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] px-4 py-3 text-lg outline-none focus:border-[rgba(255,43,214,0.65)] focus:ring-1 focus:ring-[rgba(255,43,214,0.55)] transition-all rounded-sm placeholder:text-[var(--text-tertiary)]"
                  />
                  <Button
                    variant="primary"
                    className="px-8 rounded-sm font-semibold
                      bg-[linear-gradient(135deg,rgba(255,43,214,0.95)_0%,rgba(192,22,255,0.88)_45%,rgba(212,175,55,0.85)_100%)]
                      shadow-[0_20px_70px_-45px_rgba(255,43,214,0.70)]
                      hover:shadow-[0_26px_80px_-45px_rgba(255,43,214,0.85)]
                      hover:brightness-110
                      active:translate-y-[1px]
                      focus-visible:shadow-[0_0_0_3px_rgba(255,43,214,0.22),0_20px_70px_-45px_rgba(255,43,214,0.70)]
                      transition-[box-shadow,filter,transform] duration-300"
                    onClick={handleInviteContinue}
                    isLoading={inviteLoading}
                  >
                    Continue
                  </Button>
                </div>
                {inviteError ? (
                  <div className="text-xs text-red-400 mt-1 text-left pl-1">{inviteError}</div>
                ) : null}
                <div className="flex justify-between items-center mt-2 px-1">
                  <span className="text-xs text-[var(--text-secondary)] italic">Access is limited.</span>
                  <Link href="#" className="text-xs font-medium text-[var(--text-secondary)] underline decoration-[var(--color-gold)] underline-offset-4 hover:text-[var(--text-primary)]">
                    Request an invitation
                  </Link>
                </div>
              </div>
            </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 2) THE LEVERAGE ENGINE (Signature Feature - Moved Up) */}
        <section className="px-6 py-24 overflow-hidden relative bg-[radial-gradient(900px_500px_at_20%_0%,rgba(255,43,214,0.18),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
          {/* Removed oversized background icon behind the demo card (kept section clean). */}

          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-20 items-center relative z-10">
            <div className="flex-1 space-y-8">
              <span className="text-[var(--color-gold)] font-bold tracking-[0.2em] text-xs uppercase border border-[var(--color-gold)] px-3 py-1 rounded-full">The Leverage Engine</span>
              <h2 className="text-5xl md:text-6xl font-serif leading-tight">One tap — and your pledge becomes a catalyst.</h2>
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-xl">
                Most needs are bigger than any single donor. Aron turns partial intent into full outcomes by structuring challenge grants, matching aligned donors, and triggering campaigns with clear terms.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {[
                  "Challenge terms generated instantly",
                  "Aligned donor grouping to close the gap",
                  "Automatic tracking until conditions are met",
                  "Release rules you control"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-[var(--color-gold)] mt-1 shrink-0" />
                    <span className="text-[var(--text-secondary)] text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-[rgba(255,255,255,0.10)] mt-8">
                <p className="text-[var(--color-gold)] italic font-serif text-xl border-l-2 border-[var(--color-gold)] pl-6">
                  "This isn’t crowdfunding. It’s catalytic capital—private, structured, outcome-driven."
                </p>
              </div>
            </div>

            {/* Visual Abstract for Leverage */}
            <div className="flex-1 flex justify-center w-full">
              <div className="backdrop-blur-sm border border-white/10 p-8 rounded-2xl w-full max-w-sm relative bg-[rgba(255,255,255,0.03)] shadow-[0_25px_80px_-55px_rgba(0,0,0,0.9)]">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-[var(--color-gold)] rounded-full blur-[80px] opacity-45"></div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center text-sm text-[var(--text-tertiary)] uppercase tracking-wider font-medium">
                    <span>Leverage Offer</span>
                    <span className="text-[var(--color-gold)]">Draft</span>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded border border-white/10">
                      <div className="text-xs text-[var(--text-tertiary)] uppercase mb-1">Anchor Pledge</div>
                      <div className="text-2xl font-serif text-[var(--text-primary)]">$250,000</div>
                    </div>
                    <div className="flex justify-center -my-2 relative z-10">
                      <div className="bg-[rgba(255,255,255,0.06)] rounded-full p-1 border border-white/10">
                        <ChevronRight className="rotate-90 text-[var(--color-gold)]" size={16} />
                      </div>
                    </div>
                    <div className="bg-[var(--color-gold)]/10 p-4 rounded border border-[var(--color-gold)]/30">
                      <div className="text-xs text-[var(--color-gold)] uppercase mb-1">Challenge Goal</div>
                      <div className="text-2xl font-serif text-[var(--color-gold)]">$500,000</div>
                      <div className="text-xs text-[var(--color-gold)]/70 mt-1">Must be raised by Oct 30</div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full font-bold rounded-lg
                      bg-[linear-gradient(135deg,rgba(255,43,214,0.92)_0%,rgba(192,22,255,0.80)_45%,rgba(212,175,55,0.70)_100%)]
                      border border-[rgba(255,255,255,0.14)]
                      shadow-[0_22px_75px_-55px_rgba(255,43,214,0.85)]
                      hover:shadow-[0_30px_90px_-55px_rgba(255,43,214,0.95)]
                      hover:brightness-110
                      active:translate-y-[1px]
                      focus-visible:shadow-[0_0_0_3px_rgba(255,43,214,0.22),0_22px_75px_-55px_rgba(255,43,214,0.85)]
                      transition-[box-shadow,filter,transform] duration-300"
                  >
                    Create Catalytic Offer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3) FOUNDATION OS CARDS */}
        <section className="px-6 py-24 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Foundation OS</h2>
            <p className="text-xl text-[var(--text-secondary)]">Operate like a staffed foundation—without hiring one.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-paper)] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(255,43,214,0.35)] hover:bg-[linear-gradient(180deg,rgba(255,43,214,0.06)_0%,rgba(255,255,255,0.02)_100%)] hover:shadow-[0_26px_70px_-40px_rgba(255,43,214,0.40)]"
            >
              <div className="w-12 h-12 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mb-6 text-[var(--color-sage)] group-hover:bg-[var(--color-sage)] group-hover:text-white transition-colors">
                <Layers size={24} />
              </div>
              <h3 className="font-bold text-lg mb-3 uppercase tracking-wide">End-to-End Ops</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Aron runs intake, diligence, agreements, disbursement coordination, reporting, and tax packs end to end.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-paper)] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(255,43,214,0.35)] hover:bg-[linear-gradient(180deg,rgba(255,43,214,0.06)_0%,rgba(255,255,255,0.02)_100%)] hover:shadow-[0_26px_70px_-40px_rgba(255,43,214,0.40)]"
            >
              <div className="w-12 h-12 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mb-6 text-[var(--color-sage)] group-hover:bg-[var(--color-sage)] group-hover:text-white transition-colors">
                <Filter size={24} />
              </div>
              <h3 className="font-bold text-lg mb-3 uppercase tracking-wide">Signal, not noise</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Your giving becomes a pipeline. We filter the chaos into a curated flow aligned to your priorities.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-paper)] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(255,43,214,0.35)] hover:bg-[linear-gradient(180deg,rgba(255,43,214,0.06)_0%,rgba(255,255,255,0.02)_100%)] hover:shadow-[0_26px_70px_-40px_rgba(255,43,214,0.40)]"
            >
              <div className="w-12 h-12 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mb-6 text-[var(--color-sage)] group-hover:bg-[var(--color-sage)] group-hover:text-white transition-colors">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-lg mb-3 uppercase tracking-wide">Governance, enforced</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Define what “proof” means—KPIs, evidence, cadence—and Aron quietly enforces it. Discreet by invitation. Rigorous by default.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 4) HOW IT WORKS - INTELLIGENT SPINE */}
        <section id="how-it-works" className="py-24 bg-[var(--bg-surface)] border-y border-[var(--border-subtle)]">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif">The Aron Flow</h2>
            <p className="text-[var(--text-secondary)] mt-2">From intent to outcome in 10 steps</p>
          </div>
          <IntelligentSpine />
        </section>


        {/* 5) EXCLUSIVITY / PRIVATE BY INVITATION */}
        <section className="bg-[var(--bg-paper)] px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-serif mb-8">Private by Invitation.</h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-16 leading-relaxed">
              Aron is built for donors who value discretion, governance, and real outcomes. Membership is intentionally limited to protect privacy, maintain trust, and keep the network high-signal.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-16 border-t border-b border-[var(--border-subtle)] py-12">
              <div className="text-center px-4">
                <div className="font-bold text-[var(--text-primary)] mb-2 uppercase tracking-wider text-sm">Discreet Network</div>
                <div className="text-lg font-serif italic text-[var(--text-secondary)]">Privacy-first by default</div>
              </div>
              <div className="text-center px-4 md:border-l md:border-r border-[var(--border-subtle)]">
                <div className="font-bold text-[var(--text-primary)] mb-2 uppercase tracking-wider text-sm">Verified Flow</div>
                <div className="text-lg font-serif italic text-[var(--text-secondary)]">Structured requests, not spam</div>
              </div>
              <div className="text-center px-4">
                <div className="font-bold text-[var(--text-primary)] mb-2 uppercase tracking-wider text-sm">Aligned Capital</div>
                <div className="text-lg font-serif italic text-[var(--text-secondary)]">Curated leverage</div>
              </div>
            </div>

            <div className="max-w-md mx-auto bg-[rgba(255,255,255,0.03)] p-2 rounded-sm border border-[rgba(255,255,255,0.10)] flex gap-2 shadow-[0_18px_60px_-45px_rgba(0,0,0,0.9)]">
              <input
                type="text"
                placeholder="Invite Code"
                className="flex-1 bg-transparent px-4 py-3 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              />
              <Button variant="primary" className="px-8">
                Continue
              </Button>
            </div>
            <div className="text-center mt-6">
              <Link href="#" className="text-sm font-medium text-[var(--color-gold)] hover:text-[var(--text-primary)] transition-colors">Request an invitation</Link>
            </div>
          </div>
        </section>

        {/* 6) FEATURES GRID */}
        <section className="px-6 py-24 max-w-6xl mx-auto">
          <div className="md:flex gap-16 items-start">
            <div className="md:w-1/3 mb-10 md:mb-0">
              <h2 className="text-4xl font-serif leading-tight mb-6">Everything You’d Build… If You Had Time.</h2>
              <div className="w-16 h-1 bg-[var(--color-gold)] mb-6" />
            </div>
            <div className="md:w-2/3 grid sm:grid-cols-2 gap-y-12 gap-x-12">
              {[
                { title: "Your giving vault", desc: "Agreements, receipts, tax packs, diligence, reports." },
                { title: "Governance controls", desc: "Requirements, cadence, verification, audit trail." },
                { title: "Impact dashboard", desc: "Goals, KPIs, progress, outcomes—portfolio-wide." },
                { title: "Concierge-grade execution", desc: "Quiet, consistent operations." },
                { title: "Leverage engine", desc: "Challenge grants + aligned donor groups + conditional release." }
              ].map((feat, i) => (
                <div key={i}>
                  <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[var(--text-primary)] rounded-full" />
                    {feat.title}
                  </h4>
                  <p className="text-[var(--text-secondary)] pl-3.5 border-l border-[var(--border-subtle)]">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7) DISCRETION */}
        <section className="px-6 py-32 relative overflow-hidden bg-[radial-gradient(900px_500px_at_70%_0%,rgba(255,43,214,0.16),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-25" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <Lock className="mx-auto mb-8 text-[var(--color-gold)]" size={40} />
            <h2 className="text-4xl md:text-5xl font-serif mb-8">Discretion Is a Feature.</h2>
            <p className="text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
              Sensitive details stay private. Every action is logged. Every grant is traceable. Every report is verifiable.
            </p>
            <div className="flex flex-wrap justify-center gap-12 text-sm font-bold tracking-widest uppercase text-[var(--color-gold)]">
              <span>Privacy-first defaults</span>
              <span>Audit-ready records</span>
              <span>Controlled visibility</span>
            </div>
          </div>
        </section>

        {/* 8) FINAL CTA */}
        <section className="px-6 py-40 text-center bg-[var(--bg-app)] relative">
          <h2 className="text-5xl md:text-7xl font-serif mb-12 text-[var(--text-primary)] tracking-tight">If You’re Invited,<br />You’ll Know.</h2>

          <div className="max-w-sm mx-auto mb-8">
            <div className="flex gap-2 p-1 border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.03)] rounded-sm shadow-[0_18px_60px_-45px_rgba(0,0,0,0.9)] hover:shadow-[0_22px_80px_-55px_rgba(0,0,0,0.9)] transition-shadow">
              <input
                type="text"
                placeholder="Enter Invite Code"
                className="flex-1 bg-transparent px-4 py-3 outline-none text-lg text-center font-medium placeholder:text-[var(--text-tertiary)]"
              />
              <Button variant="primary" className="px-8 rounded-sm font-medium">
                Continue
              </Button>
            </div>
          </div>

          <p className="text-[var(--text-secondary)] mb-16">
            Or <a href="#" className="text-[var(--text-primary)] font-medium underline decoration-[var(--color-gold)] underline-offset-4">request an invitation</a>. Our concierge reviews referrals discreetly.
          </p>

          <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.25em] max-w-lg mx-auto leading-loose">
            Aron is not a marketplace. It’s a private system for compounding good.
          </div>

          <div className="mt-24 pt-12 border-t border-[var(--border-subtle)] max-w-xs mx-auto">
            <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">Grant Seekers</div>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              For demo purposes: Login to the Grant Inquiry Portal to submit a request.
            </p>
            <Link href="/requester">
              <Button variant="outline" size="sm" className="w-full border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-white transition-colors">
                Access Requester Portal <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
