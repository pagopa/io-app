/**
 * Development-only XState inspector bridge for the Metro dev server.
 *
 * The bridge is a stateless relay: it accepts batches of inspection events from
 * the app and fans each event out to every connected browser over Server-Sent
 * Events. Nothing is buffered, so a page that connects late only sees events
 * sent after it connected.
 *
 * Mounted by `apps/main-app/metro.config.js` through `enhanceMiddleware`, which
 * is the only reason it can share Metro's port and avoid a second process.
 *
 * All routes live under `/xstate-inspector` to stay clear of the paths owned by
 * Metro and Expo: `/hot`, `/message`, `/events`, `/status`, `/open-stack-frame`
 * and `/expo-dev-plugins/*`.
 *
 * @typedef {import("http").IncomingMessage} IncomingMessage
 * @typedef {import("http").ServerResponse} ServerResponse
 * @typedef {(req: IncomingMessage, res: ServerResponse, next: () => void) => void} Middleware
 */
const fs = require("fs");
const path = require("path");

const PREFIX = "/xstate-inspector";
const BROWSER_DIR = path.join(__dirname, "browser");
const INDEX_FILE = "index.html";

/** Upper bound for a single ingest request, to keep a runaway app from exhausting memory. */
const MAX_BODY_BYTES = 16 * 1024 * 1024;

/** Interval between SSE comments, so idle proxies and Android's tunnel keep the stream open. */
const HEARTBEAT_MS = 15000;

/**
 * Bytes queued for a single browser before it is treated as stalled.
 *
 * A client that stops reading — frozen tab, sleeping laptop, half-open tunnel —
 * neither errors nor closes, so without a bound this process would buffer every
 * subsequent frame forever.
 */
const MAX_CLIENT_BACKLOG_BYTES = 4 * 1024 * 1024;

/** @type {Record<string, string>} */
const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8"
};

/**
 * Returns the file path for a request inside the browser assets directory, or
 * undefined when the path escapes it.
 *
 * @param {string} requestPath
 * @returns {string | undefined}
 */
const resolveBrowserFile = requestPath => {
  const relative = requestPath.slice(PREFIX.length).replace(/^\/+/, "");
  const candidate = path.resolve(BROWSER_DIR, relative);
  const root = BROWSER_DIR + path.sep;
  if (candidate !== BROWSER_DIR && !candidate.startsWith(root)) {
    return undefined;
  }
  return candidate;
};

/**
 * Creates the Connect-style middleware mounted into Metro's dev server.
 *
 * @returns {Middleware}
 */
const createXStateInspectorMiddleware = () => {
  /** @type {Set<ServerResponse>} */
  const streams = new Set();
  let received = 0;
  let rejected = 0;

  /** @param {string} json */
  const broadcast = json => {
    const frame = `data: ${json}\n\n`;
    streams.forEach(stream => {
      if (stream.writableLength > MAX_CLIENT_BACKLOG_BYTES) {
        stream.destroy();
        streams.delete(stream);
        return;
      }
      try {
        stream.write(frame);
      } catch {
        streams.delete(stream);
      }
    });
  };

  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   */
  const openStream = (req, res) => {
    req.socket.setTimeout(0);
    req.socket.setNoDelay(true);
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    res.write("retry: 1000\n\n");
    streams.add(res);

    const heartbeat = setInterval(() => {
      try {
        res.write(": ping\n\n");
      } catch {
        clearInterval(heartbeat);
        streams.delete(res);
      }
    }, HEARTBEAT_MS);

    // `res` close, not `req` close: a request emits `close` as soon as it has
    // been received, which under Metro is immediately after the headers.
    res.on("close", () => {
      clearInterval(heartbeat);
      streams.delete(res);
    });
  };

  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   */
  const ingest = (req, res) => {
    /** @type {Array<Buffer>} */
    const chunks = [];
    let size = 0;
    let aborted = false;

    req.on("data", chunk => {
      if (aborted) {
        return;
      }
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        aborted = true;
        rejected += 1;
        res.writeHead(413).end();
        // The response has to flush before the socket goes, otherwise the app
        // sees a transport error instead of the rejection.
        res.once("finish", () => req.destroy());
        return;
      }
      chunks.push(/** @type {Buffer} */ (chunk));
    });

    req.on("end", () => {
      if (aborted) {
        return;
      }
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        const events = Array.isArray(parsed) ? parsed : [parsed];
        received += events.length;
        events.forEach(event => broadcast(JSON.stringify(event)));
        res.writeHead(204).end();
      } catch {
        res.writeHead(400).end();
      }
    });
  };

  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @param {() => void} next
   */
  const serveFile = (req, res, next) => {
    const requestPath = (req.url ?? "").split("?")[0];
    const normalized = requestPath.endsWith("/")
      ? requestPath + INDEX_FILE
      : requestPath;
    const file = resolveBrowserFile(normalized);
    if (!file) {
      next();
      return;
    }

    fs.stat(file, (error, stats) => {
      if (error || !stats.isFile()) {
        next();
        return;
      }
      const type =
        CONTENT_TYPES[path.extname(file).toLowerCase()] ??
        "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": type,
        "Cache-Control": "no-store"
      });
      // Without this, a read failure after the stat above (file replaced or
      // deleted mid-checkout, EACCES, EMFILE) would take the dev server down.
      const stream = fs.createReadStream(file);
      stream.on("error", () => res.destroy());
      stream.pipe(res);
    });
  };

  return (req, res, next) => {
    const requestPath = (req.url ?? "").split("?")[0];
    if (requestPath !== PREFIX && !requestPath.startsWith(`${PREFIX}/`)) {
      next();
      return;
    }

    const route = requestPath.slice(PREFIX.length) || "/";

    if (route === "/stream" && req.method === "GET") {
      openStream(req, res);
      return;
    }

    if (route === "/ingest" && req.method === "POST") {
      ingest(req, res);
      return;
    }

    if (route === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ clients: streams.size, received, rejected }));
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      serveFile(req, res, next);
      return;
    }

    next();
  };
};

module.exports = { createXStateInspectorMiddleware, PREFIX };
