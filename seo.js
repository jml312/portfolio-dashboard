const SEO = {
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: "https://www.dashboard.joshlevy.io",
    title: "dashboard – joshlevy.io",
    description: "A dashboard for Josh Levy's personal website, joshlevy.io",
    tags: [
      "Dashboard",
      "Analytics",
      "Portfolio",
      "Fullstack",
      "Developer",
      "Software Engineer",
      "Next.js",
      "React",
    ],
    site_name: "dashboard.joshlevy.io",
  },
  title: "dashboard – joshlevy.io",
  description: "A dashboard for Josh Levy's personal website, joshlevy.io",
  canonical: "https://www.dashboard.joshlevy.io",
  twitter: {
    handle: "@handle",
    site: "@site",
    cardType: "summary_large_image",
  },
  additionalLinkTags: [
    {
      rel: "icon",
      href: "/logo/favicon.ico",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/logo/apple-touch-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/logo/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/logo/favicon-16x16.png",
    },
    {
      rel: "mask-icon",
      href: "/logo/safari-pinned-tab.svg",
      color: "#1C1D25",
    },
  ],
  additionalMetaTags: [
    {
      name: "theme-color",
      media: "(prefers-color-scheme: dark)",
      content: "#FFFFF5",
    },
    {
      name: "theme-color",
      media: "(prefers-color-scheme: light)",
      content: "#1C1D25",
    },
  ],
};

export default SEO;
