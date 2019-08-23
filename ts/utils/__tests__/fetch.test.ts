import { MaxRetries } from "italia-ts-commons/lib/tasks";
import { Millisecond } from "italia-ts-commons/lib/units";

import { ServerMock } from "mock-http-server";

import nodeFetch from "node-fetch";
import { constantPollingFetch, defaultRetryingFetch } from "../fetch";

//
// We need to override the global fetch and AbortController to make the tests
// compatible with node-fetch
//
// tslint:disable-next-line:no-object-mutation no-any
(global as any).fetch = nodeFetch;

const TEST_HOST = "localhost";
const TEST_PORT = 40000;

// tslint:disable-next-line:no-any
function createServerTransientNotFound(): any {
  const server = new ServerMock(
    { host: TEST_HOST, port: TEST_PORT },
    undefined
  );

  server.on({
    method: "GET",
    path: "/transient-error",
    reply: {
      status: 404
    }
  });

  return server;
}

// tslint:disable-next-line:no-any no-identical-functions
function createServerTransientTooManyRequests(): any {
  const server = new ServerMock(
    { host: TEST_HOST, port: TEST_PORT },
    undefined
  );

  server.on({
    method: "GET",
    path: "/transient-error",
    reply: {
      status: 429
    }
  });

  return server;
}

const transientErrorUrl = `http://${TEST_HOST}:${TEST_PORT}/transient-error`;

describe("retriableFetch", () => {
  const server = createServerTransientNotFound();

  beforeEach(server.start);
  afterEach(server.stop);

  it("should wrap fetch with a retrying logic that handles 404 as transient error", async () => {
    // configure retriable logic with 5 retries and constant backoff
    const retry: number = 3 as number;
    const delay: number = 2 as number;

    /**
     * This is a fetch with timeouts, constant backoff and with the logic
     * that handles 404s as transient error.
     */
    const fetchWithRetries = constantPollingFetch(retry, delay);

    try {
      // start the fetch request
      await fetchWithRetries(transientErrorUrl);
    } catch (e) {
      // fetch should abort with MaxRetries
      expect(server.requests().length).toEqual(retry);
      expect(e).toEqual(MaxRetries);
    }
  });
});

describe("retriableFetch", () => {
  const server = createServerTransientTooManyRequests();

  beforeEach(server.start);
  afterEach(server.stop);

  it("should wrap fetch with a retrying logic that handles 429 as transient error", async () => {
    // configure retriable logic with 5 retries and constant backoff
    const retry: number = 3 as number;
    // configure retriable logic with 5 retries and constant backoff
    const constantBackoff = 10 as Millisecond;
    /**
     * This is a fetch with timeouts, constant backoff and with the logic
     * that handles 429 as transient error.
     */
    const fetchWithRetries = defaultRetryingFetch(constantBackoff, retry);

    try {
      // start the fetch request
      await fetchWithRetries(transientErrorUrl);
    } catch (e) {
      // fetch should abort with MaxRetries
      expect(server.requests().length).toEqual(retry);
      expect(e).toEqual(MaxRetries);
    }
  });
});
