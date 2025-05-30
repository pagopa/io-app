import * as SecureStorage from "@pagopa/io-react-native-secure-storage";
import { type Storage } from "redux-persist";
import { sendExceptionToSentry } from "../../../../../utils/sentryUtils.ts";

export default function itwCreateSecureStorage(): Storage {
  return {
    getItem: async key => {
      try {
        return await SecureStorage.get(key);
      } catch (e) {
        sendExceptionToSentry(e, "itwSecureStorageGetItem", true);
        return undefined;
      }
    },

    setItem: async (key, value) => {
      try {
        await SecureStorage.put(key, value);
      } catch (e) {
        sendExceptionToSentry(e, "itwSecureStorageSetItem", true);
      }
    },

    removeItem: async key => {
      try {
        await SecureStorage.remove(key);
      } catch (e) {
        sendExceptionToSentry(e, "itwSecureStorageRemoveItem", true);
      }
    }
  };
}
