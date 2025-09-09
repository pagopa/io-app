import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { SessionToken } from "../../../../types/SessionToken";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { createSendAARClientWithLollipop } from "../api/client";
import { apiUrlPrefix } from "../../../../config";
import { setAarFlowState } from "../store/actions";
import { exampleCheckQRCodeSaga } from "./exampleCheckQRCodeSaga";
import { exampleGetNotificationSaga } from "./exampleGetNotificationSaga";
import { exampleGetAttachmentMetadataSaga } from "./exampleGetAttachmentMetadatSaga";

export function* watchSendAARSaga(
  bearerToken: SessionToken,
  keyInfo: KeyInfo
): SagaIterator {
  const sendAARClient = createSendAARClientWithLollipop(apiUrlPrefix, keyInfo);

  // This is just an example! There must be only a main saga, calling the others
  yield* takeLatest(
    getType(setAarFlowState),
    exampleCheckQRCodeSaga,
    sendAARClient.checkQRCode,
    bearerToken
  );

  // This is just an example! There must be only a main saga, calling the others
  yield* takeLatest(
    getType(setAarFlowState),
    exampleGetNotificationSaga,
    sendAARClient.getNotification,
    bearerToken
  );

  // This is just an example! There must be only a main saga, calling the others
  yield* takeLatest(
    getType(setAarFlowState),
    exampleGetAttachmentMetadataSaga,
    sendAARClient.getNotificationAttachment,
    bearerToken
  );
}
