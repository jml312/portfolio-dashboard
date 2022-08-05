import AnalyticsCard from "./AnalyticsCard";

export default function Pages({ pages, isSmall, dark }) {
  return (
    <AnalyticsCard
      title="Top Pages"
      subTitle="Page"
      data={pages}
      isSmall={isSmall}
      dark={dark}
    />
  );
}
