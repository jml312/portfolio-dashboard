import { Title, Container, Grid, Skeleton, Text } from "@mantine/core";
import Pages from "./Pages";
import Devices from "./Devices";
import Referrers from "./Referrers";
import Locations from "./Locations";
import Table from "./Table";
import Graph from "./Graph";

export default function Analytics({
  analytics: {
    topPages,
    topReferrers,
    topCountries,
    topRegions,
    topCities,
    topDevices,
    topBrowsers,
    topOS,
    all,
    locations,
  },
  isLoggedIn,
}) {
  return (
    <Container fluid mt={32}>
      <Title order={1} mb={8}>
        Analytics
      </Title>
      <Grid cols={2} gro gutter="lg">
        <Grid.Col sm={12} md={12}>
          <Graph />
        </Grid.Col>
        <Grid.Col sm={12} md={6}>
          <Locations
            locations={{
              map: locations,
              cities: topCities,
              regions: topRegions,
              countries: topCountries,
            }}
          />
        </Grid.Col>
        <Grid.Col sm={12} md={6}>
          <Pages pages={topPages} />
        </Grid.Col>
        <Grid.Col sm={12} md={6}>
          <Devices
            devices={{
              devices: topDevices,
              browsers: topBrowsers,
              os: topOS,
            }}
          />
        </Grid.Col>
        <Grid.Col sm={12} md={6}>
          <Referrers referrers={topReferrers} />
        </Grid.Col>
      </Grid>
      <Table data={all} isLoggedIn={isLoggedIn} />
    </Container>
  );
}
