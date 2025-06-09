import * as O from "fp-ts/lib/Option";
import { v4 as uuid } from "uuid";
import { testSaga } from "redux-saga-test-plan";
import {
  handleRequestInit,
  testableHandleRequestInitFactory
} from "../handleRequestInit";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../../../lollipop/store/reducers/lollipop";
import { generateKeyInfo } from "../../../lollipop/saga";
import { lollipopRequestInit } from "../../../lollipop/utils/fetch";
import { ThirdPartyAttachment } from "../../../../../definitions/communications/ThirdPartyAttachment";
import { messageId_1 } from "../../__mocks__/messages";

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
    const attachmentFullUrl = `undefined/api/v1/third-party-messages/${data.messageId}/attachments/${data.attachmentFullUrl}`;
    testSaga(
      handleRequestInit,
      {
        id: data.attachmentId,
        name: data.attachmentName,
        url: data.attachmentFullUrl
      } as ThirdPartyAttachment,
      data.messageId,
      data.bearerToken,
      data.nonce
    )
      .next()
      .select(lollipopKeyTagSelector)
      .next(data.keyTagOption)
      .select(lollipopPublicKeySelector)
      .next(data.publicKeyOption)
      .call(generateKeyInfo, data.keyTagOption, data.publicKeyOption)
      .next(data.keyInfo)
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
    const attachmentFullUrl = `undefined/api/v1/third-party-messages/${data.messageId}/attachments/${data.attachmentFullUrl}`;
    testSaga(
      handleRequestInit,
      {
        id: data.attachmentId,
        name: data.attachmentName,
        url: data.attachmentFullUrl
      } as ThirdPartyAttachment,
      data.messageId,
      data.bearerToken,
      data.nonce
    )
      .next()
      .select(lollipopKeyTagSelector)
      .next(data.keyTagOption)
      .select(lollipopPublicKeySelector)
      .next(data.publicKeyOption)
      .call(generateKeyInfo, data.keyTagOption, data.publicKeyOption)
      .next(data.keyInfo)
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
  const publicKey = {
    kty: "EC",
    crv: "crv",
    x: "x",
    y: "y"
  };
  const bearerToken = "123asd";
  const headers = { Authorization: `Bearer ${bearerToken}` };
  return {
    bearerToken,
    nonce: uuid(),
    keyTag,
    keyTagOption: O.some(keyTag),
    publicKey,
    publicKeyOption: O.some(publicKey),
    keyInfo: {
      keyTag,
      publicKey,
      publicKeyThumbprint: "thumbprint"
    },
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
