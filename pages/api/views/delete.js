import client from "lib/sanity";
import { emptyViewingsQuery } from "lib/queries";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).send({ error: "Method not allowed" });
  }

  const groupedIPS = req.body;

  if (!groupedIPS) {
    return res.status(400).send({ error: "Missing groupedIPS" });
  }

  try {
    Object.keys(groupedIPS).forEach(async (slug) => {
      await Promise.all(
        Object.keys(groupedIPS[slug]).map(async (ip) => {
          const viewingsToRemove = groupedIPS[slug][ip].map(
            (date) => `visitors[ip == \"${ip}\"].viewings[date == \"${date}\"]`
          );
          return await client.patch(slug).unset(viewingsToRemove).commit();
        })
      );
      const emptyViewings = await client.fetch(emptyViewingsQuery, {
        slug,
      });
      const visitorsToRemove = emptyViewings.map(
        ({ ip }) => `visitors[ip == \"${ip}\"]`
      );
      await client
        .patch(slug)
        .unset(visitorsToRemove)
        .dec({
          views: emptyViewings.length,
        })
        .commit();
    });

    return res.status(200).send({ success: true });
  } catch {
    return res.status(500).send({ error: "Something went wrong" });
  }
}
