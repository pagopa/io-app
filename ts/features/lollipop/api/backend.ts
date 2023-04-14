import * as t from "io-ts";

import {
  ApiHeaderJson,
  composeHeaderProducers,
  composeResponseDecoders as compD,
  constantResponseDecoder as constD,
  createFetchRequestForApi,
  ioResponseDecoder as ioD,
  IPostApiRequestType,
  IResponseType,
  ResponseDecoder
} from "@pagopa/ts-commons/lib/requests";
import _ from "lodash";
import { ProblemJson } from "../../../../definitions/backend/ProblemJson";
import { SessionToken } from "../../../types/SessionToken";
import { defaultRetryingFetch } from "../../../utils/fetch";
import {
  tokenHeaderProducer,
  withBearerToken as withToken
} from "../../../utils/api";

import { KeyInfo } from "../../../features/lollipop/utils/crypto";
import { LollipopConfig } from "..";
import { lollipopFetch } from "../utils/fetch";

type LollipopBaseResponseType<R> =
  | IResponseType<200, R>
  | IResponseType<401, undefined>
  | IResponseType<403, undefined>
  | IResponseType<400, ProblemJson>
  | IResponseType<404, ProblemJson>
  | IResponseType<500, ProblemJson>;

function lollipopBaseMessageResponseDecoder<R, O = R>(
  type: t.Type<R, O>
): ResponseDecoder<LollipopBaseResponseType<R>> {
  return compD(
    compD(
      compD(ioD<200, R, O>(200, type), constD<undefined, 401>(401, undefined)),
      compD(
        constD<undefined, 403>(403, undefined),
        ioD<400, ProblemJson>(400, ProblemJson)
      )
    ),
    compD(
      ioD<404, ProblemJson>(404, ProblemJson),
      ioD<500, ProblemJson>(500, ProblemJson)
    )
  );
}

// eslint-disable-next-line
export function LollipopBackendClient(
  baseUrl: string,
  token: SessionToken,
  keyInfo: KeyInfo = {},
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options = {
    baseUrl,
    fetchApi
  };

  const SignMessageResponse = t.interface({
    response: t.string
  });

  type SignMessageResponse = t.TypeOf<typeof SignMessageResponse>;

  type SignMessageT = IPostApiRequestType<
    {
      readonly Bearer: string;
      readonly message: string;
    },
    "Authorization" | "Content-Type",
    never,
    LollipopBaseResponseType<SignMessageResponse>
  >;

  const signMessageT: SignMessageT = {
    method: "post",
    url: () => "/first-lollipop/sign",
    query: _ => ({}),
    body: body => JSON.stringify({ message: body.message }),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    response_decoder: lollipopBaseMessageResponseDecoder(SignMessageResponse)
  };

  const withBearerToken = withToken(token);
  return {
    postSignMessage: (lollipopConfig: LollipopConfig) => {
      const lpFetch = lollipopFetch(lollipopConfig, keyInfo);
      return withBearerToken(
        createFetchRequestForApi(signMessageT, {
          ...options,
          fetchApi: lpFetch
        })
      );
    }
  };
}
