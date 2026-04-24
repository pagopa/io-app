import { testSaga } from "redux-saga-test-plan";
import { communicationClientManager } from "../../../../api/CommunicationClientManager";
import { apiUrlPrefix } from "../../../../config";
import { getKeyInfo } from "../../../lollipop/saga";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { getCommunicationClient } from "../client";

jest.mock("../../../../api/CommunicationClientManager");
jest.mock("../../../../config", () => ({
  apiUrlPrefix: "https://www.example.com"
}));

const mockKeyInfo: KeyInfo = {
  keyTag: "test-key-tag",
  publicKeyThumbprint: "mock-thumbprint"
};

const mockClient = { getUserMessages: jest.fn() };
const sessionToken = "mock-session-token";

describe("getCommunicationClient", () => {
  it("should call getKeyInfo and then getClient with the resolved keyInfo", () => {
    testSaga(getCommunicationClient, sessionToken)
      .next()
      .call(getKeyInfo)
      .next(mockKeyInfo)
      .call(communicationClientManager.getClient, apiUrlPrefix, {
        token: sessionToken,
        keyInfo: mockKeyInfo
      })
      .next(mockClient)
      .returns(mockClient);
  });

  it("should pass the sessionToken to getClient", () => {
    const differentToken = "different-session-token";

    testSaga(getCommunicationClient, differentToken)
      .next()
      .call(getKeyInfo)
      .next(mockKeyInfo)
      .call(communicationClientManager.getClient, apiUrlPrefix, {
        token: differentToken,
        keyInfo: mockKeyInfo
      })
      .next(mockClient)
      .returns(mockClient);
  });

  it("should pass keyInfo returned by getKeyInfo to getClient", () => {
    const specificKeyInfo: KeyInfo = {
      keyTag: "specific-key-tag",
      publicKeyThumbprint: "specific-thumbprint"
    };

    testSaga(getCommunicationClient, sessionToken)
      .next()
      .call(getKeyInfo)
      .next(specificKeyInfo)
      .call(communicationClientManager.getClient, apiUrlPrefix, {
        token: sessionToken,
        keyInfo: specificKeyInfo
      })
      .next(mockClient)
      .returns(mockClient);
  });

  it("should pass empty keyInfo when getKeyInfo returns an empty object", () => {
    const emptyKeyInfo: KeyInfo = {};

    testSaga(getCommunicationClient, sessionToken)
      .next()
      .call(getKeyInfo)
      .next(emptyKeyInfo)
      .call(communicationClientManager.getClient, apiUrlPrefix, {
        token: sessionToken,
        keyInfo: emptyKeyInfo
      })
      .next(mockClient)
      .returns(mockClient);
  });
});
