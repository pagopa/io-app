import { createClient } from "../../../../definitions/fci/client";
import { LollipopConfig } from "../../lollipop";
import { defaultRetryingFetch } from "../../../utils/fetch";
import { KeyInfo } from "../../lollipop/utils/crypto";
import { lollipopFetch } from "../../lollipop/utils/fetch";

const createFciClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

const createFciClientWithLollipop = (
  baseUrl: string,
  keyInfo: KeyInfo = {},
  lollipopConfig: LollipopConfig
) =>
  createClient({
    baseUrl,
    fetchApi: lollipopFetch(lollipopConfig, keyInfo)
  });

export type FciClient = ReturnType<typeof createFciClient>;
export type FciLollipopClient = ReturnType<typeof createFciClientWithLollipop>;

export { createFciClient, createFciClientWithLollipop };
