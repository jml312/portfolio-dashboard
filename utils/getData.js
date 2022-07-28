import client from "lib/sanity";
import { submissionsQuery, analyticsQuery } from "lib/queries";
import getUnicodeFlagIcon from "country-flag-icons/unicode";

const getKeyCounts = ({ arr, key, isLocation }) =>
  arr
    .map((analytic) =>
      analytic.visitors.map((visitor) => {
        return {
          item: visitor[key],
          icon: isLocation ? getUnicodeFlagIcon(visitor.countryCode) : null,
        };
      })
    )
    .reduce((acc, curr) => {
      curr.forEach(({ item, icon }) => {
        if (acc.some((_acc) => _acc[key] === item)) {
          acc.find((_acc) => _acc[key] === item).visitors++;
        } else {
          acc.push({
            [key]: item,
            visitors: 1,
            icon,
          });
        }
      });
      return acc;
    }, [])
    .sort((a, b) => b.visitors - a.visitors);

const getAnalyticsData = (analytics) => {
  // pages
  const topPages = analytics
    .sort((a, b) => b.visitors.length - a.visitors.length)
    .map((analytic) => {
      let slug;
      if (analytic.slug === "home") slug = "/";
      else slug = `/blog${analytic.slug === "blog" ? "" : `/${analytic.slug}`}`;
      return {
        slug,
        visitors: analytic.visitors.length,
      };
    });
  // referrers
  const topReferrers = getKeyCounts({
    arr: analytics,
    key: "referrer",
  });
  // locations
  const topCountries = getKeyCounts({
    arr: analytics,
    key: "countryName",
    isLocation: true,
  });
  const topRegions = getKeyCounts({
    arr: analytics,
    key: "region",
    isLocation: true,
  });
  const topCities = getKeyCounts({
    arr: analytics,
    key: "city",
    isLocation: true,
  });
  // devices
  const topDevices = getKeyCounts({ arr: analytics, key: "device" });
  const topBrowsers = getKeyCounts({ arr: analytics, key: "browser" });
  const topOS = getKeyCounts({ arr: analytics, key: "os" });
  return {
    topPages,
    topReferrers,
    topCountries,
    topRegions,
    topCities,
    topDevices,
    topBrowsers,
    topOS,
    all: analytics,
    locations: analytics
      .map((analytic) => analytic.visitors)
      .reduce((acc, curr) => {
        curr.forEach(({ latLong, city, region, viewDates }) => {
          if (!acc.some((_acc) => _acc.latLong === latLong)) {
            acc.push({
              latLong,
              location: `${city}, ${region}`,
              views: viewDates.length,
            });
          }
        });
        return acc;
      }, []),
  };
};

const getServices = (isLoggedIn = true) => {
  return [
    {
      name: "Easy Cron",
      service: "Cron Job",
      rateLimit: "4k EPD",
      pricing: "$12.77 (1 year)",
      expiresOn: "7/23/2023",
      link: "https://www.easycron.com/user",
    },
    {
      name: "GoDaddy",
      service: "Domain",
      rateLimit: null,
      pricing: "$102.98 (2 years)",
      expiresOn: "9/13/2023",
      link: isLoggedIn
        ? `https://dashboard.godaddy.com/venture?ventureId=${process.env.NEXT_PUBLIC_GODADDY_VENTURE_ID}`
        : "https://dashboard.godaddy.com/venture",
    },
    {
      name: "ipapi",
      service: "IP Lookup",
      rateLimit: "30k/month (1k/day)",
      pricing: "Free",
      expiresOn: null,
      link: "https://ipapi.co",
    },
    {
      name: "Sanity",
      service: "DB/CMS",
      rateLimit: "200k requests",
      pricing: "Free",
      expiresOn: null,
      link: isLoggedIn
        ? `https://www.sanity.io/manage/personal/project/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`
        : "https://www.sanity.io/manage",
    },
    {
      name: "EmailJS",
      service: "Email",
      rateLimit: "200/month",
      pricing: "Free",
      expiresOn: null,
      link: "https://dashboard.emailjs.com/admin",
    },
    {
      name: "Stripe",
      service: "Payment",
      rateLimit: "-",
      pricing: "Free",
      expiresOn: null,
      link: "https://dashboard.stripe.com/dashboard",
    },
    {
      name: "hCaptcha",
      service: "Anti-Spam",
      rateLimit: "-",
      pricing: "Free",
      expiresOn: null,
      link: "https://dashboard.hcaptcha.com/overview",
    },
  ].sort((a, b) => {
    if (!a.expiresOn || !b.expiresOn) return 0;
    return new Date(a.expiresOn) - new Date(b.expiresOn);
  });
};

const getData = async (isLoggedIn) => {
  const [submissions, analytics] = await Promise.all(
    [submissionsQuery, analyticsQuery].map(
      async (query) => await client.fetch(query)
    )
  );
  return {
    submissions: isLoggedIn
      ? submissions
      : submissions.map((submission) => ({
          ...submission,
          name: submission.name.replace(/./g, "*"),
          email: submission.email.replace(/./g, "*"),
          message: submission.message.replace(/./g, "*"),
        })),
    analytics: getAnalyticsData(analytics),
    services: getServices(isLoggedIn),
  };
};

export { getData, getServices };
