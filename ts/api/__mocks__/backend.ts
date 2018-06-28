/**
 * Mocked version of the BackendClient.
 */

const mockedGetSession = jest.fn();

export const BackendClient = () => ({
  getSession: mockedGetSession
});
