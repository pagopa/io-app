import { createClient } from "../../../../definitions/lollipop/client";
import { LollipopConfig } from "../../lollipop";
import { KeyInfo } from "../../lollipop/utils/crypto";
import { lollipopFetch } from "../../lollipop/utils/fetch";

const createLollipopClient = (
  baseUrl: string,
  keyInfo: KeyInfo = {},
  lollipopConfig: LollipopConfig
) =>
  createClient({
    baseUrl,
    fetchApi: lollipopFetch(lollipopConfig, keyInfo)
  });

export type LollipopClient = ReturnType<typeof createLollipopClient>;

export { createLollipopClient };
