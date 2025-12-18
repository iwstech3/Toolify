"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sparkles, Wrench, Menu, X } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-lg"
          : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg group-hover:shadow-primary/25 transition-all duration-300 group-hover:scale-110">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground transition-transform duration-300 group-hover:rotate-12" />
              <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="font-display font-bold text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors duration-300">
              Toolify
            </span>
          </Link>

          {/* Desktop Navigation Links */}
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

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <SignedOut>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-transparent relative overflow-hidden group text-xs sm:text-sm"
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
                className="relative overflow-hidden group shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                asChild
              >
                <Link href="/sign-up">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 transition-transform duration-300 group-hover:rotate-12" />
                  <span>Sign Up</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 sm:w-10 sm:h-10",
                  },
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 sm:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div className="fixed top-14 left-0 right-0 bg-card border-b border-border shadow-2xl z-50 sm:hidden animate-in slide-in-from-top-2 duration-300">
            <div className="container mx-auto px-4 py-6 space-y-4">
              {/* Navigation Links */}
              <div className="space-y-2">
                {[
                  { href: "#features", label: "Features" },
                  { href: "#how-it-works", label: "How It Works" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-border space-y-3">
                <SignedOut>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full shadow-lg shadow-primary/20"
                    asChild
                  >
                    <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Sign Up
                    </Link>
                  </Button>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center justify-center py-2">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-12 h-12",
                        },
                      }}
                    />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
