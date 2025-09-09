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

export function* exampleCheckQRCodeSaga(
  checkQRCodeFactory: SendAARClient["checkQRCode"],
  bearerToken: string,
  action: ActionType<typeof setAarFlowState>
) {
  const checkQRCodeRequest = checkQRCodeFactory({
    Bearer: `Bearer ${bearerToken}`,
    body: {
      qrcode:
        "https://cittadini.notifichedigitali.it/io?aar=MDAwMDAwMDAwMDAwMDAwMDAwMDAwNFNFTkRfUEYtOGJhNDdkNDItZWQzZC00MTJhLTkzMjUtYjYxODAwNGQ5M2ZiX2E5NTRiMDZhLWZiNDItNDQzOS04ODNhLTkzOGM0ZDFhYjA0Mw=="
    },
    isTest: true
  });

  try {
    const checkQRCodeResponseEither = (yield* call(
      withRefreshApiCall,
      checkQRCodeRequest,
      action
    )) as SagaCallReturnType<typeof checkQRCodeFactory>;
    if (isRight(checkQRCodeResponseEither)) {
      const checkQRCodeResponse = checkQRCodeResponseEither.right;
      if (checkQRCodeResponse.status === 200) {
        const { denomination, iun, mandateId } = checkQRCodeResponse.value;
        // TODO dispatch success
        console.log(`${denomination}, ${iun}, ${mandateId}`);
      } else if (checkQRCodeResponse.status === 403) {
        const { denomination, iun } = checkQRCodeResponse.value;
        // TODO dispatch failure but mandate available
        console.log(`${denomination}, ${iun}`);
      } else {
        const problemJson = checkQRCodeResponse.value;
        throw Error(
          `${checkQRCodeResponse.status} ${problemJson.status} ${problemJson.title} ${problemJson.detail} ${problemJson.type}  ${problemJson.instance}`
        );
      }
    } else {
      const reason = readableReportSimplified(checkQRCodeResponseEither.left);
      throw Error(reason);
    }
  } catch (e) {
    const reason = unknownToReason(e);
    // TODO dispatch failure
    // TODO mixpanel track
    console.log(reason);
  }
}
