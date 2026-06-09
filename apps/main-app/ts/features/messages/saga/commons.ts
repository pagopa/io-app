import { call } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../config";
import { getKeyInfo } from "../../lollipop/saga";
import { communicationClientManager } from "../../../api/CommunicationClientManager";

export function* getCommunicationClient(sessionToken: string) {
  const keyInfo = yield* call(getKeyInfo);

  return communicationClientManager.getClient(apiUrlPrefix, {
    token: sessionToken,
    keyInfo
  });
}
