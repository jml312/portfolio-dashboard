import AnalyticsCard from "./AnalyticsCard";

export default function Locations({ locations, isSmall, dark }) {
  return (
    <AnalyticsCard
      title="Locations"
      data={locations}
      tabs={[
        {
          key: "map",
          shortName: "Map",
          longName: "Map",
        },
        {
          key: "cities",
          shortName: "Cities",
          longName: "City",
        },
        {
          key: "regions",
          shortName: "Regions",
          longName: "Region",
        },
        {
          key: "countries",
          shortName: "Countries",
          longName: "Country",
        },
      ]}
      isSmall={isSmall}
      dark={dark}
    />
  );
}
