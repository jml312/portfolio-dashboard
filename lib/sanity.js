import client from "@sanity/client";

export default client({
  dataset: "production",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  useCdn: false,
  token: process.env.SANITY_TOKEN,
  apiVersion: "2022-01-18",
});
