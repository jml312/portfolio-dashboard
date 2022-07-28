import AnalyticsCard from "./AnalyticsCard";

export default function Devices({ devices }) {
  return (
    <AnalyticsCard
      title="Devices"
      data={{
        ...devices,
        os: devices.os.map((el) => ({
          ...el,
          os: el.os === "null" ? "Unknown" : el.os,
        })),
      }}
      tabs={[
        {
          key: "devices",
          shortName: "Size",
          longName: "Screen size",
        },
        {
          key: "browsers",
          shortName: "Browser",
          longName: "Browser",
        },
        {
          key: "os",
          shortName: "OS",
          longName: "Operating system",
        },
      ]}
    />
  );
}
