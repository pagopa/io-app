export type FetchFailureReason =
  | "aborted"
  | "network-error"
  | "no-attempts"
  | "retryable-status"
  | "timeout";

export type FetchFailureResponse = {
  error?: Error;
  reason: FetchFailureReason;
  /**
   * The last response received from the server. Only set when `reason`
   * is `"retryable-status"`, so callers can inspect it instead of just
   * getting a generic `Error`.
   */
  response?: Response;
  type: "failure";
};

export type FetchResponse = FetchFailureResponse | FetchSuccessResponse;

export type FetchSuccessResponse = {
  response: Response;
  type: "success";
};

export const isFailureResponse = (
  response: FetchResponse
): response is FetchFailureResponse => response.type === "failure";

export const isSuccessResponse = (
  response: FetchResponse
): response is FetchSuccessResponse => response.type === "success";

export const isAbortedResponse = (
  response: FetchResponse
): response is FetchFailureResponse =>
  isFailureResponse(response) && response.reason === "aborted";

export const isTimeoutResponse = (
  response: FetchResponse
): response is FetchFailureResponse =>
  isFailureResponse(response) && response.reason === "timeout";

export const isNetworkErrorResponse = (
  response: FetchResponse
): response is FetchFailureResponse =>
  isFailureResponse(response) && response.reason === "network-error";

export const isRetryableStatusResponse = (
  response: FetchResponse
): response is FetchFailureResponse =>
  isFailureResponse(response) && response.reason === "retryable-status";

export const isNoAttemptsResponse = (
  response: FetchResponse
): response is FetchFailureResponse =>
  isFailureResponse(response) && response.reason === "no-attempts";

/**
 * Error thrown by `unwrapFetchResponse`. Carries structured context
 * (`reason`, `statusCode`, `response`) so callers don't lose it in the
 * `catch` block, and a stable `code` usable for telemetry/logging even
 * when `instanceof` doesn't survive (e.g. across a serialization
 * boundary). `message` is a human-readable description; the same
 * `reason`/`statusCode` are also embedded in the serialized `message`
 * (via `JSON.stringify`) for log pipelines that only capture the message
 * string.
 */
export class FetchResponseError extends Error {
  code = "FETCH_RESPONSE_ERROR";
  reason: string;
  response?: Response;
  statusCode?: number;

  constructor({
    message,
    reason,
    statusCode,
    response
  }: {
    message: string;
    reason: string;
    response?: Response;
    statusCode?: number;
  }) {
    super(JSON.stringify({ message, reason, statusCode }));
    this.reason = reason;
    this.statusCode = statusCode;
    this.response = response;
  }
}

/**
 * Extracts the native HTTP `Response` from the custom fetch result.
 * Always throws `FetchResponseError`, populated differently depending on the
 * case: for a network error/timeout/abort/exhausted retries, it includes
 * `reason` (one of `FetchFailureReason`) and `response` when available;
 * for a non-2xx HTTP status, it includes `reason: "unexpected-status-code"`,
 * `statusCode` and `response`. Callers can always inspect this context in
 * the `catch` block via `instanceof FetchResponseError`, instead of losing it as
 * with a generic `Error`.
 */
export const unwrapFetchResponse = (result: FetchResponse): Response => {
  if (isFailureResponse(result)) {
    throw new FetchResponseError({
      message:
        "unwrapFetchResponse: no response was received (network error, timeout, abort, or retries exhausted)",
      reason: result.reason,
      statusCode: result.response?.status,
      response: result.response
    });
  }

  if (!result.response.ok) {
    throw new FetchResponseError({
      message: `unwrapFetchResponse: request completed with HTTP status ${result.response.status}`,
      reason: "unexpected-status-code",
      statusCode: result.response.status,
      response: result.response
    });
  }

  return result.response;
};

export type RetriableFetchOptions = {
  /**
   * Maximum number of attempts (first call included).
   * Defaults to `DEFAULT_FETCH_MAX_ATTEMPTS`.
   */
  readonly maxAttempts?: number;
  /**
   * HTTP status codes that trigger a retry.
   * The default set is `DEFAULT_RETRY_ON_STATUS_CODES`.
   */
  readonly retryOnStatusCodes?: ReadonlyArray<number>;
  /**
   * Timeout, in milliseconds, for a single attempt.
   * Defaults to `DEFAULT_FETCH_TIMEOUT_MS`.
   */
  readonly timeoutMs?: number;
};

