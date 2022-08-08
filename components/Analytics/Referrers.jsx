import AnalyticsCard from "./AnalyticsCard";

export default function Pages({ referrers, isSmall, dark }) {
  return (
    <AnalyticsCard
      title="Top Sources"
      subTitle="Source"
      data={referrers}
      isSmall={isSmall}
      dark={dark}
    />
  );
}
