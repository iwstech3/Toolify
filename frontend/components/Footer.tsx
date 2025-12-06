import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-surface border-t border-dark-border py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Brand */}
          <div className="text-text-secondary text-sm">
            By using Toolify, an AI tool, you agree to our{" "}
            <Link
              href="/terms"
              className="text-orange-primary hover:text-orange-hover"
            >
              Terms
            </Link>{" "}
            and have read our{" "}
            <Link
              href="/privacy"
              className="text-orange-primary hover:text-orange-hover"
            >
              Privacy Policy
            </Link>
            .
          </div>

          {/* Copyright */}
          <div className="text-text-secondary text-sm">
            © {currentYear} Toolify. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
