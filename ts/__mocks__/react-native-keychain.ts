/**
 * A mocked version of the Keychain
 */

export type KeychainDB = {
  [key: string]: {
    username: string;
    password: string;
    service: string;
  };
};

type Options = {
  service: string;
};

const keychainDB: KeychainDB = {};

// eslint-disable-next-line functional/immutable-data
module.exports = {
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: "WHEN_UNLOCKED_THIS_DEVICE_ONLY"
  },

  STORAGE_TYPE: {
    AES_GCM_NO_AUTH: "AES_GCM_NO_AUTH"
  },

  getGenericPassword: jest.fn((options: Options) =>
    keychainDB[options.service]
      ? Promise.resolve(keychainDB[options.service])
      : Promise.resolve(false)
  ),

  setGenericPassword: jest.fn(
    (username: string, password: string, options: Options) => {
      // eslint-disable-next-line functional/immutable-data
      keychainDB[options.service] = {
        username,
        password,
        service: options.service
      };
      return Promise.resolve(true);
    }
  ),

  resetGenericPassword: jest.fn((options: Options | undefined) => {
    if (options) {
      // eslint-disable-next-line functional/immutable-data
      delete keychainDB[options.service];
    }
    return Promise.resolve(true);
  })
};
