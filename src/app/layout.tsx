import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VoltBio — Open Source Link in Bio Builder",
  description:
    "Create a beautiful, customizable link-in-bio page for free. Open source, no paywall, deploy anywhere.",
  keywords: [
    "link in bio",
    "linktree alternative",
    "open source",
    "link page builder",
  ],
  openGraph: {
    title: "VoltBio — Open Source Link in Bio Builder",
    description:
      "Create a beautiful, customizable link-in-bio page for free.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Content Security Policy — static export can't use headers(), so we use meta */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self';"
        />
        {/* Prevent FOUC: apply theme mode before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('voltbio-store');if(s){var p=JSON.parse(s);var m=p.state&&p.state.config&&p.state.config.theme&&p.state.config.theme.mode;if(m==='dark')document.documentElement.setAttribute('data-theme','dark');else if(m==='light')document.documentElement.setAttribute('data-theme','light');else if(m==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches)document.documentElement.setAttribute('data-theme','dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
