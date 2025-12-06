"use client";

import { SignUpButton, useUser } from "@clerk/nextjs";

export default function Hero() {
  const { isSignedIn } = useUser();

  const actionButtons = [
    {
      icon: "IMAGE",
      label: "Upload Image",
      color: "bg-dark-surface hover:bg-dark-elevated",
    },
    {
      icon: "SEARCH",
      label: "Search",
      color: "bg-dark-surface hover:bg-dark-elevated",
    },
    {
      icon: "BOOK",
      label: "Manual",
      color: "bg-dark-surface hover:bg-dark-elevated",
    },
    {
      icon: "MIC",
      label: "Voice",
      color: "bg-dark-surface hover:bg-dark-elevated",
    },
  ];

  const handleActionClick = (label: string) => {
    if (isSignedIn) {
      // Handle authenticated action (will be implemented later)
      console.log(`Authenticated user clicked: ${label}`);
    }
  };

  const renderIcon = (icon: string) => {
    const iconClasses = "w-6 h-6";
    switch (icon) {
      case "IMAGE":
        return (
          <svg
            className={iconClasses}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "SEARCH":
        return (
          <svg
            className={iconClasses}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        );
      case "BOOK":
        return (
          <svg
            className={iconClasses}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
      case "MIC":
        return (
          <svg
            className={iconClasses}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const ActionButton = ({ button }: { button: (typeof actionButtons)[0] }) => {
    if (!isSignedIn) {
      return (
        <SignUpButton mode="modal">
          <button
            className={`${button.color} text-white px-5 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 border border-dark-border hover:border-orange-primary group`}
          >
            <span className="group-hover:scale-110 transition-transform duration-200">
              {renderIcon(button.icon)}
            </span>
            <span className="font-medium">{button.label}</span>
          </button>
        </SignUpButton>
      );
    }

    return (
      <button
        onClick={() => handleActionClick(button.label)}
        className={`${button.color} text-white px-5 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 border border-dark-border hover:border-orange-primary group`}
      >
        <span className="group-hover:scale-110 transition-transform duration-200">
          {renderIcon(button.icon)}
        </span>
        <span className="font-medium">{button.label}</span>
      </button>
    );
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
          Where should we begin?
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-2xl mx-auto">
          Discover any tool instantly with AI-powered recognition and get
          comprehensive guides in seconds
        </p>

        {/* Search/Action Interface */}
        <div className="bg-dark-surface rounded-2xl p-6 md:p-8 shadow-2xl border border-dark-border">
          {/* Input Area */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Ask anything about tools or upload an image..."
              className="w-full px-6 py-4 bg-dark-elevated text-white rounded-lg border border-dark-border focus:border-orange-primary focus:outline-none focus:ring-2 focus:ring-orange-primary/50 transition-all duration-200 text-lg"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {actionButtons.map((button) => (
              <ActionButton key={button.label} button={button} />
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-3">
              <svg
                className="w-12 h-12 mx-auto text-orange-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              AI-Powered
            </h3>
            <p className="text-text-secondary text-sm">
              Advanced vision recognition identifies any tool instantly
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">
              <svg
                className="w-12 h-12 mx-auto text-orange-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Comprehensive Guides
            </h3>
            <p className="text-text-secondary text-sm">
              Get manuals, safety guides, and tutorials
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">
              <svg
                className="w-12 h-12 mx-auto text-orange-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Multilingual
            </h3>
            <p className="text-text-secondary text-sm">
              Support for English, French, and more
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
