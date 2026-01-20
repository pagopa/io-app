import * as SecureStorage from "@pagopa/io-react-native-secure-storage";
import { type Storage } from "redux-persist";

export default function createSecureStorage(): Storage {
  return {
    getItem: async key => {
      try {
        return await SecureStorage.get(key);
      } catch (err) {
        return undefined;
      }
    },

    setItem: (key, value) => SecureStorage.put(key, value),

    removeItem: key => SecureStorage.remove(key)
  };
}
