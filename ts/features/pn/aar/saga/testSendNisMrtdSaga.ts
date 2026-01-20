import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { SessionToken } from "../../../../types/SessionToken";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { SendAARClient } from "../api/client";
import { SagaCallReturnType } from "../../../../types/utils";
import {
  aarProblemJsonAnalyticsReport,
  trackSendAARFailure
} from "../analytics";
import { unknownToReason } from "../../../messages/utils";
import { testAarAcceptMandate, testAarCreateMandate } from "../store/actions";
import { sendMandateIdSelector } from "../store/reducers/tempAarMandate";

export function* testAarCreateMandateSaga(
  sendAARClient: SendAARClient,
  sessionToken: SessionToken,
  action: ReturnType<typeof testAarCreateMandate.request>
) {
  try {
    const createAARMandateRequest = sendAARClient.createAARMandate({
      Bearer: `Bearer ${sessionToken}`,
      body: {
        aarQrCodeValue: action.payload
      },
      isTest: true
    });
    const result = (yield* call(
      withRefreshApiCall,
      createAARMandateRequest
    )) as unknown as SagaCallReturnType<typeof sendAARClient.createAARMandate>;

    if (E.isLeft(result)) {
      const reason = `Create mandate decoding failure (${readableReportSimplified(
        result.left
      )})`;
      throw Error(reason);
    }

    const { status, value } = result.right;
    switch (status) {
      case 201:
        yield* put(testAarCreateMandate.success(value));
        return;
      case 401:
        throw Error("Create mandate 401 Fast login expired");
      default:
        const reason = `Create mandate HTTP request failed (${aarProblemJsonAnalyticsReport(
          status,
          value
        )})`;
        throw Error(reason);
    }
  } catch (e) {
    const reason = unknownToReason(e);
    yield* call(trackSendAARFailure, "Playground", reason);
    yield* put(testAarCreateMandate.failure(reason));
  }
}

export function* testAarAcceptMandateSaga(
  sendAARClient: SendAARClient,
  sessionToken: SessionToken,
  action: ReturnType<typeof testAarAcceptMandate.request>
) {
  const mandateId = yield* select(sendMandateIdSelector);
  try {
    if (mandateId == null) {
      throw Error(`Accept mandate: nullish mandateid (${mandateId})`);
    }
    const acceptAarMandateRequest = sendAARClient.acceptAARMandate({
      Bearer: `Bearer ${sessionToken}`,
      mandateId,
      body: {
        mrtdData: {
          dg1: action.payload.mrtd_data.dg1,
          dg11: action.payload.mrtd_data.dg11,
          sod: action.payload.mrtd_data.sod
        },
        nisData: {
          nis: action.payload.nis_data.nis,
          pub_key: action.payload.nis_data.publicKey,
          sod: action.payload.nis_data.sod
        },
        signedNonce: action.payload.nis_data.signedChallenge
      },
      isTest: true
    });
    const result = (yield* call(
      withRefreshApiCall,
      acceptAarMandateRequest
    )) as unknown as SagaCallReturnType<typeof sendAARClient.acceptAARMandate>;

    if (E.isLeft(result)) {
      const reason = `Accept mandate decoding failure (${readableReportSimplified(
        result.left
      )})`;
      throw Error(reason);
    }

    const { status, value } = result.right;
    switch (status) {
      case 204:
        yield* put(testAarAcceptMandate.success());
        return;
      case 401:
        throw Error("Accept mandate 401 Fast login expired");
      default:
        const reason = `Accept mandate HTTP request failed (${aarProblemJsonAnalyticsReport(
          status,
          value
        )})`;
        throw Error(reason);
    }
  } catch (e) {
    const reason = unknownToReason(e);
    yield* call(trackSendAARFailure, "Playground", reason);
    yield* put(testAarAcceptMandate.failure(reason));
  }
}
