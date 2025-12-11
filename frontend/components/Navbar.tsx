"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg group-hover:shadow-primary/25 transition-all duration-300 group-hover:scale-110">
              <svg
                className="w-5 h-5 text-primary-foreground transition-transform duration-300 group-hover:rotate-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                />
              </svg>
              <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="font-display font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-300">
              Toolify
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How It Works" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-full transition-all duration-300 group-hover:w-3/4" />
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <SignedOut>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-transparent relative overflow-hidden group"
                asChild
              >
                <Link href="/sign-in">
                  <span className="relative z-10">Sign In</span>
                  <span className="absolute inset-0 bg-muted/30 scale-0 group-hover:scale-100 rounded-lg transition-transform duration-300" />
                </Link>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="relative overflow-hidden group shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/sign-up">
                  <Sparkles className="w-4 h-4 mr-1.5 transition-transform duration-300 group-hover:rotate-12" />
                  <span>Sign Up</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
