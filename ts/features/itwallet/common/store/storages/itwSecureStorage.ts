import * as SecureStorage from "@pagopa/io-react-native-secure-storage";
import { type Storage } from "redux-persist";
import { itwSendExceptionToSentry } from "../../utils/itwSentryUtils";

export default function itwCreateSecureStorage(): Storage {
  return {
    getItem: async key => {
      try {
        return await SecureStorage.get(key);
      } catch (e) {
        itwSendExceptionToSentry(e, `Error getting item for key: ${key}`);
        return undefined;
      }
    },

    setItem: async (key, value) => {
      try {
        await SecureStorage.put(key, value);
      } catch (e) {
        itwSendExceptionToSentry(e, `Error setting item for key: ${key}`);
      }
    },

    removeItem: async key => {
      try {
        await SecureStorage.remove(key);
      } catch (e) {
        itwSendExceptionToSentry(e, `Error removing item for key: ${key}`);
      }
    }
  };
}
