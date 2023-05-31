import * as O from "fp-ts/lib/Option";
import { v4 as uuid } from "uuid";
import { testSaga } from "redux-saga-test-plan";
import { testableData } from "../downloadAttachment";
import { UIAttachment } from "../../../../../store/reducers/entities/messages/types";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../../../../lollipop/store/reducers/lollipop";
import { generateKeyInfo } from "../../../../lollipop/saga";
import { lollipopRequestInit } from "../../../../lollipop/utils/fetch";

const testableDataSafe = testableData!;

describe("downloadAttachment tests", () => {
  it("reactNativeBlobUtilsFetchParametersFactory should output the proper object", () => {
    const method = "GET" as const;
    const attachmentFullUrl = "https://my.attachment/full/url";
    const headers = { key: "value" };
    const factory = testableDataSafe.reactNativeBlobUtilsFetchParametersFactory;
    const factoryOutput = factory(method, attachmentFullUrl, headers);
    expect(factoryOutput.method).toBe(method);
    expect(factoryOutput.attachmentFullUrl).toBe(attachmentFullUrl);
    expect(factoryOutput.headers).toBe(headers);
  });
  it("generateReactNativeBlobUtilsFetchParameters should follow the proper flow and return the enhanced lollipop headers", () => {
    const data = fetchParametersCommonInputData();
    testSaga(
      testableDataSafe.generateReactNativeBlobUtilsFetchParameters,
      {
        resourceUrl: {
          href: data.attachmentFullUrl
        }
      } as UIAttachment,
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
        data.attachmentFullUrl,
        { headers: data.headers, method: "GET" }
      )
      .next({ headers: data.enhancedHeaders })
      .returns({
        method: "GET",
        attachmentFullUrl: data.attachmentFullUrl,
        headers: data.enhancedHeaders
      });
  });

  it("generateReactNativeBlobUtilsFetchParameters should follow the proper flow and return standard headers when lollipopRequestInit fails", () => {
    const data = fetchParametersCommonInputData();
    testSaga(
      testableDataSafe.generateReactNativeBlobUtilsFetchParameters,
      {
        resourceUrl: {
          href: data.attachmentFullUrl
        }
      } as UIAttachment,
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
        data.attachmentFullUrl,
        { headers: data.headers, method: "GET" }
      )
      .next({ headers: undefined })
      .returns({
        method: "GET",
        attachmentFullUrl: data.attachmentFullUrl,
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
    attachmentFullUrl: "https://my.attachment/full/url",
    headers,
    enhancedHeaders: {
      ...headers,
      lollipopHeader: "lollipopHeader"
    }
  };
};
