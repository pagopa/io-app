import * as E from "fp-ts/lib/Either";
import { call } from "typed-redux-saga/macro";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { InternalAuthAndMrtdResponse } from "@pagopa/io-react-native-cie";
import { SessionToken } from "../../../../types/SessionToken";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { SendAARClient } from "../api/client";
import { testSendNisMrtdRequestAction } from "../store/actions";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../../types/utils";
import { aarProblemJsonAnalyticsReport } from "../analytics";
import { unknownToReason } from "../../../messages/utils";

export function* testSendNisMrtdSaga(
  sendAARClient: SendAARClient,
  sessionToken: SessionToken,
  action: ReturnType<typeof testSendNisMrtdRequestAction.request>
) {
  const { encodedChallenge, result } = action.payload;
  const mandateId = yield* call(bla, sendAARClient, sessionToken, action);
  console.log(mandateId);
  yield* call(
    blo,
    sendAARClient,
    sessionToken,
    mandateId,
    result,
    encodedChallenge,
    action
  );
}

function* bla(
  sendAARClient: SendAARClient,
  sessionToken: SessionToken,
  action: ReturnType<typeof testSendNisMrtdRequestAction.request>
): Generator<ReduxSagaEffect, string> {
  try {
    const createAARMandateRequest = sendAARClient.createAARMandate({
      Bearer: `Bearer ${sessionToken}`,
      body: {
        aarQrCodeValue:
          "https://cittadini.notifichedigitali.it/io?aar=U0VORC1TRU5ELVNFTkQtMDAwMDA0LUEtMF9QRi0zZjNmODEyOC1iMWMzLTQyMDQtYWRhYy0zZjgzMjdjMTkyNWFfOGIxM2NhZGMtZjQ4YS00MjliLWEzMmMtOGQ3OTkzYmFlNzQz"
      }
      // TODO isTest
    });
    const result = (yield* call(
      withRefreshApiCall,
      createAARMandateRequest,
      action
    )) as unknown as SagaCallReturnType<typeof sendAARClient.createAARMandate>;

    if (E.isLeft(result)) {
      const reason = `Decoding failure (${readableReportSimplified(
        result.left
      )})`;
      // yield* call(trackSendAARFailure, "", reason);
      // yield* put();
      return;
    }

    const { status, value } = result.right;
    console.log(result.right);
    switch (status) {
      case 201:
        console.log(value);
        return value.mandate.mandateId;
      case 400:
        return;
      case 401:
        return;
      default:
        const reason = `HTTP request failed (${aarProblemJsonAnalyticsReport(
          status,
          value
        )})`;
        // yield* call(trackSendAARFailure, sendAARFailurePhase, reason);
        return;
    }
  } catch (e) {
    const reason = `An error was thrown (${unknownToReason(e)})`;
    // yield* call(trackSendAARFailure, sendAARFailurePhase, reason);
  }
  throw Error("Unexpected");
}

function* blo(
  sendAARClient: SendAARClient,
  sessionToken: SessionToken,
  mandateId: string,
  data: InternalAuthAndMrtdResponse,
  signedNonce: string,
  action: ReturnType<typeof testSendNisMrtdRequestAction.request>
) {
  console.log(mandateId);
  try {
    const acceptIOMandateRequest = sendAARClient.acceptIOMandate({
      Bearer: `Bearer ${sessionToken}`,
      mandateId,
      body: {
        signedNonce,
        mrtdData: {
          dg1: "dg1",
          dg11: "dg11",
          sod: "sod"
        },
        nisData: {
          nis: "nis",
          pub_key: "pub_key",
          sod: "sod"
        }
      }
    });
    const result = (yield* call(
      withRefreshApiCall,
      acceptIOMandateRequest,
      action
    )) as unknown as SagaCallReturnType<typeof sendAARClient.acceptIOMandate>;

    if (E.isLeft(result)) {
      const reason = `Decoding failure (${readableReportSimplified(
        result.left
      )})`;
      // yield* call(trackSendAARFailure, "", reason);
      // yield* put();
      return;
    }

    const { status, value } = result.right;
    switch (status) {
      case 204:
        console.log(`Success!!!`);
        return;
      case 400:
        return;
      case 401:
        return;
      case 422:
        return;
      default:
        const reason = `HTTP request failed (${aarProblemJsonAnalyticsReport(
          status,
          value
        )})`;
        // yield* call(trackSendAARFailure, sendAARFailurePhase, reason);
        return;
    }
  } catch (e) {
    const reason = `An error was thrown (${unknownToReason(e)})`;
    // yield* call(trackSendAARFailure, sendAARFailurePhase, reason);
  }
}
