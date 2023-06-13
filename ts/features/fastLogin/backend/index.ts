import { withoutUndefinedValues } from "@pagopa/ts-commons/lib/types";

import { identity } from "fp-ts/lib/function";
import {
  createFetchRequestForApi,
  ReplaceRequestParams,
  RequestParams,
  TypeofApiCall
} from "@pagopa/ts-commons/lib/requests";
import { KeyInfo } from "../../lollipop/utils/crypto";
import { LollipopConfig } from "../../lollipop";
import { lollipopFetch } from "../../lollipop/utils/fetch";
import { LollipopMethodEnum } from "../../../../definitions/lollipop/LollipopMethod";
import { LollipopOriginalURL } from "../../../../definitions/lollipop/LollipopOriginalURL";
import { LollipopSignatureInput } from "../../../../definitions/lollipop/LollipopSignatureInput";
import { LollipopSignature } from "../../../../definitions/lollipop/LollipopSignature";
import {
  fastLoginDecoder,
  FastLoginResponse,
  FastLoginT
} from "./mockedFunctionsAndTypes";

export const performFastLogin = async (fastLoginClient: FastLoginClient) =>
  await fastLoginClient.fastLogin({
    "x-pagopa-lollipop-original-method": LollipopMethodEnum.POST,
    "x-pagopa-lollipop-original-url": "" as LollipopOriginalURL,
    "signature-input": "" as LollipopSignatureInput,
    signature: "" as LollipopSignature
  });

type FastLoginClient = ReturnType<typeof createFastLoginClient>;

export const createFastLoginClient = (
  baseUrl: string,
  keyInfo: KeyInfo = {},
  lollipopConfig: LollipopConfig
) =>
  createClient({
    baseUrl,
    fetchApi: lollipopFetch(lollipopConfig, keyInfo)
  });

function createClient({
  baseUrl,
  fetchApi,
  basePath = "/api/v1/fast-login"
}: {
  baseUrl: string;
  fetchApi: typeof fetch;
  basePath?: string;
}) {
  const options = {
    baseUrl,
    fetchApi
  };

  const fastLoginT: ReplaceRequestParams<
    FastLoginT,
    RequestParams<FastLoginT>
  > = {
    body: body => JSON.stringify(body),
    method: "post",
    headers: ({
      ["x-pagopa-lollipop-original-method"]: xPagopaLollipopOriginalMethod,
      ["x-pagopa-lollipop-original-url"]: xPagopaLollipopOriginalUrl,
      ["signature-input"]: signatureInput,
      ["signature"]: signature
    }) => ({
      "x-pagopa-lollipop-original-method": xPagopaLollipopOriginalMethod,

      "x-pagopa-lollipop-original-url": xPagopaLollipopOriginalUrl,

      "signature-input": signatureInput,

      signature,

      "Content-Type": "application/json"
    }),
    response_decoder: fastLoginDecoder(FastLoginResponse),
    url: () => `${basePath}`,

    query: () => withoutUndefinedValues({})
  };

  const fastLogin: TypeofApiCall<FastLoginT> = createFetchRequestForApi(
    fastLoginT,
    options
  );

  return {
    fastLogin: identity(fastLogin)
  };
}
