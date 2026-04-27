import * as SecureStorage from "@pagopa/io-react-native-secure-storage";
import { type SecureStorageError } from "@pagopa/io-react-native-secure-storage";
import { type Storage } from "redux-persist";
import { trackAppCaughtError } from "../../utils/analytics";
import { unknownToString } from "../../utils/errors";

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
          trackAppCaughtError(
            "createSecureStorage.getItem",
            `SecureStorage threw an exception on ${key}`,
            unknownToString(e)
          );
        }
        return undefined;
      }
    },

    setItem: async (key, value) => {
      try {
        await SecureStorage.put(key, value);
      } catch (e) {
        trackAppCaughtError(
          "createSecureStorage.setItem",
          `SecureStorage threw an exception on ${key}`,
          unknownToString(e)
        );
      }
    },

    removeItem: async key => {
      try {
        await SecureStorage.remove(key);
      } catch (e) {
        trackAppCaughtError(
          "createSecureStorage.removeItem",
          `SecureStorage threw an exception on ${key}`,
          unknownToString(e)
        );
      }
    }
  };
}
