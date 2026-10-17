import { createServer } from "node:http";
import { handleApiRequest } from "./app.mjs";

const port = Number(process.env.API_PORT || process.env.PORT || 8787);
const maxRequestBytes = 128 * 1024;
const server = createServer(async (incoming, outgoing) => {
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of incoming) {
      size += chunk.length;
      if (size > maxRequestBytes) {
        outgoing.writeHead(413, { "content-type": "application/json" });
        outgoing.end(JSON.stringify({ error: "Request body is too large" }));
        return;
      }
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);
    const request = new Request(
      `http://${incoming.headers.host || `localhost:${port}`}${incoming.url || "/"}`,
      {
        method: incoming.method,
        headers: incoming.headers,
        ...(body.length && incoming.method !== "GET" && incoming.method !== "HEAD"
          ? { body, duplex: "half" }
          : {}),
      },
    );
    const response = await handleApiRequest(request);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    outgoing.writeHead(500, { "content-type": "application/json" });
    outgoing.end(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
    );
  }
});

server.listen(port, process.env.API_HOST || "0.0.0.0", () =>
  console.log(`SPORTZ_AI API listening on port ${port}`),
);
