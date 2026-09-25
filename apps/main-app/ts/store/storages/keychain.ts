import * as Keychain from "react-native-keychain";
import { Storage } from "redux-persist";

import { setGenericPasswordWithDefaultAccessibleOption } from "../../utils/keychain";

/**
 * A storage to save/restore values from/to the Keychain. The
 * react-native-keychain library do not support storing multiple key/value so we
 * use the service as key. Each value is stored as a new service and a constant
 * username is set.
 */
const USERNAME = "REDUX_PERSIST";

// eslint-disable-next-line functional/no-let
export let getKeychainError: string | undefined;
// eslint-disable-next-line functional/no-let
export let setKeychainError: string | undefined;
// eslint-disable-next-line functional/no-let
export let removeKeychainError: string | undefined;

export default function createSecureStorage(): Storage {
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
        // workaround to send keychainError for Pixel devices
        // TODO: REMOVE AFTER FIXING https://pagopa.atlassian.net/jira/software/c/projects/IABT/boards/92?modal=detail&selectedIssue=IABT-1441
        getKeychainError = JSON.stringify(err);
        return undefined;
      }
    },

    setItem: async (key, value) => {
      try {
        return await setGenericPasswordWithDefaultAccessibleOption(
          USERNAME,
          value,
          {
            service: key
          }
        );
      } catch (err) {
        setKeychainError = JSON.stringify(err);
        return false;
      }
    },

    removeItem: async key => {
      try {
        return await Keychain.resetGenericPassword({ service: key });
      } catch (err) {
        removeKeychainError = JSON.stringify(err);
        return false;
      }
    }
  };
}

export const clearKeychainError = () => {
  getKeychainError = undefined;
  setKeychainError = undefined;
  removeKeychainError = undefined;
};
