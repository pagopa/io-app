import { KeyInfo } from "../../lollipop/utils/crypto";
import { LollipopConfig } from "../../lollipop";
import { lollipopFetch } from "../../lollipop/utils/fetch";
import { LollipopMethodEnum } from "../../../../definitions/lollipop/LollipopMethod";
import { LollipopOriginalURL } from "../../../../definitions/lollipop/LollipopOriginalURL";
import { LollipopSignatureInput } from "../../../../definitions/lollipop/LollipopSignatureInput";
import { LollipopSignature } from "../../../../definitions/lollipop/LollipopSignature";
import { defaultRetryingFetch } from "../../../utils/fetch";
import { createClient, createLollipopClient } from "./mockedClients";

// fastLogin call
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
  createLollipopClient({
    baseUrl,
    fetchApi: lollipopFetch(lollipopConfig, keyInfo, 1)
  });

// getNonce call

export const performGetNonce = async (nonceClient: GetNonceClient) =>
  await nonceClient.getNonce({} as never);

type GetNonceClient = ReturnType<typeof createNonceClient>;

export const createNonceClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });
