import {
  format,
  closestTo,
  isWithinInterval,
  eachHourOfInterval,
  startOfDay,
  endOfDay,
  subDays,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  subYears,
} from "date-fns";

const dateFormats = {
  "all-time": "MMM yyy",
  year: "MMM",
  month: "do",
  week: "EEE",
  day: "ha",
};

const getDateFormat = (timeRange) => {
  switch (timeRange) {
    case "all-time":
      return dateFormats["all-time"];
    case "year":
      return dateFormats["year"];
    case "month":
      return dateFormats["month"];
    case "week":
      return dateFormats["week"];
    case "day":
      return dateFormats["day"];
  }
};

const getTimeRangeData = (timeRange) => {
  const now = new Date();
  switch (timeRange) {
    case "all-time":
      return {
        current: eachMonthOfInterval({
          start: new Date(2022, 7, 5), // all-time start date
          end: now,
        })
          .map((date) => ({
            regular: date,
            formatted: format(date, dateFormats["all-time"]),
          }))
          .filter((_, idx) => idx % 2 === 0),
        previous: [],
      };
    case "year":
      return {
        current: eachMonthOfInterval({
          start: startOfYear(now),
          end: endOfYear(now),
        }).map((date) => ({
          regular: date,
          formatted: format(date, dateFormats["year"]),
          isCurrent: isWithinInterval(date, {
            start: startOfYear(now),
            end: now,
          }),
        })),
        previous: eachMonthOfInterval({
          start: subYears(startOfYear(now), 1),
          end: subYears(endOfYear(now), 1),
        }).map((date) => ({
          regular: date,
          formatted: format(date, dateFormats["year"]),
        })),
      };
    case "month":
      return {
        current: eachDayOfInterval({
          start: startOfMonth(now),
          end: endOfMonth(now),
        }).map((date) => ({
          regular: date,
          formatted: format(date, dateFormats["month"]),
          isCurrent: isWithinInterval(date, {
            start: startOfMonth(now),
            end: now,
          }),
        })),
        previous: eachDayOfInterval({
          start: subMonths(startOfMonth(now), 1),
          end: subMonths(endOfMonth(now), 1),
        }).map((date) => ({
          regular: date,
          formatted: format(date, dateFormats["month"]),
        })),
      };
    case "week":
      return {
        current: eachDayOfInterval({
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        }).map((date) => ({
          regular: date,
          formatted: format(date, dateFormats["week"]),
          isCurrent: isWithinInterval(date, {
            start: startOfWeek(now, { weekStartsOn: 1 }),
            end: now,
          }),
        })),
        previous: eachDayOfInterval({
          start: subWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1),
          end: subWeeks(endOfWeek(now, { weekStartsOn: 1 }), 1),
        }).map((date) => ({
          regular: date,
          formatted: format(date, dateFormats["week"]),
        })),
      };
    case "day":
      return {
        current: eachHourOfInterval({
          start: startOfDay(now),
          end: endOfDay(now),
        }).map((date) => ({
          regular: date,
          formatted: format(date, dateFormats["day"]),
          isCurrent: isWithinInterval(date, {
            start: startOfDay(now),
            end: now,
          }),
        })),
        previous: eachHourOfInterval({
          start: subDays(startOfDay(now), 1),
          end: subDays(endOfDay(now), 1),
        }).map((date) => ({
          regular: date,
          formatted: format(date, dateFormats["day"]),
        })),
      };
  }
};

const formatDateCounts = ({ data, dataKey, timeRange = "week", labels }) => {
  const labelData = labels[dataKey];
  return data.reduce(
    (acc, curr) => {
      const date =
        timeRange === "day"
          ? new Date(Math.floor(curr.getTime() / 3600000) * 3600000)
          : curr;
      if (timeRange === "week" || timeRange === "month") {
        date.setHours(0, 0, 0, 0);
      } else if (timeRange === "year") {
        date.setHours(0, 0, 0, 0);
        date.setDate(1);
      }
      if (!labelData.length) return acc;
      if (
        labelData.length > 1 &&
        !isWithinInterval(date, {
          start: labelData[0].regular,
          end: labelData[labelData.length - 1].regular,
        })
      ) {
        return acc;
      }
      const key = format(
        closestTo(
          date,
          labelData.map(({ regular }) => new Date(regular))
        ),
        getDateFormat(timeRange)
      );
      acc[key] = acc[key] ? acc[key] + 1 : 1;
      return acc;
    },
    labelData.reduce((acc, { formatted, isCurrent }) => {
      if (isCurrent) acc[formatted] = 0;
      return acc;
    }, {})
  );
};

const formatTimeCounts = ({ data, dataKey, timeRange = "week", labels }) => {
  const labelData = labels[dataKey];
  return data.reduce(
    (acc, { date: currDate, timeSpent }) => {
      const date =
        timeRange === "day"
          ? new Date(Math.floor(currDate.getTime() / 3600000) * 3600000)
          : currDate;
      if (timeRange === "week" || timeRange === "month") {
        date.setHours(0, 0, 0, 0);
      } else if (timeRange === "year") {
        date.setHours(0, 0, 0, 0);
        date.setDate(1);
      }
      if (!labelData.length) return acc;
      if (
        labelData.length > 1 &&
        !isWithinInterval(date, {
          start: labelData[0].regular,
          end: labelData[labelData.length - 1].regular,
        })
      ) {
        return acc;
      }
      const key = format(
        closestTo(
          date,
          labelData.map(({ regular }) => new Date(regular))
        ),
        getDateFormat(timeRange)
      );
      if (key in acc) {
        acc[key].timeSpent += timeSpent;
        acc[key].count++;
      } else {
        acc[key] = {
          key,
          timeSpent,
          count: 1,
        };
      }
      return acc;
    },
    labelData.reduce((acc, { formatted, isCurrent }) => {
      if (isCurrent) {
        acc[formatted] = { key: formatted, timeSpent: 0, count: 0 };
      }
      return acc;
    }, {})
  );
};

const formatTime = (value) => {
  const minutes = Math.floor(value / 60);
  const seconds = (value % 60).toFixed(1).toString();
  return minutes
    ? `${minutes}m ${seconds.replace(".0", "")}s`
    : `${seconds.replace(".0", "")}s`;
};

export { getTimeRangeData, formatDateCounts, formatTimeCounts, formatTime };
