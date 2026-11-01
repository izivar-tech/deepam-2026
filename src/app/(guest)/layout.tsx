import { EventLoader } from "@/components/guest/EventLoader";
import { LanguageProvider } from "@/contexts/language-context";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <LanguageProvider>
        <EventLoader>{children}</EventLoader>
      </LanguageProvider>
    </div>
  );
}
