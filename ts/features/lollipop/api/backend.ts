import { LollipopContentDigest } from "../../../../definitions/auth/LollipopContentDigest";
import { LollipopMethodEnum } from "../../../../definitions/auth/LollipopMethod";
import { LollipopOriginalURL } from "../../../../definitions/auth/LollipopOriginalURL";
import { LollipopSignature } from "../../../../definitions/auth/LollipopSignature";
import { LollipopSignatureInput } from "../../../../definitions/auth/LollipopSignatureInput";
import { createClient } from "../../../../definitions/auth/client";
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

type LollipopSignRequestBody = {
  message: string;
};

const signMessage = async (
  lollipopClient: LollipopClient,
  body: LollipopSignRequestBody,
  sessionToken: string
) =>
  await lollipopClient.signMessage({
    body,
    Bearer: `Bearer ${sessionToken}`,
    "x-pagopa-lollipop-original-method": LollipopMethodEnum.POST,
    "x-pagopa-lollipop-original-url": "" as LollipopOriginalURL,
    "content-digest": "" as LollipopContentDigest,
    "signature-input": "" as LollipopSignatureInput,
    signature: "" as LollipopSignature
  });

type LollipopClient = ReturnType<typeof createLollipopClient>;

export type { LollipopSignRequestBody, LollipopClient };
export { createLollipopClient, signMessage };
