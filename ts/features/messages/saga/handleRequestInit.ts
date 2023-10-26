import { call, select } from "typed-redux-saga/macro";
import { UIAttachment } from "../../../store/reducers/entities/messages/types";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../../lollipop/store/reducers/lollipop";
import { generateKeyInfo } from "../../lollipop/saga";
import { LollipopConfig } from "../../lollipop";
import { lollipopRequestInit } from "../../lollipop/utils/fetch";
import { isTestEnv } from "../../../utils/environment";

type HeaderType = Record<string, string>;

export function* handleRequestInit(
  attachment: UIAttachment,
  bearerToken: string,
  nonce: string
) {
  const lollopopConfig: LollipopConfig = {
    nonce
  };

  const keyTag = yield* select(lollipopKeyTagSelector);
  const publicKey = yield* select(lollipopPublicKeySelector);
  const keyInfo = yield* call(generateKeyInfo, keyTag, publicKey);

  const attachmentFullUrl = attachment.resourceUrl.href;

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
