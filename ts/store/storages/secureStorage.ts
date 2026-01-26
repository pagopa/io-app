import SecureStorage, {
  SecureStorageError
} from "@pagopa/io-react-native-secure-storage";
import { type Storage } from "redux-persist";
import * as Sentry from "@sentry/react-native";

type SentryContext =
  | "SECURE_STORAGE_GET_ITEM_FAILURE"
  | "SECURE_STORAGE_SET_ITEM_FAILURE"
  | "SECURE_STORAGE_REMOVE_ITEM_FAILURE";

/**
 * Type guard to check if an error is a SecureStorageError.
 * SecureStorageError from @pagopa/io-react-native-secure-storage is a plain object
 * (NOT an Error instance) with this structure:
 * {
 *   message: SecureStorageErrorCodes,  // e.g., "GET_FAILED", "PUT_FAILED", "VALUE_NOT_FOUND"
 *   userInfo: Record<string, string>   // Native error context from iOS/Android
 * }
 */
const isSecureStorageError = (e: unknown): e is SecureStorageError => {
  const error = e as { message?: unknown };
  return (
    error !== null &&
    typeof error === "object" &&
    typeof error.message === "string"
  );
};

export const isValueNotFoundError = (e: unknown): boolean =>
  isSecureStorageError(e) && e.message === "VALUE_NOT_FOUND";

/**
 * Extracts error information from SecureStorage errors.
 *
 * The `userInfo` field is crucial because it contains native error details
 * from iOS (NSError) or Android (Exception) that may include:
 * - Native exception messages
 * - Stack trace fragments from the native side
 * - Platform-specific error codes (e.g., KeyStore errors on Android)
 *
 * We also serialize the entire error as `rawError` to ensure no information
 * is lost, since the error structure may vary between platforms and versions.
 */
const extractSecureStorageErrorInfo = (error: unknown) => {
  if (isSecureStorageError(error)) {
    return {
      errorCode: error.message,
      userInfo: error.userInfo,
      rawError: JSON.stringify(error)
    };
  }
  return {
    errorCode: (error as { message?: string })?.message,
    userInfo: undefined,
    rawError: JSON.stringify(error)
  };
};

/**
 * Tracks SecureStorage exceptions to Sentry with enhanced context.
 *
 * ## Why we wrap errors in a new Error object:
 * SecureStorageError is a plain object, not an Error instance. When passed
 * directly to Sentry.captureException(), Sentry cannot extract a proper
 * stack trace from it. By wrapping it in a real Error, we get:
 * - A JavaScript stack trace showing where the error was caught
 * - Proper error grouping in Sentry's UI
 *
 * ## Why we use contexts.secureStorage:
 * The native error details (from userInfo) are spread into this context,
 * making them visible in Sentry's UI under "Additional Data". This includes
 * any native stack traces or platform-specific error information that the
 * native module provides.
 *
 * ## Why we use fingerprinting:
 * Without fingerprinting, Sentry would group errors by stack trace, which
 * would create many separate issues for the same underlying problem.
 * By fingerprinting on [operation, errorCode], we group all "GET_FAILED"
 * errors together regardless of which key was accessed.
 *
 * ## Why we use the isRequired tag:
 * Events with isRequired: true bypass Sentry's sampling and are always sent.
 * This ensures we capture all SecureStorage errors for debugging.
 */
const trackExceptionOnSentry = (
  context: SentryContext,
  error: unknown,
  key: string
) => {
  const { errorCode, userInfo, rawError } =
    extractSecureStorageErrorInfo(error);

  // If the error is already an Error instance, use it directly to preserve
  // its stack trace. Otherwise, create a new Error to ensure Sentry can
  // capture a proper JavaScript stack trace.
  const errorToCapture =
    error instanceof Error
      ? error
      : new Error(`SecureStorage failed: ${errorCode ?? "unknown"}`);

  Sentry.captureException(errorToCapture, {
    tags: {
      // isRequired: true ensures this error bypasses sampling
      isRequired: true,
      // Tag for easy filtering in Sentry dashboard
      secureStorageErrorCode: errorCode ?? "unknown"
    },
    contexts: {
      // All properties here appear in Sentry UI under "secureStorage" context
      secureStorage: {
        operation: context,
        errorCode,
        key,
        // Spread userInfo to capture native error details (iOS NSError / Android Exception)
        // This may include native stack traces, error domains, and platform-specific codes
        ...userInfo
      }
    },
    extra: {
      // rawError preserves the complete serialized error for debugging
      rawError,
      // These help identify if the error came from native code or JS
      originalErrorType: typeof error,
      isSecureStorageError: isSecureStorageError(error)
    },
    // Group errors by operation type and error code, not by stack trace
    fingerprint: ["secure-storage-failure", context, errorCode ?? "unknown"]
  });

  // Also send a message for easier searching in Sentry
  Sentry.captureMessage(
    `${context}: SecureStorage threw an exception on ${key} key`,
    { level: "warning", tags: { isRequired: true } }
  );
};

export default function createSecureStorage(): Storage {
  return {
    getItem: async key => {
      try {
        return await SecureStorage.get(key);
      } catch (e) {
        if (!isValueNotFoundError(e)) {
          // VALUE_NOT_FOUND is a normal case when we try to get a value that is not set
          // We should send to Sentry only unwanted exceptions
          trackExceptionOnSentry("SECURE_STORAGE_GET_ITEM_FAILURE", e, key);
        }
        return undefined;
      }
    },

    setItem: async (key, value) => {
      try {
        await SecureStorage.put(key, value);
      } catch (e) {
        trackExceptionOnSentry("SECURE_STORAGE_SET_ITEM_FAILURE", e, key);
      }
    },

    removeItem: async key => {
      try {
        await SecureStorage.remove(key);
      } catch (e) {
        trackExceptionOnSentry("SECURE_STORAGE_REMOVE_ITEM_FAILURE", e, key);
      }
    }
  };
}
