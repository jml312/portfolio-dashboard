import AnalyticsCard from "./AnalyticsCard";

export default function Pages({ referrers, isSmall }) {
  return (
    <AnalyticsCard
      title="Top Sources"
      subTitle="Source"
      data={referrers.map((el) => ({
        ...el,
        referrer: el.referrer === "None" ? "Direct / None" : el.referrer,
      }))}
      isSmall={isSmall}
    />
  );
}
