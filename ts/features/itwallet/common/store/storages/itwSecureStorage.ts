import * as SecureStorage from "@pagopa/io-react-native-secure-storage";
import { type Storage } from "redux-persist";
import * as Sentry from "@sentry/react-native";

export default function itwCreateSecureStorage(): Storage {
  return {
    getItem: async key => {
      try {
        return await SecureStorage.get(key);
      } catch (e) {
        Sentry.captureException(e, {
          tags: {
            isRequired: true
          }
        });
        Sentry.captureMessage(
          `itwCreateSecureStorage.getItem: SecureStorage.get threw an exception on ${key} key`
        );
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
          `itwCreateSecureStorage.setItem: SecureStorage.put threw an exception on ${key} key`
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
          `itwCreateSecureStorage.removeItem: SecureStorage.remove threw an exception on ${key} key`
        );
      }
    }
  };
}
