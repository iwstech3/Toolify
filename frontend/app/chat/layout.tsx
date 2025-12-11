import { Providers } from "@/components/Providers";

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Providers>
            {children}
        </Providers>
    );
}
