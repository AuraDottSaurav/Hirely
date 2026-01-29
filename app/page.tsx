import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { Briefcase, Calendar, CheckCircle2, Search, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GodRays } from "@/components/hero/god-rays";
import { Particles } from "@/components/hero/particles";
import { HeroCTA, PrimaryCTA } from "@/components/hero/hero-cta";
import { PerspectiveGrid } from "@/components/hero/perspective-grid";
import { AutomationVisual } from "@/components/hero/automation-visual";
import { AnimatedBorderCard } from "@/components/ui/animated-border-card";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden selection:bg-primary/20">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b sticky top-0 bg-background/80 backdrop-blur-md z-50 border-white/5 transition-all duration-300">
        <div className="flex items-center justify-center gap-2">
          <div className="h-6 w-6 bg-primary text-primary-foreground rounded-sm flex items-center justify-center shadow-glow">
            <Briefcase className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg tracking-tight">Hirely</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/sign-in">
            Sign In
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative w-full py-12 md:py-16 lg:py-24 px-4 md:px-6 flex flex-col items-center justify-center min-h-[85vh] overflow-hidden">
          {/* Background Elements */}
          <PerspectiveGrid />
          <GodRays />
          <Particles />

          <div className="container mx-auto max-w-4xl flex flex-col items-center text-center space-y-8 relative z-10">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                Recruiting <span className="italic font-serif text-white">Reimagined</span> <br className="hidden sm:block" />
                <span className="text-muted-foreground/50 font-medium text-3xl sm:text-4xl md:text-5xl lg:text-6xl block mt-1">for the modern era.</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed text-balance">
                Stop drowning in spreadsheets. Hirely is the intelligent engine that powers your team's growth,
                turning the chaos of hiring into your competitive advantage.
              </p>
            </div>

            <HeroCTA />

            <div className="w-full relative">
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
              <AutomationVisual />
            </div>
          </div>
        </section>

        {/* STORY SECTION */}
        <section className="w-full py-12 md:py-24 bg-muted/5 border-y border-white/5 relative z-10">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">From Chaos to Clarity</h2>
              <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
                We've all been there. The lost emails, the scheduling conflicts, the gut decisions. Hirely fixes the broken parts of hiring.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Card 1 */}
              <AnimatedBorderCard className="shadow-sm transition-all hover:shadow-glow hover:-translate-y-1">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 group-hover:scale-110 transition-transform">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">The Black Hole</h3>
                <p className="text-muted-foreground mb-4 group-hover:text-foreground/80 transition-colors">
                  "Did I reply to that candidate?" Stop losing great talent in your inbox.
                </p>
                <div className="flex items-center text-sm font-medium text-primary">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Centralized Pipeline
                </div>
              </AnimatedBorderCard>

              {/* Card 2 */}
              <AnimatedBorderCard className="shadow-sm transition-all hover:shadow-glow hover:-translate-y-1">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">The Chase</h3>
                <p className="text-muted-foreground mb-4 group-hover:text-foreground/80 transition-colors">
                  Endless back-and-forth emails just to find a 30-minute slot.
                </p>
                <div className="flex items-center text-sm font-medium text-primary">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  One-click Scheduling
                </div>
              </AnimatedBorderCard>

              {/* Card 3 */}
              <AnimatedBorderCard className="shadow-sm transition-all hover:shadow-glow hover:-translate-y-1">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">The Guesswork</h3>
                <p className="text-muted-foreground mb-4 group-hover:text-foreground/80 transition-colors">
                  Hiring based on "vibes" instead of data? That's expensive.
                </p>
                <div className="flex items-center text-sm font-medium text-primary">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Data-driven Insights
                </div>
              </AnimatedBorderCard>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background/50 border-t border-white/5">
          <div className="container px-4 md:px-6 mx-auto text-center relative">
            <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none" />
            <div className="flex flex-col items-center space-y-4 relative z-10">
              <div className="p-3 bg-primary/10 rounded-full ring-1 ring-primary/20">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to upgrade your team?</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of fast-growing companies using Hirely to find their next superstar.
              </p>
              <div className="mt-8">
                <PrimaryCTA text="Get Started Today" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t border-white/5 mt-auto">
        <p className="text-xs text-muted-foreground">© 2026 Hirely. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
