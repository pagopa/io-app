import * as Keychain from "react-native-keychain";
import { Storage } from "redux-persist";

/**
 * A storage to save/restore credentials from/to the Keychain.
 * The react-native-keychain library do not support storing multiple key/value so we
 * use the service as key. Each value is stored as a new service and a constant username
 * is set.
 */
const USERNAME = "CREDENTIALS_PERSIST";

export default function itwCreateCredentialsStorage(): Storage {
  return {
    getItem: async key => {
      try {
        const result = await Keychain.getGenericPassword({ service: key });
        if (typeof result === "boolean") {
          return undefined;
        } else {
          return result.password;
        }
      } catch (err) {
        return undefined;
      }
    },

    setItem: async (key, value) =>
      await Keychain.setGenericPassword(USERNAME, value, {
        service: key,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE // Android only
      }),

    removeItem: async key =>
      await Keychain.resetGenericPassword({ service: key })
  };
}
