import { useIOStore } from "../../../../store/hooks";
import { GlobalState } from "../../../../store/reducers/types";
import { itwIntegrityServiceStatusSelector } from "../../issuance/store/selectors";
import { type CredentialIssuanceFailure } from "../../machine/credential/failure";
import { type IssuanceFailure } from "../../machine/eid/failure";
import { ProximityFailure } from "../../presentation/proximity/machine/failure.ts";
import { RemoteFailure } from "../../presentation/remote/machine/failure.ts";

interface PollForStoreValueOptions<T> {
  condition: (value: T) => boolean;
  getState: () => GlobalState;
  interval?: number;
  selector: (state: GlobalState) => T;
  timeout?: number;
}

/**
 * Polls the Redux store until the selected value meets the specified condition.
 * @param state The Redux store state.
 * @param selector A function that selects the value from the store.
 * @param condition A function that checks if the value meets the desired condition.
 * @param interval The interval in milliseconds between each check.
 * @param timeout The maximum time in milliseconds to wait for the condition to be met.
 * @returns A promise that resolves with the store value once the condition is met.
 */
export const pollForStoreValue = <T>({
  getState,
  selector,
  condition,
  interval = 1000,
  timeout = 10000
}: PollForStoreValueOptions<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    const startTime = Date.now();

    // Avoid starting polling if the condition is already met
    const initialValue = selector(getState());
    if (condition(initialValue)) {
      resolve(initialValue);
      return;
    }

    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      const value = selector(getState());

      if (condition(value)) {
        clearInterval(intervalId);
        resolve(value);
      } else if (currentTime - startTime >= timeout) {
        clearInterval(intervalId);
        reject(new Error("Timeout exceeded while waiting for store value"));
      }
    }, interval);
  });

/**
 * Determines whether a failure reason should be serialized.
 * Returns true if reason is absent or an empty object.
 */
export const shouldSerializeReason = (failure: { reason?: unknown }) =>
  !failure.reason ||
  (typeof failure.reason === "object" &&
    failure.reason !== null &&
    Object.keys(failure.reason).length === 0);

/**
 * Serialize failure reasons that are instances of {@link Error}, to be safely stored and displayed.
 */
export const serializeFailureReason = (
  failure:
    | CredentialIssuanceFailure
    | IssuanceFailure
    | ProximityFailure
    | RemoteFailure
) => ({
  ...failure,
  reason: mapFailureReason(failure.reason)
});

/**
 * This logic was agreed upon with the Mixpanel team to allow them to filter these specific error cases.
 * Instead of sending a plain string, we return a structured object with a code and errorDescription.
 */
const createReasonObject = (message: string) => ({
  code: "UNEXPECTED",
  errorDescription: message
});

/**
 * Guards and maps failure reasons to a consistent format for serialization.
 * Missing reasons and Error instances are converted to a structured object,
 * Existing reason objects are preserved as-is.
 * Primitive values are returned as-is.
 */
const mapFailureReason = (reason: unknown) => {
  if (!reason) {
    return createReasonObject("Reason not provided");
  }

  if (reason instanceof Error) {
    return createReasonObject(reason.message);
  }

  return reason;
};

/**
 * Convenience function that wraps {@link pollForStoreValue} to check for the integrity service readiness.
 * This functions is meant to be used primarily in machine actors.
 * @param store The Redux store instance.
 * @throws Error if the integrity service is not ready within the timeout period.
 */
export const ensureIntegrityServiceIsStoreReadyOrThrow = async (
  store: ReturnType<typeof useIOStore>
): Promise<void> => {
  const integrityServiceStatus = await pollForStoreValue({
    getState: store.getState,
    selector: itwIntegrityServiceStatusSelector,
    condition: value => value !== undefined
  }).catch(() => {
    throw new Error("Integrity service status check timed out");
  });

  // If the integrity service preparation is not ready (still undefined) or in an error state
  // after 10 seconds the user will be prompted with an error, he will need to retry.
  if (integrityServiceStatus !== "ready") {
    throw new Error(
      `Integrity service is not ready. Current status: ${integrityServiceStatus}`
    );
  }
};
