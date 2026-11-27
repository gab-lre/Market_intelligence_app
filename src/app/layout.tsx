import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import TopHeader from "@/components/TopHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SaaS Market Intelligence",
  description: "Dénichez des opportunités B2B réelles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-[#F4F6F8] text-[#1A1C1E] h-screen w-screen overflow-hidden antialiased selection:bg-[#E6F4EA]`}>
        {/* Full container padding for floating effect */}
        <div className="flex h-full w-full p-4 lg:p-6 gap-2">
          <Navigation />
          <main className="flex-1 flex flex-col h-full min-w-0">
            <TopHeader />
            <div className="flex-1 overflow-y-auto plugin-noscrollbar flex flex-col">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
