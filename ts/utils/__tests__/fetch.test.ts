import { MaxRetries, RetryAborted } from "@pagopa/ts-commons/lib/tasks";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { DeferredPromise } from "@pagopa/ts-commons/lib/promises";
import {
  CallbackResponseMessageResult,
  CallbackResponseResult
} from "mockttp/dist/rules/requests/request-handlers";
import * as Mockttp from "mockttp";
import { CompletedRequest, MaybePromise } from "mockttp";

import { constantPollingFetch, defaultRetryingFetch } from "../fetch";
import { fetchMaxRetries } from "../../config";
const mockServer = Mockttp.getLocal();

const TEST_PATH = "/transient-error";

describe("defaultRetryingFetch function", () => {
  // Mock server is restarted per each test
  beforeEach(async () => {
    jest.useRealTimers();
    await mockServer.start();
  });
  afterEach(() => mockServer.stop());

  describe(`when 429 code is returned`, () => {
    it(`should send exactly ${fetchMaxRetries} requests`, async () => {
      const endpointMock = await mockServer.get(TEST_PATH).thenReply(429, "{}");
      const fetchApi = defaultRetryingFetch();
      await fetchApi(mockServer.urlFor(TEST_PATH)).catch(_ => void 0);
      const seenRequests = await endpointMock.getSeenRequests();
      expect(seenRequests.length).toEqual(fetchMaxRetries);
    });
  });

  describe(`when a different code is returned`, () => {
    it(`should resolve with a response`, async () => {
      // Please note that I'm writing these tests following the expected behaviour.
      // Not sure as to why an error condition is returning a positive response.
      const endpointMock = await mockServer.get(TEST_PATH).thenReply(403, "{}");
      const fetchApi = defaultRetryingFetch();
      await expect(
        fetchApi(mockServer.urlFor(TEST_PATH))
      ).resolves.toBeDefined();
      const seenRequests = await endpointMock.getSeenRequests();
      expect(seenRequests.length).toEqual(1);
    });
  });
});

