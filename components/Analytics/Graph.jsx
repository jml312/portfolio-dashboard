import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Container,
  useMantineColorScheme,
  Select,
  Group,
  Paper,
  Text,
  Stack,
  Center,
  Title as MantineTitle,
  LoadingOverlay,
} from "@mantine/core";
import { useState, useMemo, useRef, forwardRef, useEffect } from "react";
import abbreviate from "number-abbreviate";
import { ArrowUp, ArrowDown, Clock } from "tabler-icons-react";
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
  getDaysInMonth,
  subYears,
} from "date-fns";
import { useHotkeys } from "@mantine/hooks";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const formatTime = (value) => {
  const minutes = Math.floor(value / 60);
  const seconds = (value % 60).toFixed(1).toString();
  return minutes
    ? `${minutes}m ${seconds.replace(".0", "")}s`
    : `${seconds.replace(".0", "")}s`;
};

export default function Graph({ all, isSmall }) {
  const [timeRange, setTimeRange] = useState("all-time");
  const [datasetTitle, setDatasetTitle] = useState("Unique Visitors");
  const [isLoading, setIsLoading] = useState(false);
  const selectRef = useRef();
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const dateFormats = {
    "all-time": "MMM yyy",
    year: "MMM",
    month: "do",
    week: "EEE",
    day: "ha",
  };
  const selectData = [
    { value: "all-time", label: "All time" },
    { value: "year", label: "Year" },
    { value: "month", label: "Month" },
    { value: "week", label: "Week" },
    { value: "day", label: "Day" },
  ];

  const labels = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case "all-time":
        return {
          current: eachMonthOfInterval({
            start: new Date(2022, 6, 29),
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
          current: eachDayOfInterval(
            {
              start: set(now, { date: 1 }),
              end: set(now, {
                date: getDaysInMonth(now),
              }),
            },
            { step: 6 }
          ).map((date) => ({
            regular: date,
            formatted: format(date, dateFormats["month"]),
            isCurrent: isWithinInterval(date, {
              start: set(now, { date: 1 }),
              end: now,
            }),
          })),
          previous: eachDayOfInterval(
            {
              start: subMonths(set(now, { date: 1 }), 1),
              end: subMonths(
                set(now, {
                  date: getDaysInMonth(now),
                }),
                1
              ),
            },
            { step: 6 }
          ).map((date) => ({
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
  }, [timeRange, all]);

  const getDateFormat = () => {
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

  const formatDateCounts = ({ data, dataKey }) => {
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
          getDateFormat()
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

  const formatTimeCounts = ({ data, dataKey }) => {
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
          getDateFormat()
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

  const uniqueVisitors = useMemo(
    () =>
      formatDateCounts({
        data: all
          .map(({ visitors }) => visitors.map(({ viewings }) => viewings))
          .filter((el) => el.length)
          .flatMap((el) =>
            el
              .filter((v) => v.length)
              .map((_el) => _el.slice(-1))
              .map((__el) => new Date(__el[0].date))
          ),
        dataKey: "current",
      }),
    [timeRange, all]
  );
  const totalVisitors = useMemo(
    () =>
      formatDateCounts({
        data: all
          .map(({ visitors }) => visitors)
          .filter((visitors) => visitors.length)
          .flatMap((visitors) =>
            visitors.flatMap(({ viewings }) =>
              viewings.map(({ date }) => new Date(date))
            )
          ),
        dataKey: "current",
      }),
    [timeRange, all]
  );
  const visitDurations = useMemo(() => {
    const durations = formatTimeCounts({
      data: all
        .map(({ visitors }) => visitors)
        .filter((visitors) => visitors.length)
        .flatMap((visitors) =>
          visitors.flatMap(({ viewings }) =>
            viewings.map(({ date, timeSpent }) => ({
              timeSpent,
              date: new Date(date),
            }))
          )
        ),
      dataKey: "current",
    });
    return Object.keys(durations).reduce((acc, key) => {
      const { timeSpent, count } = durations[key];
      acc[key] = Math.round(timeSpent / count) || 0;
      return acc;
    }, {});
  }, [timeRange, all]);

  useHotkeys([
    ["A", () => setTimeRange("all-time")],
    ["Y", () => setTimeRange("year")],
    ["M", () => setTimeRange("month")],
    ["W", () => setTimeRange("week")],
    ["D", () => setTimeRange("day")],
  ]);

  const uniqueVisitorsStats = useMemo(() => {
    const value = Object.values(uniqueVisitors).reduce(
      (acc, curr) => acc + curr,
      0
    );
    const previousValue = Object.values(
      formatDateCounts({
        data: all
          .map(({ visitors }) => visitors.map(({ viewings }) => viewings))
          .filter((el) => el.length)
          .flatMap((el) =>
            el
              .filter((v) => v.length)
              .map((_el) => _el.slice(-1))
              .map((__el) => new Date(__el[0].date))
          ),
        dataKey: "previous",
      })
    ).reduce((acc, curr) => acc + curr, 0);
    return {
      value,
      diff:
        previousValue > 0
          ? (((value - previousValue) / previousValue) * 100).toFixed(0)
          : null,
    };
  }, [timeRange, all]);
  const totalVisitorsStats = useMemo(() => {
    const value = Object.values(totalVisitors).reduce(
      (acc, curr) => acc + curr,
      0
    );
    const previousValue = Object.values(
      formatDateCounts({
        data: all
          .map(({ visitors }) => visitors)
          .filter((visitors) => visitors.length)
          .flatMap((visitors) =>
            visitors.flatMap(({ viewings }) =>
              viewings.map(({ date }) => new Date(date))
            )
          ),
        dataKey: "previous",
      })
    ).reduce((acc, curr) => acc + curr, 0);
    return {
      value,
      diff:
        previousValue > 0
          ? (((value - previousValue) / previousValue) * 100).toFixed(0)
          : null,
    };
  }, [timeRange, all]);
  const visitDurationsStats = useMemo(() => {
    const value = Number(
      Math.round(
        Object.values(visitDurations).reduce((acc, curr) => acc + curr, 0) /
          Object.values(visitDurations).reduce(
            (acc, curr) => acc + (curr > 0 ? 1 : 0),
            0
          )
      ) || 0
    );
    const timeCounts = formatTimeCounts({
      data: all
        .map(({ visitors }) => visitors)
        .filter((visitors) => visitors.length)
        .flatMap((visitors) =>
          visitors.flatMap(({ viewings }) =>
            viewings.map(({ date, timeSpent }) => ({
              timeSpent,
              date: new Date(date),
            }))
          )
        ),
      dataKey: "previous",
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
  }, [timeRange, all]);

  useEffect(() => {
    selectRef?.current?.blur();
  }, [timeRange]);

  return (
    <Container
      fluid
      mt={8}
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: "8px",
        padding: "1rem",
        border: `1px solid ${dark ? "#2f3136" : "#e6e6e6"}`,
        position: "relative",
      }}
    >
      <LoadingOverlay visible={isLoading} />
      <div
        style={{
          display: "flex",
          flexDirection: isSmall ? "column-reverse" : "row",
          justifyContent: "space-between",
          alignItems: "start",
          gap: "1rem",
          paddingBottom: "1.4rem",
        }}
      >
        <Group spacing="xs" sx={{ overflow: "hidden" }}>
          <StatCard
            dark={dark}
            isSmall={isSmall}
            title="Unique Visitors"
            value={uniqueVisitorsStats.value}
            diff={uniqueVisitorsStats.diff}
            dataset={datasetTitle}
            setDataset={setDatasetTitle}
            setIsLoading={setIsLoading}
          />
          <StatCard
            dark={dark}
            isSmall={isSmall}
            title="Total Visitors"
            value={totalVisitorsStats.value}
            diff={totalVisitorsStats.diff}
            dataset={datasetTitle}
            setDataset={setDatasetTitle}
            setIsLoading={setIsLoading}
          />
          <StatCard
            dark={dark}
            isSmall={isSmall}
            title="Visit Duration"
            value={visitDurationsStats.value}
            diff={visitDurationsStats.diff}
            dataset={datasetTitle}
            setDataset={setDatasetTitle}
            setIsLoading={setIsLoading}
            isTime
          />
        </Group>
        <Select
          itemComponent={forwardRef(({ label, ...others }, ref) => (
            <div ref={ref} {...others}>
              <Group position="apart" noWrap>
                <Text size="sm">{label}</Text>
                <Text size="sm">
                  {label.startsWith("All") ? "A" : label[0].toUpperCase()}
                </Text>
              </Group>
            </div>
          ))}
          value={timeRange}
          onChange={setTimeRange}
          data={selectData}
          icon={<Clock size={14} />}
          ref={selectRef}
          sx={{
            width: isSmall ? "100%" : "auto",
            minWidth: !isSmall && "200px",
            maxWidth: !isSmall && "200px",
          }}
        />
      </div>
      <Line
        data={{
          labels: labels.current.map(({ formatted }) => formatted),
          datasets: [
            {
              data:
                datasetTitle === "Unique Visitors"
                  ? uniqueVisitors
                  : datasetTitle === "Total Visitors"
                  ? totalVisitors
                  : visitDurations,
              label: datasetTitle,
              fill: true,
              backgroundColor: "rgba(34,139,230,.15)",
              borderColor: "rgba(34,139,230,1)",
            },
          ],
        }}
        options={{
          scales: {
            y: {
              ticks: {
                callback: (value) =>
                  datasetTitle === "Visit Duration" ? formatTime(value) : value,
              },
              min: 0,
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              displayColors: false,
              callbacks: {
                title: (title) => title[0].label,
                label: ({ formattedValue }) =>
                  datasetTitle === "Visit Duration"
                    ? formatTime(formattedValue)
                    : `${formattedValue} visitor${
                        formattedValue == 1 ? "" : "s"
                      }`,
              },
            },
          },
        }}
      />
    </Container>
  );
}

function StatCard({
  title,
  value,
  diff,
  dataset,
  setDataset,
  setIsLoading,
  isTime,
  dark,
  isSmall,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isCurrentDataset = title === dataset;
  const isPositiveDiff = diff > 0;
  return (
    <Paper
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      withBorder
      py="md"
      px="xl"
      radius="md"
      onClick={() => {
        if (!isCurrentDataset) {
          setIsLoading(true);
          setDataset(title);
          setIsLoading(false);
        }
      }}
      sx={{
        cursor: isCurrentDataset ? "default" : "pointer",
        border: isCurrentDataset
          ? "1px solid rgba(34,139,230,1)"
          : `1px solid ${dark ? "#25262b" : "#e9ecef"}`,
        transition: "border .1s ease-in-out",
        width: isSmall ? "100%" : "auto",
      }}
    >
      <Stack spacing="xs">
        <MantineTitle
          order={6}
          sx={{
            opacity: isCurrentDataset || isHovered ? 1 : 0.5,
            textTransform: "uppercase",
            transition: "opacity .1s ease-in-out",
          }}
        >
          {title}
        </MantineTitle>
        <Group
          position="apart"
          align="center"
          sx={{
            margin: "0 .25rem",
          }}
        >
          <MantineTitle order={3}>
            {isTime ? formatTime(value) : abbreviate(value, 1)}
          </MantineTitle>
          {diff ? (
            <Center>
              {isPositiveDiff ? (
                <ArrowUp size={16} color="#10B981" />
              ) : (
                <ArrowDown size={16} color="#F87171" />
              )}
              <Text size="xs">
                {abbreviate(diff, 1).toString().replace("-", "")}%
              </Text>
            </Center>
          ) : (
            <Text size="xs">–</Text>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}
