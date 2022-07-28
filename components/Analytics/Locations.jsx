import AnalyticsCard from "./AnalyticsCard";

export default function Locations({ locations }) {
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
    />
  );
}
