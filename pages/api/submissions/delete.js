import client from "lib/sanity";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).send({ error: "Method not allowed" });
  }

  const { _id } = req.query;

  if (!_id) {
    return res.status(400).send({ error: "Missing _id" });
  }

  try {
    await client.delete(_id);

    return res
      .status(200)
      .send({ success: true, message: "Submission deleted" });
  } catch {
    return res.status(500).send({ error: "Something went wrong" });
  }
}
