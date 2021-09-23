import {
  AbortableFetch,
  retriableFetch,
  setFetchTimeout,
  toFetch
} from "italia-ts-commons/lib/fetch";
import { MaxRetries, withRetries } from "italia-ts-commons/lib/tasks";
import { Millisecond } from "italia-ts-commons/lib/units";

import ServerMock from "mock-http-server";
import { testableRetryLogicForTransientResponseError } from "../fetch";

const TEST_PATH = "transient-error";
const TEST_HOST = "localhost";
const TEST_PORT = 40000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createServerMock(): any {
  const server = new ServerMock(
    { host: TEST_HOST, port: TEST_PORT },
    undefined
  );

  server.on({
    method: "GET",
    path: `/${TEST_PATH}`,
    reply: {
      status: 404
    }
  });

  return server;
}

const longDelayUrl = `http://${TEST_HOST}:${TEST_PORT}/${TEST_PATH}`;

describe("retryLogicForTransientResponseError function", () => {
  const server = createServerMock();

  beforeEach(server.start);
  afterEach(server.stop);

  const transientConfigurableFetch = (
    retries: number,
    httpErrorCode: number
  ) => {
    const delay = 10 as Millisecond;
    const timeout: Millisecond = 1000 as Millisecond;
    const abortableFetch = AbortableFetch(fetch);
    const timeoutFetch = toFetch(setFetchTimeout(timeout, abortableFetch));
    const constantBackoff = () => delay;
    const retryLogic = withRetries<Error, Response>(retries, constantBackoff);
    // makes the retry logic map specific http error code to transient errors (by default only
    // timeouts are transient)
    const retryWithTransientError = testableRetryLogicForTransientResponseError!(
      _ => _.status === httpErrorCode,
      retryLogic
    );
    return retriableFetch(retryWithTransientError)(
      timeoutFetch as typeof fetch
    );
  };

  describe(`when the exact transient error code is returned`, () => {
    // Set error 404 as transient error.
    const httpErrorCode = 404;
    const retries = 3;

    it(`should fail with ${MaxRetries} error`, async () => {
      const fetchWithRetries = transientConfigurableFetch(
        retries,
        httpErrorCode
      );
      await expect(fetchWithRetries(longDelayUrl)).rejects.toEqual(MaxRetries);
    });

    it(`should send exactly ${retries} requests`, async () => {
      const fetchWithRetries = transientConfigurableFetch(
        retries,
        httpErrorCode
      );
      await fetchWithRetries(longDelayUrl).catch(_ => void 0);
      expect(server.requests().length).toEqual(retries);
    });
  });

  describe(`when a different transient error code is returned`, () => {
    const httpErrorCode = 401;
    const retries = 1000;

    // Please note that I'm re-writing these tests following the expected behaviour.
    // Not sure as to why an error condition is returning a positive response.
    it(`should resolve with defined response`, async () => {
      const fetchWithRetries = transientConfigurableFetch(
        retries,
        httpErrorCode
      );
      await expect(fetchWithRetries(longDelayUrl)).resolves.toBeDefined();
    });

    it(`should send exactly 1 request`, async () => {
      const fetchWithRetries = transientConfigurableFetch(
        retries,
        httpErrorCode
      );
      await fetchWithRetries(longDelayUrl).catch(_ => void 0);
      expect(server.requests().length).toEqual(1);
    });
  });
});
