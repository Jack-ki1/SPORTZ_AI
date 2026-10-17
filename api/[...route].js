import { handleApiRequest } from "../backend/app.mjs";

export default async function handler(req, res) {
  try {
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host || "localhost";
    const body =
      req.method !== "GET" && req.method !== "HEAD" && req.body != null
        ? typeof req.body === "string"
          ? req.body
          : JSON.stringify(req.body)
        : undefined;
    if (body != null && Buffer.byteLength(body) > 128 * 1024) {
      res.statusCode = 413;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ error: "Request body is too large" }));
      return;
    }
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) headers.set(key, value.join(", "));
      else if (value != null) headers.set(key, String(value));
    }
    const request = new Request(`${protocol}://${host}${req.url}`, {
      method: req.method,
      headers,
      ...(body != null ? { body, duplex: "half" } : {}),
    });
    const response = await handleApiRequest(request);
    res.statusCode = response.status;
    for (const [key, value] of response.headers) res.setHeader(key, value);
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
    );
  }
}
