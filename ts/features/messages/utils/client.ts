import { call } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../config";
import { getKeyInfo } from "../../lollipop/saga";
import { communicationClientManager } from "../../../api/CommunicationClientManager";

export function* getCommunicationClient(sessionToken: string) {
  const keyInfo = yield* call(getKeyInfo);
  const client = yield* call(
    communicationClientManager.getClient,
    apiUrlPrefix,
    {
      token: sessionToken,
      keyInfo
    }
  );

  return client;
}
