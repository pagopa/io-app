import * as Keychain from "react-native-keychain";
import { Storage } from "redux-persist";

/**
 * A storage to save/restore values from/to the Keychain.
 * The react-native-keychain library do not support storing multiple key/value so we
 * use the service as key. Each value is stored as a new service and a constant username
 * is set.
 */
const USERNAME = "REDUX_PERSIST";

export default function createSecureStorage(): Storage {
  return {
    getItem: async key => {
      const result = await Keychain.getGenericPassword({ service: key });
      if (typeof result === "boolean") {
        return undefined;
      } else {
        return result.password;
      }
    },

    setItem: async (key, value) =>
      await Keychain.setGenericPassword(USERNAME, value, {
        service: key,
        accessible: Keychain.SecAccessible.WHEN_UNLOCKED_THIS_DEVICE_ONLY
      }),

    removeItem: async key =>
      await Keychain.resetGenericPassword({ service: key })
  };
}
