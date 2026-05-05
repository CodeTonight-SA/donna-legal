import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { Server } from "http";
import { createServer, buildAuthMiddleware } from "../src/server.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const TEST_PORT = 13102;
const GUARD_PORT = 13103;

async function startApp(port: number, withAuth: boolean): Promise<Server> {
  const app = express();
  app.use(express.json());
  const mcpServer = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  const token = withAuth ? "test-secret" : "";
  app.all("/mcp", buildAuthMiddleware(token), async (req, res) => {
    await transport.handleRequest(req, res, req.body);
  });
  await mcpServer.connect(transport);
  return new Promise<Server>((resolve) => {
    const s = app.listen(port, () => resolve(s));
  });
}

function closeServer(s: Server): Promise<void> {
  return new Promise((resolve, reject) => s.close((e) => (e ? reject(e) : resolve())));
}

describe("donna-legal MCP server", () => {
  let httpServer: Server;
  let guardServer: Server;

  beforeAll(async () => {
    httpServer = await startApp(TEST_PORT, false);
    guardServer = await startApp(GUARD_PORT, true);
  });

  afterAll(async () => {
    await Promise.all([closeServer(httpServer), closeServer(guardServer)]);
  });

  it("health endpoint responds 200", async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/health`);
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe("ok");
  });

  it("donna_analyse tool is registered", () => {
    const server = createServer();
    const tools = (server as unknown as { _registeredTools: Record<string, unknown> })._registeredTools;
    expect(tools).toHaveProperty("donna_analyse");
  });

  it("donna_draft tool is registered", () => {
    const server = createServer();
    const tools = (server as unknown as { _registeredTools: Record<string, unknown> })._registeredTools;
    expect(tools).toHaveProperty("donna_draft");
  });

  it("donna_review tool is registered", () => {
    const server = createServer();
    const tools = (server as unknown as { _registeredTools: Record<string, unknown> })._registeredTools;
    expect(tools).toHaveProperty("donna_review");
  });

  it("donna_export tool is registered", () => {
    const server = createServer();
    const tools = (server as unknown as { _registeredTools: Record<string, unknown> })._registeredTools;
    expect(tools).toHaveProperty("donna_export");
  });

  it("unauthorised request returns 403 when auth is enabled", async () => {
    const res = await fetch(`http://localhost:${GUARD_PORT}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 }),
    });
    expect(res.status).toBe(403);
  });
});
