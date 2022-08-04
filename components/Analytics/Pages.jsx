import AnalyticsCard from "./AnalyticsCard";

export default function Pages({ pages, isSmall }) {
  return (
    <AnalyticsCard
      title="Top Pages"
      subTitle="Page"
      data={pages}
      isSmall={isSmall}
    />
  );
}