const DEFAULT_FETCH_TIMEOUT_MS = 8000;
const DEFAULT_FETCH_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_ON_STATUS_CODES = [429, 502, 503, 504];
const BACKOFF_BASE_DELAY_MS = 200;
const BACKOFF_MAX_DELAY_MS = 5000;

/**
 * Exponential backoff delay, in milliseconds, for a given retry attempt:
 * 200ms, 400ms, 800ms, 1600ms, ... capped at {@link BACKOFF_MAX_DELAY_MS}.
 */
const exponentialBackoffDelay = (attempt: number): number =>
  Math.min(BACKOFF_BASE_DELAY_MS * 2 ** attempt, BACKOFF_MAX_DELAY_MS);

/**
 * Upper bound, in milliseconds, for a delay derived from a `Retry-After`
 * response header.
 */
const RETRY_AFTER_MAX_DELAY_MS = 60000;

/**
 * Parses the `Retry-After` response header (seconds or HTTP-date form)
 * into a delay in milliseconds, capped at {@link RETRY_AFTER_MAX_DELAY_MS}
 * to guard against clock skew or a misbehaving/malicious server.
 *
 * @returns the delay in milliseconds, or `undefined` if the header is
 * missing or not parseable.
 */
const getRetryAfterMs = (response: Response): number | undefined => {
  const retryAfterSecondsString = response.headers.get("Retry-After");
  if (!retryAfterSecondsString) {
    return undefined;
  }

  const seconds = Number(retryAfterSecondsString);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, RETRY_AFTER_MAX_DELAY_MS);
  }

  const dateMs = Date.parse(retryAfterSecondsString);
  if (!Number.isNaN(dateMs)) {
    const delayMs = Math.max(dateMs - Date.now(), 0);
    return Math.min(delayMs, RETRY_AFTER_MAX_DELAY_MS);
  }

  return undefined;
};

/**
 * Registers a one-shot `"abort"` listener that detaches itself once fired.
 * @returns a cleanup function to remove the listener early.
 */
const addAbortListener = (
  signal: AbortSignal | undefined,
  listener: () => void
): (() => void) => {
  if (!signal) {
    return () => {
      // No-op: there's no signal to detach a listener from.
    };
  }

  const onAbort = (): void => {
    signal.removeEventListener("abort", onAbort);
    listener();
  };

  signal.addEventListener("abort", onAbort);
  return () => signal.removeEventListener("abort", onAbort);
};

/**
 * Type guard distinguishing a `Request` object from a plain URL string,
 * used to know whether the input can (and must) be `clone()`d before
 * each retry attempt.
 */
const isRequestInput = (value: Request | string): value is Request =>
  typeof value !== "string";

/**
 * Waits for `delayMs` milliseconds, resolving early if `signal` is
 * aborted in the meantime. Behaves as a plain delay when `signal` is
 * `undefined`.
 */
const sleep = (delayMs: number, signal?: AbortSignal): Promise<void> =>
  new Promise<void>(resolve => {
    if (signal?.aborted) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      removeAbortListener();
      resolve();
    }, delayMs);

    const removeAbortListener = addAbortListener(signal, () => {
      clearTimeout(timeoutId);
      resolve();
    });
  });

/**
 * Factory that returns a `fetch`-like function with:
 * - a timeout, in milliseconds, after which a single attempt fails;
 * - a maximum number of attempts (first call included, e.g. the default
 *   of 3 means at most 2 retries; `maxAttempts <= 0` makes no real call);
 * - an automatic retry on "transient" status codes (default
 *   `[429, 502, 503, 504]`), honoring a `Retry-After` response header in
 *   place of the exponential backoff when present;
 * - an automatic retry on generic network errors;
 * - a manual abort via an external `AbortSignal` passed as `init.signal`
 *   (same convention as native `fetch`), which stops any attempt or wait
 *   in progress and prevents further retries.
 *
 * @param options see {@link RetriableFetchOptions}
 */
