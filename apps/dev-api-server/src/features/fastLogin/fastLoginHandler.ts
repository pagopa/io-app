import { Request } from "express";

import { createOrRefreshEverySessionToken } from "../../persistence/sessionInfo";
import { checkNonceFromRequest, getNonceInfo } from "./nonceHandler";

export const refreshTokenWithFastLogin = (
  request: Request
): string | undefined => {
  const nonceInfo = getNonceInfo();
  const containsNonce = checkNonceFromRequest(request, nonceInfo);
  if (!containsNonce) {
    return undefined;
  }
  return createOrRefreshEverySessionToken();
};
