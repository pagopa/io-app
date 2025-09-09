/* eslint-disable no-console */
import { call } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { isRight } from "fp-ts/lib/Either";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { SendAARClient } from "../api/client";
import { SagaCallReturnType } from "../../../../types/utils";
import { setAarFlowState } from "../store/actions";
import { unknownToReason } from "../../../messages/utils";

export function* exampleGetNotificationSaga(
  getNotificationFactory: SendAARClient["getNotification"],
  bearerToken: string,
  action: ActionType<typeof setAarFlowState>
) {
  const request = getNotificationFactory({
    Bearer: `Bearer ${bearerToken}`,
    iun: "0000000000000000000003SEND",
    "x-pagopa-pn-io-src": "QRCODE",
    mandateId: undefined,
    isTest: true
  });

  try {
    const responseEither = (yield* call(
      withRefreshApiCall,
      request,
      action
    )) as SagaCallReturnType<typeof getNotificationFactory>;
    if (isRight(responseEither)) {
      const response = responseEither.right;
      if (response.status === 200) {
        const { attachments, details } = response.value;
        // TODO dispatch success
        console.log(`${attachments}, ${details}, ${details?.iun}`);
      } else {
        const problemJson = response.value;
        throw Error(
          `${response.status} ${problemJson.status} ${problemJson.title} ${problemJson.detail} ${problemJson.type}  ${problemJson.instance}`
        );
      }
    } else {
      const reason = readableReportSimplified(responseEither.left);
      throw Error(reason);
    }
  } catch (e) {
    const reason = unknownToReason(e);
    // TODO dispatch failure
    // TODO mixpanel track
    console.log(reason);
  }
}
