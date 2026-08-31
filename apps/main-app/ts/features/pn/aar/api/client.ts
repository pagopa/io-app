import { createClient } from "@io-app/api-types/generated/definitions/pn/aar/client";
import { v4 as uuid } from "uuid";

import { KeyInfo } from "../../../lollipop/utils/crypto";
import { lollipopFetch } from "../../../lollipop/utils/fetch";

export const createSendAarClientWithLollipop = (
  baseUrl: string,
  keyInfo: KeyInfo = {}
) =>
  createClient({
    baseUrl,
    fetchApi: lollipopFetch({ nonce: uuid() }, keyInfo)
  });

export type SendAarClient = ReturnType<typeof createSendAarClientWithLollipop>;
