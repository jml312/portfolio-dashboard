import AnalyticsCard from "./AnalyticsCard";

export default function Pages({ referrers, isSmall, dark }) {
  return (
    <AnalyticsCard
      title="Top Sources"
      subTitle="Source"
      data={referrers.map((el) => ({
        ...el,
        referrer: el.referrer === "None" ? "Direct / None" : el.referrer,
      }))}
      isSmall={isSmall}
      dark={dark}
    />
  );
}
