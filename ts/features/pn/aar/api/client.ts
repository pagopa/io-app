import { v4 as uuid } from "uuid";
import { createClient } from "../../../../../definitions/pn/aar/client";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { lollipopFetch } from "../../../lollipop/utils/fetch";

export const createSendAARClientWithLollipop = (
  baseUrl: string,
  keyInfo: KeyInfo = {}
) =>
  createClient({
    baseUrl,
    fetchApi: lollipopFetch({ nonce: uuid() }, keyInfo)
  });

export type SendAARClient = ReturnType<typeof createSendAARClientWithLollipop>;