export function createRetriableFetch(
  options: RetriableFetchOptions = {}
): (input: RequestInfo, init?: RequestInit) => Promise<FetchResponse> {
  const {
    timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
    maxAttempts = DEFAULT_FETCH_MAX_ATTEMPTS,
    retryOnStatusCodes = DEFAULT_RETRY_ON_STATUS_CODES
  } = options;

  const safeTimeoutMs = Number.isFinite(timeoutMs)
    ? timeoutMs
    : DEFAULT_FETCH_TIMEOUT_MS;

  return (input: RequestInfo, init?: RequestInit): Promise<FetchResponse> => {
    // `maxAttempts <= 0` means "make zero real calls":
    // return immediately instead of performing one fetch anyway.
    if (maxAttempts <= 0) {
      return Promise.resolve({
        type: "failure",
        reason: "no-attempts",
        error: new Error(
          `maxAttempts must be a positive integer (received ${maxAttempts}): no fetch attempt was performed.`
        )
      });
    }

    const isUrlObject = typeof URL !== "undefined" && input instanceof URL;
    const safeInput = isUrlObject ? input.toString() : input;

    // An external signal aborts the whole call (current attempt and any
    // further retries), the same way a manual abort works with `fetch`.
    const manualAbortSignal = init?.signal ?? undefined;

    const performAttempt = async (
      attemptIndex: number
    ): Promise<FetchResponse> => {
      if (manualAbortSignal?.aborted) {
        return { type: "failure", reason: "aborted" };
      }

      // Per-attempt controller: enforces the timeout, and is also
      // aborted when the external signal aborts, interrupting the
      // in-flight attempt.
      const attemptAbortController = new AbortController();
      const removeManualAbortListener = addAbortListener(
        manualAbortSignal,
        () => attemptAbortController.abort()
      );

      const timeoutId = setTimeout(() => {
        attemptAbortController.abort();
      }, safeTimeoutMs);

      const handleFailure = async (
        reason: "network-error" | "retryable-status" | "timeout",
        error: Error,
        retryContext?: {
          readonly response?: Response;
          readonly retryAfterMs?: number;
        }
      ): Promise<FetchResponse> => {
        // No attempts left: return the failure, keeping the last real
        // `Response` when we have one (retryable status code) instead
        // of just the synthetic `error`.
        if (attemptIndex + 1 >= maxAttempts) {
          return {
            type: "failure",
            reason,
            error,
            response: retryContext?.response
          };
        }

        // We're retrying, so this response's body will never be read:
        // release it to avoid leaving the connection open. This is just
        // cleanup, so any error here must not block the retry.
        await retryContext?.response?.body?.cancel().catch(() => {
          // Best-effort cleanup: safe to ignore.
        });

        // A `Retry-After` header takes precedence over the exponential
        // backoff, since it's the server's explicit wait instruction.
        await sleep(
          retryContext?.retryAfterMs ?? exponentialBackoffDelay(attemptIndex),
          manualAbortSignal
        );

        // A manual abort during the wait takes priority over the retry.
        if (manualAbortSignal?.aborted) {
          return { type: "failure", reason: "aborted" };
        }

        return performAttempt(attemptIndex + 1);
      };

      try {
        // A `Request` body can only be read once: clone it before every
        // attempt so a retry doesn't reuse an already-consumed body.
        const fetchInput = isRequestInput(safeInput)
          ? safeInput.clone()
          : safeInput;

        const response = await fetch(fetchInput, {
          ...init,
          signal: attemptAbortController.signal
        });

        if (retryOnStatusCodes.includes(response.status)) {
          const error = new Error(
            `Received retryable status code ${response.status}`
          );
          return handleFailure("retryable-status", error, {
            retryAfterMs: getRetryAfterMs(response),
            response
          });
        }

        return { type: "success", response };
      } catch (error) {
        if (manualAbortSignal?.aborted) {
          return { type: "failure", reason: "aborted" };
        }

        // `attemptAbortController` only aborts from the manual-abort
        // listener above (already ruled out) or the timeout below, so if
        // it's aborted here the attempt must have timed out.
        const isTimeout = attemptAbortController.signal.aborted;
        const normalizedError = isTimeout
          ? new Error(`Request timed out after ${safeTimeoutMs}ms`)
          : error instanceof Error
            ? error
            : new Error(String(error));

        return handleFailure(
          isTimeout ? "timeout" : "network-error",
          normalizedError
        );
      } finally {
        clearTimeout(timeoutId);
        removeManualAbortListener();
      }
    };

    return performAttempt(0);
  };
}
