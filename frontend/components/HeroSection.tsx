"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient opacity-[0.03]" />

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">
                AI-Powered Recognition
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Identify Any Tool <span className="text-gradient">Instantly</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Snap a photo of any tool and get instant identification,
              comprehensive documentation, safety guides, and user
              manuals—powered by advanced AI.
            </p>

            <div className="flex flex-wrap gap-4">
              <SignedIn>
                <Button variant="hero" size="xl" asChild>
                  <Link href="/chat">Go to Dashboard</Link>
                </Button>
              </SignedIn>
              <SignedOut>
                <Button variant="hero" size="xl" asChild>
                  <Link href="/sign-up">Get Started Free</Link>
                </Button>
                <Button variant="hero-outline" size="xl" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </SignedOut>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-border">
              <div>
                <p className="font-display text-2xl font-bold text-foreground">
                  10K+
                </p>
                <p className="text-sm text-muted-foreground">
                  Tools Identified
                </p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-foreground">
                  3
                </p>
                <p className="text-sm text-muted-foreground">Languages</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-foreground">
                  99%
                </p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="animate-fade-up-delay-2 relative">
            <div className="relative rounded-2xl overflow-hidden card-shadow glow">
              <Image
                src="/tools-hero.jpg"
                alt="Various professional hand tools including hammer, screwdriver, wrenches, and power drill arranged on a workbench"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />

              {/* Floating card */}
              <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 card-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Tool Identified
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Adjustable Wrench - 10 inch
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
