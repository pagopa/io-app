import { v4 as uuid } from "uuid";
import { createClient } from "../../../../../definitions/pn/lollipop-lambda/client";
import { SessionToken } from "../../../../types/SessionToken";
import { lollipopFetch } from "../../../lollipop/utils/fetch";
import { KeyInfo } from "../../../lollipop/utils/crypto";

export const createSendLollipopLambdaClient = (
  baseUrl: string,
  sessionToken: SessionToken,
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
