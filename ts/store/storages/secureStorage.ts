import * as SecureStorage from "@pagopa/io-react-native-secure-storage";
import { type SecureStorageError } from "@pagopa/io-react-native-secure-storage";
import { type Storage } from "redux-persist";
import * as Sentry from "@sentry/react-native";

type SentryContext =
  | "SECURE_STORAGE_GET_ITEM_FAILURE"
  | "SECURE_STORAGE_SET_ITEM_FAILURE"
  | "SECURE_STORAGE_REMOVE_ITEM_FAILURE";

const trackExceptionOnSentry = (
  context: SentryContext,
  error: unknown,
  key: string
) => {
  Sentry.captureException(error, {
    tags: {
      isRequired: true
    }
  });
  Sentry.captureMessage(
    `${context}: SecureStorage threw an exception on ${key} key`
  );
};

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

export default function createSecureStorage(): Storage {
  return {
    getItem: async key => {
      try {
        return await SecureStorage.get(key);
      } catch (e) {
        if (!isValueNotFoundError(e)) {
          // VALUE_NOT_FOUND it's a normal case when we try to get a value that is not set
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
