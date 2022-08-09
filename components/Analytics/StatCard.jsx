import { ArrowUp, ArrowDown } from "tabler-icons-react";
import abbreviate from "number-abbreviate";
import { useState } from "react";
import {
  Group,
  Paper,
  Text,
  Stack,
  Center,
  Title as MantineTitle,
} from "@mantine/core";
import { formatTime } from "utils/formatAnalytics";

export default function StatCard({
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
          {diff && (
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
          )}
        </Group>
      </Stack>
    </Paper>
  );
}
