/**
 * A mocked version of the Keychain
 */

type KeychainDB = {
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

module.exports = {
  ACCESSIBLE: jest.fn(),

  getGenericPassword: jest.fn(
    (options: Options) =>
      keychainDB[options.service]
        ? Promise.resolve(keychainDB[options.service])
        : Promise.resolve(false)
  ),

  setGenericPassword: jest.fn(
    (username: string, password: string, options: Options) => {
      // tslint:disable-next-line no-object-mutation
      keychainDB[options.service] = {
        username,
        password,
        service: options.service
      };
      return Promise.resolve(true);
    }
  ),

  resetGenericPassword: jest.fn((options: Options) => {
    // tslint:disable-next-line no-object-mutation
    delete keychainDB[options.service];
    return Promise.resolve(true);
  })
};
