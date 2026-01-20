import SecureStorage from "@pagopa/io-react-native-secure-storage";
import { type Storage } from "redux-persist";
import * as Sentry from "@sentry/react-native";

export const isValueNotFoundError = (e: unknown): boolean => {
  if (!e || typeof e !== "object") {
    return false;
  }
  const error = e as { message?: unknown };
  return (
    typeof error.message === "string" && error.message === "VALUE_NOT_FOUND"
  );
};

export default function createSecureStorage(): Storage {
  return {
    getItem: async key => {
      try {
        return await SecureStorage.get(key);
      } catch (e) {
        if (!isValueNotFoundError(e)) {
          // VALUE_NOT_FOUND it's a normal case when we try to get a value that is not set
          // We should send to Sentry only unwanted exceptions
          Sentry.captureException(e, {
            tags: {
              isRequired: true
            }
          });
          Sentry.captureMessage(
            `createSecureStorage.getItem: SecureStorage.get threw an exception on ${key} key`
          );
        }
        return undefined;
      }
    },

    setItem: async (key, value) => {
      try {
        await SecureStorage.put(key, value);
      } catch (e) {
        Sentry.captureException(e, {
          tags: {
            isRequired: true
          }
        });
        Sentry.captureMessage(
          `createSecureStorage.setItem: SecureStorage.put threw an exception on ${key} key`
        );
      }
    },

    removeItem: async key => {
      try {
        await SecureStorage.remove(key);
      } catch (e) {
        Sentry.captureException(e, {
          tags: {
            isRequired: true
          }
        });
        Sentry.captureMessage(
          `createSecureStorage.removeItem: SecureStorage.remove threw an exception on ${key} key`
        );
      }
    }
  };
}
