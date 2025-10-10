import { PublicKey } from "@pagopa/io-react-native-crypto";
import * as O from "fp-ts/lib/Option";
import { testSaga } from "redux-saga-test-plan";
import {
  handleRequestInit,
  testableHandleRequestInitFactory
} from "../handleRequestInit";
import { lollipopRequestInit } from "../../../lollipop/utils/fetch";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { messageId_1 } from "../../__mocks__/messages";
import { KeyInfo } from "../../../lollipop/utils/crypto";

const apiUrlPrefix = "https://base.url";
jest.mock("../../../../config", () => ({
  apiUrlPrefix
}));

const mockUUID = "1896a22a-978b-49e9-856b-1cd74f2de3d8";
jest.mock("uuid", () => ({ v4: () => mockUUID }));

const handleRequestInitFactory = testableHandleRequestInitFactory!;

describe("handleDownloadAttachment", () => {
  it("handleRequestInitFactory should output the proper object", () => {
    const method = "GET" as const;
    const attachmentFullUrl = "https://my.attachment/full/url";
    const headers = { key: "value" };
    const factory = handleRequestInitFactory;
    const factoryOutput = factory(method, attachmentFullUrl, headers);
    expect(factoryOutput.method).toBe(method);
    expect(factoryOutput.attachmentFullUrl).toBe(attachmentFullUrl);
    expect(factoryOutput.headers).toBe(headers);
  });

  it("handleRequestInit should follow the proper flow and return the enhanced lollipop headers", () => {
    const data = fetchParametersCommonInputData();
    const attachmentFullUrl = `https://base.url/api/v1/third-party-messages/${data.messageId}/attachments/${data.attachmentFullUrl}`;
    testSaga(
      handleRequestInit,
      {
        id: data.attachmentId,
        name: data.attachmentName,
        url: data.attachmentFullUrl
      } as ThirdPartyAttachment,
      data.messageId,
      data.bearerToken,
      data.keyInfo
    )
      .next()
      .call(
        lollipopRequestInit,
        { nonce: data.nonce },
        data.keyInfo,
        attachmentFullUrl,
        { headers: data.headers, method: "GET" }
      )
      .next({ headers: data.enhancedHeaders })
      .returns({
        method: "GET",
        attachmentFullUrl,
        headers: data.enhancedHeaders
      });
  });

  it("handleRequestInit should follow the proper flow and return standard headers when lollipopRequestInit fails", () => {
    const data = fetchParametersCommonInputData();
    const attachmentFullUrl = `https://base.url/api/v1/third-party-messages/${data.messageId}/attachments/${data.attachmentFullUrl}`;
    testSaga(
      handleRequestInit,
      {
        id: data.attachmentId,
        name: data.attachmentName,
        url: data.attachmentFullUrl
      } as ThirdPartyAttachment,
      data.messageId,
      data.bearerToken,
      data.keyInfo
    )
      .next()
      .call(
        lollipopRequestInit,
        { nonce: data.nonce },
        data.keyInfo,
        attachmentFullUrl,
        { headers: data.headers, method: "GET" }
      )
      .next({ headers: undefined })
      .returns({
        method: "GET",
        attachmentFullUrl,
        headers: data.headers
      });
  });
});

const fetchParametersCommonInputData = () => {
  const keyTag = "keyTag";
  const publicKey: PublicKey = {
    kty: "EC",
    crv: "crv",
    x: "x",
    y: "y"
  };
  const keyInfo: KeyInfo = {
    keyTag,
    publicKey,
    publicKeyThumbprint: "hUjLQnu7ElEk1tx0vs9ziWHcJBTVGWTeHVyq3ZBhKBg"
  };
  const bearerToken = "123asd";
  const headers = { Authorization: `Bearer ${bearerToken}` };
  return {
    bearerToken,
    nonce: mockUUID,
    keyTag,
    keyTagOption: O.some(keyTag),
    publicKey,
    publicKeyOption: O.some(publicKey),
    keyInfo,
    messageId: messageId_1,
    attachmentId: "1",
    attachmentName: "1.pdf",
    attachmentFullUrl: "https://my.attachment/full/url",
    headers,
    enhancedHeaders: {
      ...headers,
      lollipopHeader: "lollipopHeader"
    }
  };
};
