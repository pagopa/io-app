import { createClient } from "@io-app/api-types/generated/definitions/pn/lollipop-lambda/client";
import { v4 as uuid } from "uuid";

import { KeyInfo } from "../../../lollipop/utils/crypto";
import { lollipopFetch } from "../../../lollipop/utils/fetch";

export const createSendLollipopLambdaClient = (
  baseUrl: string,
  sessionToken: string,
  keyInfo: KeyInfo
) =>
  createClient<"Bearer">({
    baseUrl,
    fetchApi: lollipopFetch({ nonce: uuid() }, keyInfo),
    withDefaults: op => params =>
      op({
        ...params,
        Bearer: `Bearer ${sessionToken}`
      })
  });

export type SendLollipopLambdaClient = ReturnType<
  typeof createSendLollipopLambdaClient
>;