describe("constantPollingFetch function", () => {
  // Mock server is restarted per each test
  beforeEach(async () => {
    jest.useRealTimers();
    await mockServer.start();
  });
  afterEach(() => mockServer.stop());

  const MAX_POLLING_RETRIES = 10;
  const RETRY_DELAY = 4 as Millisecond;
  const FETCH_TIMEOUT = 1000 as Millisecond;

  describe(`when 404 code is returned`, () => {
    // FIXME https://pagopa.atlassian.net/browse/IAC-123
    /*
    it(`should send exactly ${MAX_POLLING_RETRIES} requests`, async () => {
      const endpointMock = await mockServer.get(TEST_PATH).thenReply(404, "{}");
      const shouldAbortPaymentIdPollingRequest = DeferredPromise<boolean>();
      const shouldAbort = shouldAbortPaymentIdPollingRequest.e1;
      const fetchPolling = constantPollingFetch(
        shouldAbort,
        MAX_POLLING_RETRIES,
        RETRY_DELAY,
        FETCH_TIMEOUT
      );
      await fetchPolling(mockServer.urlFor(TEST_PATH)).catch(_ => void 0);
      const seenRequests = await endpointMock.getSeenRequests();
      expect(seenRequests.length).toEqual(MAX_POLLING_RETRIES);
    });
     */

    it(`should fail with ${MaxRetries} error`, async () => {
      await mockServer.get(TEST_PATH).thenReply(404, "{}");
      const shouldAbortPaymentIdPollingRequest = DeferredPromise<boolean>();
      const shouldAbort = shouldAbortPaymentIdPollingRequest.e1;
      const fetchPolling = constantPollingFetch(
        shouldAbort,
        MAX_POLLING_RETRIES,
        RETRY_DELAY,
        FETCH_TIMEOUT
      );
      await expect(fetchPolling(mockServer.urlFor(TEST_PATH))).rejects.toEqual(
        MaxRetries
      );
    });

    describe(`and the abort signal is sent`, () => {
      it(`should abort the request with the error ${RetryAborted}`, async () => {
        await mockServer.get(TEST_PATH).thenReply(404, "{}");
        const shouldAbortPaymentIdPollingRequest = DeferredPromise<boolean>();
        const shouldAbort = shouldAbortPaymentIdPollingRequest.e1;
        const fetchPolling = constantPollingFetch(
          shouldAbort,
          MAX_POLLING_RETRIES,
          RETRY_DELAY,
          FETCH_TIMEOUT
        );
        setTimeout(() => shouldAbortPaymentIdPollingRequest.e2(true), 10);
        await expect(
          fetchPolling(mockServer.urlFor(TEST_PATH))
        ).rejects.toEqual(RetryAborted);
      });
    });

    describe("and the timeout is shorter than the response time", () => {
      // it never aborts
      const DEFAULT_SHOULD_ABORT: Promise<boolean> = new Promise(_ => void 0);

      // need to use different values to avoid going above the 5000ms timeout in Jest
      const REQUEST_TIMEOUT = 10;
      const RETRIES = 4;
      const DELAY = 4;
      const MAX_DURATION_NO_TIMEOUT = RETRIES * (REQUEST_TIMEOUT * 2 + DELAY);

      const delayedResponse = (
        _: CompletedRequest
      ): MaybePromise<CallbackResponseResult> =>
        new Promise(resolve => {
          setTimeout(() => {
            const response: CallbackResponseMessageResult = { status: 404 };
            resolve(response);
          }, REQUEST_TIMEOUT * 2);
        });

      it(`should reject with error ${MaxRetries}`, async () => {
        await mockServer.get(TEST_PATH).thenCallback(delayedResponse);
        const fetchPolling = constantPollingFetch(
          DEFAULT_SHOULD_ABORT,
          RETRIES,
          DELAY,
          REQUEST_TIMEOUT as Millisecond
        );
        await expect(
          fetchPolling(mockServer.urlFor(TEST_PATH))
        ).rejects.toEqual(MaxRetries);
      });
      // FIXME https://pagopa.atlassian.net/browse/IAC-123
      /*
        it(`should perform exactly ${RETRIES} requests`, async () => {
          const endpointMock = await mockServer
            .get(TEST_PATH)
            .thenCallback(delayedResponse);
          const fetchPolling = constantPollingFetch(
            DEFAULT_SHOULD_ABORT,
            RETRIES,
            DELAY,
            REQUEST_TIMEOUT as Millisecond
          );
          await fetchPolling(mockServer.urlFor(TEST_PATH)).catch(_ => void 0);
          const seenRequests = await endpointMock.getSeenRequests();
          expect(seenRequests.length).toEqual(RETRIES);
        });
       */

      /**
       * Taking into account the time to bootstrap and run the test, we consider it successful
       * if it takes overall less than the bare time of all the requests (including delay + timeout).
       */
      it(`should take less than ${MAX_DURATION_NO_TIMEOUT} milliseconds`, async () => {
        await mockServer.get(TEST_PATH).thenCallback(delayedResponse);
        const fetchPolling = constantPollingFetch(
          DEFAULT_SHOULD_ABORT,
          RETRIES,
          DELAY,
          REQUEST_TIMEOUT as Millisecond
        );
        const startedAt = Date.now();
        await fetchPolling(mockServer.urlFor(TEST_PATH)).catch(_ => void 0);
        expect(Date.now() - startedAt).toBeLessThan(MAX_DURATION_NO_TIMEOUT);
      });
    });
  });

  describe("when a different error code is returned", () => {
    it("should send exactly 1 request", async () => {
      const endpointMock = await mockServer.get(TEST_PATH).thenReply(401, "{}");
      const shouldAbortPaymentIdPollingRequest = DeferredPromise<boolean>();
      const shouldAbort = shouldAbortPaymentIdPollingRequest.e1;
      const fetchPolling = constantPollingFetch(
        shouldAbort,
        MAX_POLLING_RETRIES,
        RETRY_DELAY,
        FETCH_TIMEOUT
      );
      await fetchPolling(mockServer.urlFor(TEST_PATH)).catch(_ => void 0);
      const seenRequests = await endpointMock.getSeenRequests();
      expect(seenRequests.length).toEqual(1);
    });

    // Please note that I'm re-writing these tests following the expected behaviour.
    // Not sure as to why an error condition is returning a positive response.
    it("should resolve with a defined response", async () => {
      await mockServer.get(TEST_PATH).thenReply(401, "{}");
      const shouldAbortPaymentIdPollingRequest = DeferredPromise<boolean>();
      const shouldAbort = shouldAbortPaymentIdPollingRequest.e1;
      const fetchPolling = constantPollingFetch(
        shouldAbort,
        MAX_POLLING_RETRIES,
        RETRY_DELAY,
        FETCH_TIMEOUT
      );
      await expect(
        fetchPolling(mockServer.urlFor(TEST_PATH))
      ).resolves.toBeDefined();
    });
  });
});
