import client from "lib/sanity";
import { getServices } from "utils/getData";
import { unreadSubmissionsQuery, analyticsQuery } from "lib/queries";
import { differenceInWeeks, format } from "date-fns";
import axios from "axios";
import {
  formatDateCounts,
  formatTimeCounts,
  getTimeRangeData,
  formatTime,
} from "utils/formatAnalytics";
import abbreviate from "number-abbreviate";

const getUniqueVisitors = ({ analytics, labels }) => {
  const analyticsData = analytics
    .map(({ visitors }) => visitors.map(({ viewings }) => viewings))
    .filter((el) => el.length)
    .flatMap((el) =>
      el
        .filter((v) => v.length)
        .map((_el) => _el.slice(-1))
        .map((__el) => new Date(__el[0].date))
    );
  const counts = formatDateCounts({
    data: analyticsData,
    dataKey: "current",
    labels,
  });
  const value = Object.values(counts).reduce((acc, curr) => acc + curr, 0);
  const previousValue = Object.values(
    formatDateCounts({
      data: analyticsData,
      dataKey: "previous",
      labels,
    })
  ).reduce((acc, curr) => acc + curr, 0);
  return {
    value,
    diff:
      previousValue > 0
        ? (((value - previousValue) / previousValue) * 100).toFixed(0)
        : null,
  };
};

const getTotalVisitors = ({ analytics, labels }) => {
  const analyticsData = analytics
    .map(({ visitors }) => visitors)
    .filter((visitors) => visitors.length)
    .flatMap((visitors) =>
      visitors.flatMap(({ viewings }) =>
        viewings.map(({ date }) => new Date(date))
      )
    );
  const counts = formatDateCounts({
    data: analyticsData,
    dataKey: "current",
    labels,
  });
  const value = Object.values(counts).reduce((acc, curr) => acc + curr, 0);
  const previousValue = Object.values(
    formatDateCounts({
      data: analyticsData,
      dataKey: "previous",
      labels,
    })
  ).reduce((acc, curr) => acc + curr, 0);
  return {
    value,
    diff:
      previousValue > 0
        ? (((value - previousValue) / previousValue) * 100).toFixed(0)
        : null,
  };
};

const getVisitDurations = ({ analytics, labels }) => {
  const analyticsData = analytics
    .map(({ visitors }) => visitors)
    .filter((visitors) => visitors.length)
    .flatMap((visitors) =>
      visitors.flatMap(({ viewings }) =>
        viewings.map(({ date, timeSpent }) => ({
          timeSpent,
          date: new Date(date),
        }))
      )
    );
  const durations = formatTimeCounts({
    data: analyticsData,
    dataKey: "current",
    labels,
  });
  const counts = Object.keys(durations).reduce((acc, key) => {
    const { timeSpent, count } = durations[key];
    acc[key] = Math.round(timeSpent / count) || 0;
    return acc;
  }, {});
  const value = Number(
    Math.round(
      Object.values(counts).reduce((acc, curr) => acc + curr, 0) /
        Object.values(counts).reduce((acc, curr) => acc + (curr > 0 ? 1 : 0), 0)
    ) || 0
  );
  const timeCounts = formatTimeCounts({
    data: analyticsData,
    dataKey: "previous",
    labels,
  });
  const previousValue = Number(
    Object.values(timeCounts).reduce(
      (acc, { timeSpent, count }) => acc + Math.round(timeSpent / count) || 0,
      0
    ) / Object.keys(timeCounts).length
  );
  return {
    value,
    diff:
      previousValue > 0
        ? (((value - previousValue) / previousValue) * 100).toFixed(0)
        : null,
  };
};

const getAnalyticsData = ({ analytics, labels }) => {
  return {
    uniqueVisitors: getUniqueVisitors({ analytics, labels }),
    totalVisitors: getTotalVisitors({ analytics, labels }),
    visitDurations: getVisitDurations({ analytics, labels }),
  };
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  if (req.query.secret !== process.env.API_SECRET) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const [unreadSubmissions, analytics] = await Promise.all(
      [unreadSubmissionsQuery, analyticsQuery].map(
        async (query) => await client.fetch(query)
      )
    );

    // analytics
    const labels = getTimeRangeData("week");
    const {
      uniqueVisitors: { value: uvVal, diff: uvDiff },
      totalVisitors: { value: tvVal, diff: tvDiff },
      visitDurations: { value: vdVal, diff: vdDiff },
    } = getAnalyticsData({
      analytics,
      labels,
    });
    const analyticsMessage =
      vdVal > 0
        ? `Unique Visitors: <b>${abbreviate(uvVal, 1)} ${
            uvDiff && `(${uvDiff}%)</b>`
          }<br>Total Visitors: <b>${abbreviate(tvVal, 1)} ${
            tvDiff && `(${tvDiff}%)</b>`
          }<br>Visit Durations (avg): <b>${formatTime(vdVal)} ${
            vdDiff && `(${vdDiff}%)</b>`
          }</b>`
        : "No visitors this week";

    // unread submissions
    const multipleSubmissions = unreadSubmissions.length > 1;
    const unreadSubmissionsMessage = unreadSubmissions.length
      ? `${unreadSubmissions.length} unread message${
          multipleSubmissions ? "s" : ""
        }:<br>${unreadSubmissions
          .map(
            ({ name, email }) =>
              `${name} \<<a href="mailto:${email}">${email}</a>\>`
          )
          .join("<br>")}`
      : "No unread messages";

    // services
    const filteredServices = getServices(true)
      .filter(({ expiresOn }) => {
        return (
          expiresOn !== "-" &&
          differenceInWeeks(new Date(expiresOn), new Date()) <= 2
        );
      })
      .sort((a, b) => {
        if (a.expiresOn === "-" && b.expiresOn === "-") return 0;
        else if (a.expiresOn === "-" && b.expiresOn !== "-") return 1;
        else if (a.expiresOn !== "-" && b.expiresOn === "-") return -1;
        return new Date(a.expiresOn) - new Date(b.expiresOn);
      });
    const multipleExpiring = filteredServices.length > 1;
    const servicesMessage = filteredServices.length
      ? `${filteredServices.length} expiring service${
          multipleExpiring ? "s" : ""
        }:<br>${filteredServices
          .map(({ name, expiresOn, link }) => {
            return `${name} (${format(
              new Date(expiresOn),
              "M/d/yy"
            )}) -> <a href="${link}" target="_blank">${link}</a>`;
          })
          .join("<br>")}`
      : "No expiring services";

    // send email
    const emailMessage = `${analyticsMessage}<br><br>${unreadSubmissionsMessage}<br><br>${servicesMessage}<br><hr>`;
    await axios.post(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        service_id: process.env.SERVICE_ID,
        template_id: process.env.TEMPLATE_ID,
        user_id: process.env.USER_ID,
        accessToken: process.env.PRIVATE_KEY,
        template_params: {
          date: format(new Date(), "M/d/yy"),
          message: emailMessage,
        },
      },
      {
        headers: {
          ContentType: "application/json",
        },
      }
    );
    return res.status(200).send("Message sent");
  } catch {
    return res.status(500).send("Error. Message not sent.");
  }
}
