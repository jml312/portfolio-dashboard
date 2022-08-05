import {
  format,
  eachDayOfInterval,
  eachHourOfInterval,
  eachMonthOfInterval,
  subDays,
  subWeeks,
  subMonths,
  closestTo,
  isWithinInterval,
  set,
  subYears,
  getDaysInMonth,
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
          start: set(now, { month: 0, day: 1 }),
          end: set(now, { month: 11, day: 31 }),
        }).map((date) => ({
          regular: date,
          formatted: format(date, dateFormats["year"]),
          isCurrent: isWithinInterval(date, {
            start: set(now, { month: -1, day: 1 }),
            end: now,
          }),
        })),
        previous: eachMonthOfInterval({
          start: subYears(set(now, { month: 0, day: 1 }), 1),
          end: subYears(set(now, { month: 11, day: 31 }), 1),
        }).map((date) => ({
          regular: date,
          formatted: format(date, dateFormats["year"]),
        })),
      };
    case "month":
      return {
        current: eachDayOfInterval({
          start: set(now, { date: 1 }),
          end: set(now, {
            date: getDaysInMonth(now),
          }),
        }).map((date) => ({
          regular: date,
          formatted: format(date, dateFormats["month"]),
          isCurrent: isWithinInterval(date, {
            start: set(now, { date: 0 }),
            end: now,
          }),
        })),
        previous: eachDayOfInterval({
          start: subMonths(set(now, { date: 1 }), 1),
          end: subMonths(
            set(now, {
              date: getDaysInMonth(now),
            }),
            1
          ),
        }).map((date) => ({
          regular: date,
          formatted: format(date, dateFormats["month"]),
        })),
      };
    case "week":
      return {
        current: eachDayOfInterval({
          start: set(now, { date: 1 }),
          end: set(now, { date: 7 }),
        }).map((date) => ({
          regular: date,
          formatted: format(date, dateFormats["week"]),
          isCurrent: isWithinInterval(date, {
            start: set(now, { date: 0 }),
            end: now,
          }),
        })),
        previous: eachDayOfInterval({
          start: subWeeks(set(now, { date: 1 }), 1),
          end: subWeeks(set(now, { date: 7 }), 1),
        }).map((date) => ({
          regular: date,
          formatted: format(date, dateFormats["week"]),
        })),
      };
    case "day":
      return {
        current: eachHourOfInterval({
          start: set(now, { hours: 0 }),
          end: set(now, { hours: 23 }),
        }).map((date) => ({
          regular: date,
          formatted: format(date, dateFormats["day"]),
          isCurrent: isWithinInterval(date, {
            start: set(now, { hours: -1 }),
            end: now,
          }),
        })),
        previous: eachHourOfInterval({
          start: subDays(set(now, { hours: 0 }), 1),
          end: subDays(set(now, { hours: 23 }), 1),
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
