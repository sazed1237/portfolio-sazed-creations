import "../index.css";
import "jodit/es2018/jodit.min.css";
import AppShell from "@/components/AppShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sazedulislam.me';
const SITE_NAME = 'Sazedul Islam';

export const metadata = {
  title: {
    default: `${SITE_NAME} - Backend Software Engineer`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Portfolio website for Sazedul Islam — backend software engineer. APIs, systems design, and production-ready services.',
  keywords: ['backend', 'node.js', 'nestjs', 'typescript', 'software engineer', 'portfolio', 'api', 'cloud'],
  authors: [{ name: SITE_NAME }],
  applicationName: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} - Backend Software Engineer`,
    description: 'Portfolio — backend systems, APIs, and engineering notes by Sazedul Islam.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Portfolio`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Backend Engineer`,
    description: 'Portfolio and blog by Sazedul Islam.',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    other: [],
  },
};

function buildJsonLd() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'url': SITE_URL,
    'name': SITE_NAME,
    'description': metadata.description,
    'publisher': {
      '@type': 'Person',
      'name': SITE_NAME,
    },
  };

  return JSON.stringify(json);
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildJsonLd() }} />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
