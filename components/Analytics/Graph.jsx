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
import { Container, Select, Group, Text, LoadingOverlay } from "@mantine/core";
import { useState, useMemo, useRef, forwardRef, useEffect } from "react";
import { Clock } from "tabler-icons-react";
import { useHotkeys } from "@mantine/hooks";
import StatCard from "./StatCard";
import {
  getTimeRangeData,
  formatDateCounts,
  formatTimeCounts,
  formatTime,
} from "utils/formatAnalytics";

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

const selectItem = forwardRef(({ label, ...others }, ref) => (
  <div ref={ref} {...others}>
    <Group position="apart" noWrap>
      <Text size="sm">{label}</Text>
      <Text size="sm">
        {label.startsWith("All") ? "A" : label[0].toUpperCase()}
      </Text>
    </Group>
  </div>
));
selectItem.displayName = "SelectItem";

export default function Graph({ all, isSmall, dark }) {
  const [timeRange, setTimeRange] = useState("all-time");
  const [datasetTitle, setDatasetTitle] = useState("Unique Visitors");
  const [isLoading, setIsLoading] = useState(false);
  const selectRef = useRef();

  const labels = useMemo(() => getTimeRangeData(timeRange), [timeRange, all]);

  const uniqueVisitors = useMemo(() => {
    const analyticsData = all
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
      timeRange,
      labels,
    });
    const value = Object.values(counts).reduce((acc, curr) => acc + curr, 0);
    const previousValue = Object.values(
      formatDateCounts({
        data: analyticsData,
        dataKey: "previous",
        timeRange,
        labels,
      })
    ).reduce((acc, curr) => acc + curr, 0);
    return {
      counts,
      value,
      diff:
        previousValue > 0
          ? (((value - previousValue) / previousValue) * 100).toFixed(0)
          : null,
    };
  }, [timeRange, all]);
  const totalVisitors = useMemo(() => {
    const analyticsData = all
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
      timeRange,
      labels,
    });
    const value = Object.values(counts).reduce((acc, curr) => acc + curr, 0);
    const previousValue = Object.values(
      formatDateCounts({
        data: analyticsData,
        dataKey: "previous",
        timeRange,
        labels,
      })
    ).reduce((acc, curr) => acc + curr, 0);
    return {
      counts,
      value,
      diff:
        previousValue > 0
          ? (((value - previousValue) / previousValue) * 100).toFixed(0)
          : null,
    };
  }, [timeRange, all]);
  const visitDurations = useMemo(() => {
    const analyticsData = all
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
      timeRange,
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
          Object.values(counts).reduce(
            (acc, curr) => acc + (curr > 0 ? 1 : 0),
            0
          )
      ) || 0
    );
    const timeCounts = formatTimeCounts({
      data: analyticsData,
      dataKey: "previous",
      timeRange,
      labels,
    });
    const previousValue = Number(
      Object.values(timeCounts).reduce(
        (acc, { timeSpent, count }) => acc + Math.round(timeSpent / count) || 0,
        0
      ) / Object.keys(timeCounts).length
    );
    return {
      counts,
      value,
      diff:
        previousValue > 0
          ? (((value - previousValue) / previousValue) * 100).toFixed(0)
          : null,
    };
  }, [timeRange, all]);

  useHotkeys([
    ["A", () => setTimeRange("all-time")],
    ["Y", () => setTimeRange("year")],
    ["M", () => setTimeRange("month")],
    ["W", () => setTimeRange("week")],
    ["D", () => setTimeRange("day")],
  ]);

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
            value={uniqueVisitors.value}
            diff={uniqueVisitors.diff}
            dataset={datasetTitle}
            setDataset={setDatasetTitle}
            setIsLoading={setIsLoading}
          />
          <StatCard
            dark={dark}
            isSmall={isSmall}
            title="Total Visitors"
            value={totalVisitors.value}
            diff={totalVisitors.diff}
            dataset={datasetTitle}
            setDataset={setDatasetTitle}
            setIsLoading={setIsLoading}
          />
          <StatCard
            dark={dark}
            isSmall={isSmall}
            title="Visit Duration"
            value={visitDurations.value}
            diff={visitDurations.diff}
            dataset={datasetTitle}
            setDataset={setDatasetTitle}
            setIsLoading={setIsLoading}
            isTime
          />
        </Group>
        <Select
          itemComponent={selectItem}
          value={timeRange}
          onChange={setTimeRange}
          data={[
            { value: "all-time", label: "All time" },
            { value: "year", label: "Year" },
            { value: "month", label: "Month" },
            { value: "week", label: "Week" },
            { value: "day", label: "Day" },
          ]}
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
                  ? uniqueVisitors.counts
                  : datasetTitle === "Total Visitors"
                  ? totalVisitors.counts
                  : visitDurations.counts,
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
