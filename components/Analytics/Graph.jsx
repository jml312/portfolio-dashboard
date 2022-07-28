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
  createStyles,
  Group,
  Paper,
  Text,
  ThemeIcon,
  Stack,
  Divider,
  Center,
  Title as MantineTitle,
  LoadingOverlay,
} from "@mantine/core";
import { useState } from "react";
import abbreviate from "number-abbreviate";
import { ArrowUp, ArrowDown } from "tabler-icons-react";

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

export default function Graph({}) {
  const [timeRange, setTimeRange] = useState("all-time");
  const [dataset, setDataset] = useState("unique");
  const [isLoading, setIsLoading] = useState(false);
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

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
          justifyContent: "space-between",
          alignItems: "start",
          paddingBottom: "2rem",
        }}
      >
        <Group
          spacing="xs"
          sx={{
            overflow: "hidden",
          }}
        >
          <StatCard
            title="Unique Visitors"
            value={2000}
            diff={20}
            dataset={dataset}
            setDataset={setDataset}
            setIsLoading={setIsLoading}
          />
          <StatCard
            title="Total Visitors"
            value={1000}
            diff={-10}
            dataset={dataset}
            setDataset={setDataset}
            setIsLoading={setIsLoading}
          />

          <StatCard
            title="Visit Duration"
            value={1000}
            diff={-10}
            dataset={dataset}
            setDataset={setDataset}
            setIsLoading={setIsLoading}
          />
        </Group>
        <Select
          value={timeRange}
          onChange={setTimeRange}
          data={[
            { value: "all-time", label: "All time" },
            { value: "year", label: "Last year" },
            { value: "month", label: "Last month" },
            { value: "week", label: "Last week" },
            { value: "day", label: "Today" },
          ]}
        />
      </div>
      <Line
        data={{
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            dataset === "unique"
              ? {
                  label: "Unique Visitors",
                  data: [12, 55, 43, 82, 16, 100],
                  fill: true,
                  backgroundColor: "rgba(34,139,230,.15)",
                  borderColor: "rgba(34,139,230,1)",
                }
              : dataset === "total"
              ? {
                  label: "Total Visitors",
                  data: [33, 53, 85, 41, 44, 65],
                  fill: true,
                  backgroundColor: "rgba(34,139,230,.15)",
                  borderColor: "rgba(34,139,230,1)",
                }
              : {
                  label: "Visit Duration",
                  data: [18, 43, 82, 55, 100, 16],
                  fill: true,
                  backgroundColor: "rgba(34,139,230,.15)",
                  borderColor: "rgba(34,139,230,1)",
                },
          ],
        }}
        options={{
          plugins: {
            legend: {
              display: false,
            },
          },
        }}
      />
    </Container>
  );
}

const useStyles = createStyles((theme) => ({
  root: {
    padding: theme.spacing.xl * 1.5,
  },

  label: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },
}));

function StatCard({ title, value, diff, dataset, setDataset, setIsLoading }) {
  const [isHovered, setIsHovered] = useState(false);
  const isPositiveDiff = diff > 0;
  const currentDataset = title.split(" ")[0].toLowerCase();
  const isCurrentDataset = currentDataset === dataset;
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
          setDataset(currentDataset);
          setTimeout(() => setIsLoading(false), 1000);
        }
      }}
      sx={{
        cursor: "pointer",
      }}
    >
      <Stack spacing="xs">
        <MantineTitle
          order={6}
          sx={{
            textDecoration: isCurrentDataset ? "underline" : "none",
            opacity: isCurrentDataset || isHovered ? 1 : 0.5,
            textTransform: "uppercase",
            transition: "opacity .1s ease-in-out",
          }}
        >
          {title}
        </MantineTitle>
        <Group position="apart" align="center">
          <MantineTitle order={2}>{abbreviate(value, 1)}</MantineTitle>
          <Center>
            {isPositiveDiff ? (
              <ArrowUp size={16} color="green" />
            ) : (
              <ArrowDown size={16} color="red" />
            )}
            <Text size="xs">
              {abbreviate(diff, 1).toString().replace("-", "")}%
            </Text>
          </Center>
        </Group>
      </Stack>
    </Paper>
  );
}
// <Paper withBorder p="md" radius="md">
//   <Group position="apart">
//     <div>
//       <Text
//         color="dimmed"
//         transform="uppercase"
//         weight={700}
//         size="xs"
//         className={classes.label}
//       >
//         {title}
//       </Text>
//       <Text weight={700} size="xl">
//         {value}
//       </Text>
//     </div>
//     <ThemeIcon
//       color="gray"
//       variant="light"
//       sx={(theme) => ({
//         color: isPositiveDiff ? "green" : "red",
//       })}
//       size={38}
//       radius="md"
//     >
//       {isPositiveDiff ? (
//         <ArrowUpRight size={28} stroke={1.5} />
//       ) : (
//         <ArrowDownRight size={28} stroke={1.5} />
//       )}
//     </ThemeIcon>
//   </Group>
//   <Text color="dimmed" size="sm" mt="md">
//     <Text
//       component="span"
//       color={isPositiveDiff ? "green" : "red"}
//       weight={700}
//     >
//       {diff}%
//     </Text>{" "}
//     {isPositiveDiff ? "increase" : "decrease"} compared to last month
//   </Text>
// </Paper>

// unique viewers and total viewers for time period at top (group common IPS across page for unique viewers) - show percentage change for last time period
// line chart of views over time (dropdown to filter by all-time, 1 year, 1 month, 1 week, today)
