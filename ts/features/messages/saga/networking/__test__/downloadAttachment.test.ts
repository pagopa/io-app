import * as O from "fp-ts/lib/Option";
import { testSaga } from "redux-saga-test-plan";
import { testableData } from "../downloadAttachment";
import { UIAttachment } from "../../../../../store/reducers/entities/messages/types";
import { lollipopKeyTagSelector, lollipopPublicKeySelector } from "../../../../lollipop/store/reducers/lollipop";
import { generateKeyInfo } from "../../../../lollipop/saga";

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
  it("wazaa", () => {
    testSaga(testableDataSafe.generateReactNativeBlobUtilsFetchParameters, {
      resourceUrl: {
        href: "https://my.attachment/full/url"
      }
    } as UIAttachment, "")
    .next()
    .select(lollipopKeyTagSelector)
    .next(O.some(""))
    .select(lollipopPublicKeySelector)
    .next(O.some({}))
    .call(generateKeyInfo, O.some(""), O.some({}))
    .next(O.some({}))
    .isDone();
  });
});