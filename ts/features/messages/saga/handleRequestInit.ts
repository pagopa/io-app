import { v4 as uuid } from "uuid";
import { call } from "typed-redux-saga/macro";
import { LollipopConfig } from "../../lollipop";
import { lollipopRequestInit } from "../../lollipop/utils/fetch";
import { isTestEnv } from "../../../utils/environment";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { attachmentDownloadUrl } from "../store/reducers/transformers";
import { KeyInfo } from "../../lollipop/utils/crypto";

type HeaderType = Record<string, string>;

export function* handleRequestInit(
  attachment: ThirdPartyAttachment,
  messageId: string,
  bearerToken: string,
  keyInfo: KeyInfo
) {
  const lollopopConfig: LollipopConfig = {
    nonce: uuid()
  };

  const attachmentFullUrl = attachmentDownloadUrl(messageId, attachment);

  const requestInit = {
    headers: {
      Authorization: `Bearer ${bearerToken}`
    } as HeaderType,
    method: "GET" as const
  };

  try {
    const lollipopInit = yield* call(
      lollipopRequestInit,
      lollopopConfig,
      keyInfo,
      attachmentFullUrl,
      requestInit
    );
    return handleRequestInitFactory(
      requestInit.method,
      attachmentFullUrl,
      (lollipopInit.headers ?? requestInit.headers) as HeaderType
    );
  } catch {
    // We are not interested in doing anything here, since the
    // later http call will be refused by the lollipop consumer
  }

  return handleRequestInitFactory(
    requestInit.method,
    attachmentFullUrl,
    requestInit.headers
  );
}

const handleRequestInitFactory = (
  method: "GET",
  attachmentFullUrl: string,
  headers: HeaderType
) => ({ method, attachmentFullUrl, headers });

export const testableHandleRequestInitFactory = isTestEnv
  ? handleRequestInitFactory
  : undefined;
