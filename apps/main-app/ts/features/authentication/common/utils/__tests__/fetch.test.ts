import {
  createRetriableFetch,
  isAbortedResponse,
  isFailureResponse,
  isNoAttemptsResponse,
  isSuccessResponse,
  isTimeoutResponse
} from "../fetch";

const jsonResponse = (
  status: number,
  headers?: Record<string, string>
): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers ?? {}),
    json: () => Promise.resolve({})
  }) as unknown as Response;

const abortError = (): Error => new Error("The operation was aborted");

/**
 * A fetch mock that never settles on its own: it only rejects with an
 * abort-like error once the given `RequestInit`'s `signal` is aborted (either
 * because of the timeout or a manual abort).
 */
const neverSettlingFetch = (): jest.Mock =>
  jest.fn(
    (_input: RequestInfo, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(abortError()));
      })
  );

describe("createRetriableFetch", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("should resolve with a success result on the first attempt", async () => {
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(200));

    const fetch = createRetriableFetch();
    const response = await fetch("https://example.com");

    expect(isSuccessResponse(response)).toBe(true);
    expect(isFailureResponse(response)).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("should retry when the response status matches the configured retryable status code, then succeed", async () => {
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(429))
      .mockResolvedValueOnce(jsonResponse(200));

    const fetch = createRetriableFetch();
    const response = await fetch("https://example.com");

    expect(isSuccessResponse(response)).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("should cancel the discarded response body before retrying on a retryable status code", async () => {
    const cancelBody = jest.fn().mockResolvedValue(undefined);
    const discardedResponse = {
      ...jsonResponse(429),
      body: { cancel: cancelBody }
    } as unknown as Response;

    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(discardedResponse)
      .mockResolvedValueOnce(jsonResponse(200));

    const fetch = createRetriableFetch();
    const response = await fetch("https://example.com");

    expect(isSuccessResponse(response)).toBe(true);
    expect(cancelBody).toHaveBeenCalledTimes(1);
  });

  it("should not attempt to cancel a body when the discarded response doesn't expose one", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(429))
      .mockResolvedValueOnce(jsonResponse(200));

    const fetch = createRetriableFetch();
    const response = await fetch("https://example.com");

    expect(isSuccessResponse(response)).toBe(true);
  });

  it("should retry on timeout, then succeed", async () => {
    jest.useFakeTimers();

    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockImplementationOnce(neverSettlingFetch())
      .mockResolvedValueOnce(jsonResponse(200));

    const DEFAULT_TIMEOUT_MS = 5000;
    const fetch = createRetriableFetch({ timeoutMs: DEFAULT_TIMEOUT_MS });

    const responsePromise = fetch("https://example.com");

    await jest.advanceTimersByTimeAsync(DEFAULT_TIMEOUT_MS + 200);

    const response = await responsePromise;

    expect(isSuccessResponse(response)).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("should resolve with a timeout failure once every attempt times out", async () => {
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(neverSettlingFetch());

    const fetch = createRetriableFetch({ timeoutMs: 50, maxAttempts: 3 });
    const response = await fetch("https://example.com");

    expect(isTimeoutResponse(response)).toBe(true);
    expect(isAbortedResponse(response)).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it("should retry on a generic network error, then succeed", async () => {
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new Error("network request failed"))
      .mockResolvedValueOnce(jsonResponse(200));

    const fetch = createRetriableFetch();
    const response = await fetch("https://example.com");

    expect(isSuccessResponse(response)).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("should not retry on a status code that is not in retryOnStatusCodes", async () => {
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(200));

    const fetch = createRetriableFetch();
    const response = await fetch("https://example.com");

    expect(isSuccessResponse(response)).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("should wait for the delay given by a numeric Retry-After header instead of the exponential backoff", async () => {
    jest.useFakeTimers();

    const RETRY_AFTER_SECONDS = 2;
    const RETRY_AFTER_MS = RETRY_AFTER_SECONDS * 1000; // 2000ms

    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse(429, { "Retry-After": String(RETRY_AFTER_SECONDS) })
      )
      .mockResolvedValueOnce(jsonResponse(200));

    const fetch = createRetriableFetch();
    const responsePromise = fetch("https://example.com");

    // Execute the first attempt immediately
    await jest.advanceTimersByTimeAsync(0);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // It must override the default exponential backoff (200ms) and wait for the full 2000ms.
    // Assert that no new attempt has been made just 1ms before the delay expires.
    await jest.advanceTimersByTimeAsync(RETRY_AFTER_MS - 1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Advance 1ms further: the second attempt should trigger now
    await jest.advanceTimersByTimeAsync(1);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const result = await responsePromise;
    expect(isSuccessResponse(result)).toBe(true);
  });

  it("should wait for the delay given by an HTTP-date Retry-After header", async () => {
    jest.useFakeTimers();

    const now = Date.now();
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse(429, {
          // HTTP-date has second-level precision, so allow a little
          // slack around the nominal 3s delay to avoid a flaky test.
          "Retry-After": new Date(now + 3000).toUTCString()
        })
      )
      .mockResolvedValueOnce(jsonResponse(200));

    const fetch = createRetriableFetch();
    const responsePromise = fetch("https://example.com");

    await jest.advanceTimersByTimeAsync(1000);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(2500);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const response = await responsePromise;
    expect(isSuccessResponse(response)).toBe(true);
  });

  it("should cap an excessive Retry-After delay to avoid waiting arbitrarily long", async () => {
    jest.useFakeTimers();

    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse(429, { "Retry-After": "3600" }) // 1 hour, way over the cap
      )
      .mockResolvedValueOnce(jsonResponse(200));

    const fetch = createRetriableFetch();
    const responsePromise = fetch("https://example.com");

    // The delay must be capped at 60s (RETRY_AFTER_MAX_DELAY_MS), not
    // the full hour requested by the header.
    await jest.advanceTimersByTimeAsync(59_999);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const response = await responsePromise;
    expect(isSuccessResponse(response)).toBe(true);
  });

  it("should resolve with an aborted failure and stop retrying when the external signal is aborted", async () => {
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(neverSettlingFetch());

    const abortController = new AbortController();
    const fetch = createRetriableFetch();
    const responsePromise = fetch("https://example.com", {
      signal: abortController.signal
    });

    abortController.abort();
    const result = await responsePromise;

    expect(isAbortedResponse(result)).toBe(true);
    expect(isTimeoutResponse(result)).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("should resolve immediately with an aborted failure when the external signal is aborted while waiting for the backoff delay", async () => {
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(429));

    const abortController = new AbortController();
    const fetch = createRetriableFetch();
    const responsePromise = fetch("https://example.com", {
      signal: abortController.signal
    });

    abortController.abort();
    const result = await responsePromise;

    expect(isAbortedResponse(result)).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("should not be abortable when no signal is provided, even if an unrelated AbortController is aborted", async () => {
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(200));

    const unrelatedAbortController = new AbortController();
    const fetch = createRetriableFetch();
    const responsePromise = fetch("https://example.com");

    unrelatedAbortController.abort();
    const result = await responsePromise;

    expect(isSuccessResponse(result)).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it.each([0, -1])(
    "should perform zero fetch attempts and resolve with a no-attempts failure when maxAttempts is %i",
    async maxAttempts => {
      const fetchSpy = jest
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(jsonResponse(200));

      const fetch = createRetriableFetch({ maxAttempts });
      const response = await fetch("https://example.com");

      expect(isNoAttemptsResponse(response)).toBe(true);
      expect(fetchSpy).not.toHaveBeenCalled();
    }
  );

  it("should wait with an exponentially increasing delay between retries", async () => {
    jest.useFakeTimers();

    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(429))
      .mockResolvedValueOnce(jsonResponse(429))
      .mockResolvedValueOnce(jsonResponse(200));

    const fetch = createRetriableFetch();
    const responsePromise = fetch("https://example.com");

    // 1st attempt
    await jest.advanceTimersByTimeAsync(0);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // backoff before the 2nd attempt: 200ms (2^0 * 200ms)
    await jest.advanceTimersByTimeAsync(199);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    // backoff before the 3rd attempt: 400ms (2^1 * 200ms)
    await jest.advanceTimersByTimeAsync(399);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    await jest.advanceTimersByTimeAsync(1);
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    const response = await responsePromise;
    expect(isSuccessResponse(response)).toBe(true);
  });
});
