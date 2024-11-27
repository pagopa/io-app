import { Linking } from "react-native";
import { Credential } from "@pagopa/io-react-native-wallet";

export type OpenUrlAndListenForAuthRedirect = (
  redirectUri: string,
  authUrl: string,
  signal?: AbortSignal
) => Promise<{
  authRedirectUrl: string;
}>;

/**
 * Opens the authentication URL for CIE L2 and listens for the authentication redirect URL.
 * This function opens an in-app browser to navigate to the provided authentication URL.
 * It listens for the redirect URL containing the authorization response and returns it.
 * If the 302 redirect happens and the redirectSchema is caught, the function will return the authorization Redirect Url .
 * @param redirectUri The URL to which the end user should be redirected to complete the authentication flow
 * @param authUrl The URL to which the end user should be redirected to start the authentication flow
 * @param signal An optional {@link AbortSignal} to abort the operation when using the default browser
 * @returns An object containing the authorization redirect URL
 * @throws {Credential.Issuance.Errors.AuthorizationError} if an error occurs during the authorization process
 * @throws {Credential.Issuance.Errors.OperationAbortedError} if the caller aborts the operation via the provided signal
 */
export const openUrlAndListenForAuthRedirect: OpenUrlAndListenForAuthRedirect =
  async (redirectUri, authUrl, signal) => {
    // eslint-disable-next-line functional/no-let
    let authRedirectUrl: string | undefined;

    if (redirectUri && authUrl) {
      const urlEventListener = Linking.addEventListener("url", ({ url }) => {
        if (url.includes(redirectUri)) {
          authRedirectUrl = url;
        }
      });

      const operationIsAborted = signal
        ? createAbortPromiseFromSignal(signal)
        : undefined;
      await Linking.openURL(authUrl);

      /*
       * Waits for 120 seconds for the authRedirectUrl variable to be set
       * by the custom url handler. If the timeout is exceeded, throw an exception
       */
      const untilAuthRedirectIsNotUndefined = until(
        () => authRedirectUrl !== undefined,
        120
      );

      /**
       * Simultaneously listen for the abort signal (when provided) and the redirect url.
       * The first event that occurs will resolve the promise.
       * This is useful to properly cleanup when the caller aborts this operation.
       */
      const winner = await Promise.race(
        [operationIsAborted?.listen(), untilAuthRedirectIsNotUndefined].filter(
          isDefined
        )
      ).finally(() => {
        urlEventListener.remove();
        operationIsAborted?.remove();
      });

      if (winner === "OPERATION_ABORTED") {
        throw new ItwOperationAbortedError("DefaultQueryModeAuthorization");
      }
    }

    if (authRedirectUrl === undefined) {
      throw new Credential.Issuance.Errors.AuthorizationError(
        "Invalid authentication redirect url"
      );
    }
    return { authRedirectUrl };
  };

/**
 * Repeatedly checks a condition function until it returns true,
 * then resolves the returned promise. If the condition function does not return true
 * within the specified timeout, the promise is rejected.
 *
 * @param conditionFunction - A function that returns a boolean value.
 *                            The promise resolves when this function returns true.
 * @param timeout - An optional timeout in seconds. The promise is rejected if the
 *                  condition function does not return true within this time.
 * @returns A promise that resolves once the conditionFunction returns true or rejects if timed out.
 */
const until = (
  conditionFunction: () => boolean,
  timeoutSeconds?: number
): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    const start = Date.now();
    const poll = () => {
      if (conditionFunction()) {
        resolve();
      } else if (
        timeoutSeconds !== undefined &&
        Date.now() - start >= timeoutSeconds * 1000
      ) {
        reject(new Error("Timeout exceeded"));
      } else {
        setTimeout(poll, 400);
      }
    };

    poll();
  });

/**
 * Creates a promise that waits until the provided signal is aborted.
 * @returns {Object} An object with `listen` and `remove` methods to handle subscribing and unsubscribing.
 */
const createAbortPromiseFromSignal = (signal: AbortSignal) => {
  // eslint-disable-next-line functional/no-let
  let listener: () => void;
  return {
    listen: () =>
      new Promise<"OPERATION_ABORTED">(resolve => {
        if (signal.aborted) {
          return resolve("OPERATION_ABORTED");
        }
        listener = () => resolve("OPERATION_ABORTED");
        signal.addEventListener("abort", listener);
      }),
    remove: () => signal.removeEventListener("abort", listener)
  };
};

const isDefined = <T>(x: T | undefined | null | ""): x is T => Boolean(x);

export class ItwOperationAbortedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OperationAbortedError";
  }
}
