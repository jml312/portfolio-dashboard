import { Title, Container, Grid } from "@mantine/core";
import Pages from "./Pages";
import Devices from "./Devices";
import Referrers from "./Referrers";
import Locations from "./Locations";
import Table from "./Table";
import Graph from "./Graph";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";

export default function Analytics({
  analytics: {
    all,
    locations,
    topPages,
    topReferrers,
    topCountries,
    topRegions,
    topCities,
    topDevices,
    topBrowsers,
    topOS,
  },
  isLoggedIn,
  analyticsRef,
  dark,
}) {
  const [data, setData] = useState(all);
  const isSmall = useMediaQuery("(max-width: 450px)");
  return (
    <Container
      fluid
      mt={32}
      ref={analyticsRef}
      sx={{
        scrollMarginTop: "60px",
      }}
    >
      <Title order={1} mb={8}>
        Analytics
      </Title>
      <Grid cols={2} gutter="lg">
        <Grid.Col sm={12} md={12}>
          <Graph
            all={data}
            isSmall={isSmall}
            dark={dark}
            analyticsRef={analyticsRef}
          />
        </Grid.Col>
        <Grid.Col sm={12} md={6}>
          <Locations
            locations={{
              map: locations,
              cities: topCities,
              regions: topRegions,
              countries: topCountries,
            }}
            isSmall={isSmall}
            dark={dark}
          />
        </Grid.Col>
        <Grid.Col sm={12} md={6}>
          <Pages pages={topPages} isSmall={isSmall} dark={dark} />
        </Grid.Col>
        <Grid.Col sm={12} md={6}>
          <Devices
            devices={{
              devices: topDevices,
              browsers: topBrowsers,
              os: topOS,
            }}
            isSmall={isSmall}
            dark={dark}
          />
        </Grid.Col>
        <Grid.Col sm={12} md={6}>
          <Referrers referrers={topReferrers} isSmall={isSmall} dark={dark} />
        </Grid.Col>
      </Grid>
      <Table data={data} setData={setData} isLoggedIn={isLoggedIn} />
    </Container>
  );
}
