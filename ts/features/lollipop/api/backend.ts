import { LollipopContentDigest } from "../../../../definitions/lollipop/LollipopContentDigest";
import { LollipopMethodEnum } from "../../../../definitions/lollipop/LollipopMethod";
import { LollipopOriginalURL } from "../../../../definitions/lollipop/LollipopOriginalURL";
import { LollipopSignature } from "../../../../definitions/lollipop/LollipopSignature";
import { LollipopSignatureInput } from "../../../../definitions/lollipop/LollipopSignatureInput";
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
