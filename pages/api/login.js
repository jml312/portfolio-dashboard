import { serialize } from "cookie";
import { sign } from "jsonwebtoken";
import { getData } from "utils/getData";

export default async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method not allowed" });
  }

  if (req.body.sitePassword !== process.env.SITE_PASSWORD) {
    return res.status(401).send(null);
  }

  const signedToken = sign({}, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.setHeader(
    "Set-Cookie",
    serialize("token", signedToken, {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 3600),
      maxAge: 3600,
      path: "/",
    })
  );

  return res.status(200).send(await getData(true));
}
