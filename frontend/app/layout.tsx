import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "ClauseLens — Semantic Change Adjudication",
  description: "Trustless semantic change adjudication for public web terms and API contracts, verified by GenLayer validators.",
  manifest: `${basePath}/site.webmanifest`,
  icons: {
    icon: [
      { url: `${basePath}/favicon.svg`, type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#111b18",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
