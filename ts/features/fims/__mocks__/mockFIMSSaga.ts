/* eslint-disable no-console */
import { call } from "typed-redux-saga/macro";
import {
  HttpCallConfig,
  RPInitialUrl,
  FakeBaseUrl,
  mockHttpNativeCall as nativeCall,
  mockSetNativeCookie,
  HttpClientSuccessResponse
} from "./mockFIMSCallbacks";

// since we are hardwiring mocks, we are sure that the response is always successful -- no need for error handling
const mockHttpNativeCall = nativeCall as (
  config: HttpCallConfig
) => Promise<HttpClientSuccessResponse>;

export function* mockFIMSSaga() {
  try {
    mockSetNativeCookie(FakeBaseUrl, "_io_fims_token", "asd");
    const config: HttpCallConfig = {
      verb: "get",
      url: RPInitialUrl,
      headers: {},
      followRedirects: true
    };
    const consents = yield* call(mockHttpNativeCall, config);
    console.log(`=== ${JSON.stringify(consents)}`);

    const confirmUrl = consents.headers["confirm-url"] as string;
    const config2: HttpCallConfig = {
      verb: "post",
      url: confirmUrl,
      headers: {},
      followRedirects: false,
      body: {}
    };
    const output2 = yield* call(mockHttpNativeCall, config2);
    console.log(`=== ${JSON.stringify(output2)}`);

    const nextUrl = output2.headers.Location as string;
    const config3: HttpCallConfig = {
      verb: "get",
      url: nextUrl,
      headers: {},
      followRedirects: false
    };
    const output3 = yield* call(mockHttpNativeCall, config3);
    console.log(`=== ${JSON.stringify(output3)}`);

    const nextUrl4 = output3.headers.Location as string;
    const config4: HttpCallConfig = {
      verb: "get",
      url: nextUrl4,
      headers: {
        signature: "asd",
        "signature-input": "asd",
        "x-pagopa-lollipop-original-method": "asd",
        "x-pagopa-lollipop-original-url": "asd",
        "x-pagopa-lollipop-custom-authorization_code": "asd"
      },
      followRedirects: false
    };
    const output4 = yield* call(mockHttpNativeCall, config4);
    console.log(`=== ${JSON.stringify(output4)}`);
  } catch (e) {
    console.log(`=== ERROR ${JSON.stringify(e)}`);
  }
}
