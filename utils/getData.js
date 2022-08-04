import client from "lib/sanity";
import { submissionsQuery, analyticsQuery } from "lib/queries";

const getKeyCounts = (arr, key, byIp) =>
  arr
    .reduce((acc, curr) => {
      if (byIp) {
        if (!acc.some((_acc) => _acc.ip === curr.ip)) {
          const foundEl = acc.find((_acc) => _acc[key] === curr[key]);
          if (!foundEl) {
            acc.push({
              [key]: curr[key],
              visitors: 1,
              ip: curr.ip,
            });
          } else {
            foundEl.visitors++;
          }
        }
      } else {
        if (
          acc.some(
            (_acc) => _acc[key] === curr[key] && !_acc.ips.includes(curr.ip)
          )
        ) {
          const foundEl = acc.find((_acc) => _acc[key] === curr[key]);
          foundEl.ips.push(curr.ip);
          foundEl.visitors++;
        } else {
          acc.push({
            [key]: curr[key],
            visitors: 1,
            ips: [curr.ip],
          });
        }
      }
      return acc;
    }, [])
    .reduce((acc, curr) => {
      if (byIp || !acc.some((_acc) => _acc[key] === curr[key])) {
        acc.push({
          [key]: curr[key],
          visitors: curr.visitors,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.visitors - a.visitors);

const getAnalyticsData = (analytics) => {
  // pages
  const topPages = analytics
    .map(({ slug: pageSlug, visitors }) => {
      let slug;
      if (pageSlug === "home") slug = "/";
      else slug = `/blog${pageSlug === "blog" ? "" : `/${pageSlug}`}`;
      return {
        slug,
        visitors: visitors.length,
      };
    })
    .sort((a, b) => b.visitors - a.visitors);
  // referrers
  const topReferrers = getKeyCounts(
    analytics.flatMap(({ visitors }) =>
      visitors.flatMap(({ ip, viewings }) =>
        viewings.map(({ referrer }) => ({ ip, referrer }))
      )
    ),
    "referrer",
    false
  );
  // locations
  const topCountries = getKeyCounts(
    analytics.flatMap(({ visitors }) =>
      visitors.flatMap(({ ip, viewings }) =>
        viewings.map(({ locationLong, flag }) => ({
          ip,
          country: `${locationLong.split(", ")[2]} ${flag}`,
        }))
      )
    ),
    "country",
    false
  );
  const topRegions = getKeyCounts(
    analytics.flatMap(({ visitors }) =>
      visitors.flatMap(({ ip, viewings }) =>
        viewings.map(({ locationLong, flag }) => ({
          ip,
          region: `${locationLong.split(", ")[1]} ${flag}`,
        }))
      )
    ),
    "region",
    false
  );
  const topCities = getKeyCounts(
    analytics.flatMap(({ visitors }) =>
      visitors.flatMap(({ ip, viewings }) =>
        viewings.map(({ locationLong, flag }) => ({
          ip,
          city: `${locationLong.split(", ")[0]} ${flag}`,
        }))
      )
    ),
    "city",
    false
  );
  // devices
  const topDevices = getKeyCounts(
    analytics.flatMap(({ visitors }) =>
      visitors.map(({ ip, device }) => ({ ip, device }))
    ),
    "device",
    true
  );
  const topBrowsers = getKeyCounts(
    analytics.flatMap(({ visitors }) =>
      visitors.map(({ ip, browser }) => ({ ip, browser }))
    ),
    "browser",
    true
  );
  const topOS = getKeyCounts(
    analytics.flatMap(({ visitors }) =>
      visitors.map(({ ip, os }) => ({ ip, os }))
    ),
    "os",
    true
  );
  // locations
  const locations = analytics
    .flatMap(({ visitors }) =>
      visitors.flatMap(({ ip, viewings }) =>
        viewings.map(({ locationShort, flag, latLong }) => ({
          ip,
          location: `${locationShort} ${flag}`,
          latLong,
        }))
      )
    )
    .reduce((acc, curr) => {
      if (
        acc.some(
          (_acc) =>
            _acc.location === curr.location && !_acc.ips.includes(curr.ip)
        )
      ) {
        const foundEl = acc.find((_acc) => _acc.location === curr.location);
        foundEl.ips.push(curr.ip);
        foundEl.visitors++;
      } else {
        acc.push({
          location: curr.location,
          latLong: curr.latLong,
          visitors: 1,
          ips: [curr.ip],
        });
      }
      return acc;
    }, [])
    .reduce((acc, curr) => {
      if (!acc.some((_acc) => _acc.location === curr.location)) {
        acc.push({
          location: curr.location,
          latLong: curr.latLong,
          visitors: curr.visitors,
        });
      }
      return acc;
    }, []);

  return {
    all: analytics,
    locations,
    topPages,
    topReferrers,
    topCountries,
    topRegions,
    topCities,
    topDevices,
    topBrowsers,
    topOS,
  };
};

const getServices = (isLoggedIn = true) => {
  const unAuthenticatedData = {
    rateLimit: "-",
    pricing: "-",
    expiresOn: "-",
  };
  const formatAuthenticatedData = (data) => {
    const [rateLimit, pricing, expiresOn, link] = data;
    return data.reduce(
      () => ({
        rateLimit: rateLimit === "null" ? "-" : rateLimit,
        pricing,
        expiresOn: expiresOn === "null" ? "-" : expiresOn,
        link,
      }),
      {}
    );
  };
  const data = isLoggedIn
    ? [
        {
          name: "Easy Cron",
          service: "Cron Job",
          ...formatAuthenticatedData(process.env.EASY_CRON.split(",")),
        },
        {
          name: "GoDaddy",
          service: "Domain",
          ...formatAuthenticatedData(process.env.GODADDY.split(",")),
        },
        {
          name: "ipapi",
          service: "IP Lookup",
          ...formatAuthenticatedData(process.env.IPAPI.split(",")),
        },
        {
          name: "Sanity",
          service: "DB/CMS",
          ...formatAuthenticatedData(process.env.SANITY.split(",")),
        },
        {
          name: "EmailJS",
          service: "Email",
          ...formatAuthenticatedData(process.env.EMAILJS.split(",")),
        },
        {
          name: "Stripe",
          service: "Payment",
          ...formatAuthenticatedData(process.env.STRIPE.split(",")),
        },
        {
          name: "hCaptcha",
          service: "Anti-Spam",
          ...formatAuthenticatedData(process.env.HCAPTCHA.split(",")),
        },
      ]
    : [
        {
          ...unAuthenticatedData,
          name: "Easy Cron",
          service: "Cron Job",
          expiresOn: null,
          link: "https://www.easycron.com/user",
        },
        {
          ...unAuthenticatedData,
          name: "GoDaddy",
          service: "Domain",
          expiresOn: null,
          link: "https://dashboard.godaddy.com/venture",
        },
        {
          name: "ipapi",
          service: "IP Lookup",
          link: "https://ipapi.co",
          ...unAuthenticatedData,
        },
        {
          name: "Sanity",
          service: "DB/CMS",
          link: "https://www.sanity.io/manage",
          ...unAuthenticatedData,
        },
        {
          name: "EmailJS",
          service: "Email",
          link: "https://dashboard.emailjs.com/admin",
          ...unAuthenticatedData,
        },
        {
          name: "Stripe",
          service: "Payment",
          link: "https://dashboard.stripe.com/dashboard",
          ...unAuthenticatedData,
        },
        {
          name: "hCaptcha",
          service: "Anti-Spam",
          link: "https://dashboard.hcaptcha.com/overview",
          ...unAuthenticatedData,
        },
      ];
  return data.sort((a, b) => {
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
