import {
  Table,
  ScrollArea,
  Anchor,
  Title,
  Container,
  Badge,
} from "@mantine/core";
import { ExternalLink } from "tabler-icons-react";
import { differenceInDays } from "date-fns";

export default function Services({ isLoggedIn, services }) {
  const headers = [
    "Name",
    "Service",
    "Rate Limit",
    "Pricing",
    "Expires On",
    "Days Left",
    "Link",
  ];

  return (
    <Container fluid mt={32}>
      <Title order={1} mb={8}>
        Services
      </Title>
      <ScrollArea>
        <Table
          verticalSpacing="sm"
          sx={{ tableLayout: "fixed", minWidth: 700 }}
        >
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map(
              ({ name, service, expiresOn, rateLimit, pricing, link }) => {
                const dayDifference = expiresOn
                  ? differenceInDays(new Date(expiresOn), new Date())
                  : "-";
                const isUrgent = dayDifference !== "-" && dayDifference <= 7;
                return (
                  <tr key={service.name}>
                    <td>{name}</td>
                    <td>{service}</td>
                    <td>{rateLimit ?? "-"}</td>
                    <td>{pricing ?? "-"}</td>
                    <td>{expiresOn ?? "-"}</td>
                    <td>
                      {isUrgent || dayDifference !== "-" ? (
                        <Badge color={isUrgent ? "red" : "gray"}>
                          {dayDifference}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <Anchor target="_blank" href={link} disabled>
                        {name} <ExternalLink size={14} />
                      </Anchor>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </Table>
      </ScrollArea>
    </Container>
  );
}
