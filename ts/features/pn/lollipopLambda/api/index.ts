import { v4 as uuid } from "uuid";
import { createClient } from "../../../../../definitions/pn/lollipop-lambda/client";
import { lollipopFetch } from "../../../lollipop/utils/fetch";
import { KeyInfo } from "../../../lollipop/utils/crypto";

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
