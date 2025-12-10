import Link from "next/link";
import {
    Plus,
    Search,
    Wrench,
    Settings,
    MessageSquare,
    type LucideIcon
} from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";

interface NavItem {
    icon: LucideIcon;
    label: string;
    href: string;
    active?: boolean;
}

const navItems: NavItem[] = [
    { icon: Search, label: "Search", href: "#" },
    { icon: MessageSquare, label: "Chats", href: "#", active: true },
];

export function Sidebar() {
    return (
        <aside className="w-20 hover:w-64 border-r border-border bg-card flex flex-col items-center py-6 h-screen select-none z-20 transition-all duration-300 group overflow-hidden">
            {/* Logo Area */}
            <div className="mb-8 w-full flex justify-center group-hover:justify-start group-hover:px-6 transition-all">
                <div className="w-10 h-10 min-w-[2.5rem] rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-sm ring-1 ring-orange-500/20">
                    <Wrench className="w-6 h-6" />
                </div>
                <span className="ml-3 font-bold text-xl text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap flex items-center">
                    Toolify
                </span>
            </div>

            {/* New Chat Action */}
            <div className="w-full px-4 mb-8">
                <button className="w-full flex items-center justify-center group-hover:justify-start p-3 rounded-xl bg-muted hover:bg-muted/80 transition-all group/btn">
                    <Plus className="w-6 h-6 min-w-[1.5rem] text-foreground group-hover/btn:scale-110 transition-transform" />
                    <span className="ml-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                        New Chat
                    </span>
                </button>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 flex flex-col gap-2 w-full px-4">
                {navItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className={`flex items-center p-3 rounded-xl transition-all relative
              ${item.active
                                ? "text-primary bg-primary/10"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                    >
                        <item.icon className="w-6 h-6 min-w-[1.5rem]" />
                        <span className="ml-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden delay-100">
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-2 items-center w-full px-4">
                <div className="flex items-center justify-center group-hover:justify-start w-full">
                    <ThemeToggle />
                </div>
                <button className="flex items-center justify-center group-hover:justify-start w-full p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Settings className="w-6 h-6 min-w-[1.5rem]" />
                    <span className="ml-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                        Settings
                    </span>
                </button>

                {/* User Avatar Placeholder */}
                <div className="mt-2 w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-background ring-2 ring-border" />
            </div>
        </aside>
    );
}
