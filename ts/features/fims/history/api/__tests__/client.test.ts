import * as fimsClient from "../../../../../../definitions/fims_history/client";
import * as fetchUtils from "../../../../../utils/fetch";
import { createFimsClient } from "../client";

describe("createFimsClient", () => {
  it("should invoke `createClient` with the input 'baseUrl' and the result of `defaultRetryingFetch`", () => {
    const mockFetch = jest.fn();
    const spyDefaultRetryingFetch = jest
      .spyOn(fetchUtils, "defaultRetryingFetch")
      .mockImplementation((_timeout, _maxRetries) => mockFetch);
    const mockCreateClient = jest.fn();
    jest
      .spyOn(fimsClient, "createClient")
      .mockImplementation(input => mockCreateClient(input));

    const baseUrl = "https://localhost:3000";
    createFimsClient(baseUrl);

    expect(mockCreateClient.mock.calls.length).toBe(1);
    expect(mockCreateClient.mock.calls[0].length).toBe(1);
    expect(mockCreateClient.mock.calls[0][0]).toEqual({
      baseUrl,
      fetchApi: mockFetch
    });
    expect(spyDefaultRetryingFetch.mock.calls.length).toBe(1);
    expect(spyDefaultRetryingFetch.mock.calls[0].length).toBe(0);
  });
});
