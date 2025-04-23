import * as Sentry from "@sentry/react-native";

/**
 * Sends an exception to Sentry with additional context and tags.
 * If sendRequired is true, the exception will be sent regardless of any sampling logic.
 * @param {unknown} exception - The exception to be sent to Sentry.
 * @param {string} [section] - Optional section of the application where the error occurred.
 * @param {boolean} [sendRequired] - Indicates whether sending the exception is required.
 */
export function itwSendExceptionToSentry(
  exception: unknown,
  section?: string,
  sendRequired?: boolean
) {
  Sentry.captureException(exception, {
    contexts: {
      send: {
        isSendRequired: sendRequired
      }
    },
    tags: {
      section: section || "Not defined"
    }
  });
}
