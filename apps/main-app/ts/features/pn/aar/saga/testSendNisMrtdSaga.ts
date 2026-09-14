import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";

import { SagaCallReturnType } from "../../../../types/utils";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { unknownToReason } from "../../../messages/utils";
import {
  aarProblemJsonAnalyticsReport,
  trackSendAarFailure
} from "../analytics";
import { SendAarClient } from "../api/client";
import { testAarAcceptMandate, testAarCreateMandate } from "../store/actions";
import { sendMandateIdSelector } from "../store/reducers/tempAarMandate";

export function* testAarAcceptMandateSaga(
  sendAarClient: SendAarClient,
  sessionToken: string,
  action: ReturnType<typeof testAarAcceptMandate.request>
) {
  const mandateId = yield* select(sendMandateIdSelector);
  try {
    if (mandateId == null) {
      throw Error(`Accept mandate: nullish mandateid (${mandateId})`);
    }
    const acceptAarMandateRequest = sendAarClient.acceptAARMandate({
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
    )) as unknown as SagaCallReturnType<typeof sendAarClient.acceptAARMandate>;

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
        yield* call(trackSendAarFailure, "Playground", reason, value);
        yield* put(testAarAcceptMandate.failure(reason));
        return;
    }
  } catch (e) {
    const reason = unknownToReason(e);
    yield* call(trackSendAarFailure, "Playground", reason, undefined);
    yield* put(testAarAcceptMandate.failure(reason));
  }
}

export function* testAarCreateMandateSaga(
  sendAarClient: SendAarClient,
  sessionToken: string,
  action: ReturnType<typeof testAarCreateMandate.request>
) {
  try {
    const createAarMandateRequest = sendAarClient.createAARMandate({
      Bearer: `Bearer ${sessionToken}`,
      body: {
        aarQrCodeValue: action.payload
      },
      isTest: true
    });
    const result = (yield* call(
      withRefreshApiCall,
      createAarMandateRequest
    )) as unknown as SagaCallReturnType<typeof sendAarClient.createAARMandate>;

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
        yield* call(trackSendAarFailure, "Playground", reason, value);
        yield* put(testAarCreateMandate.failure(reason));
        return;
    }
  } catch (e) {
    const reason = unknownToReason(e);
    yield* call(trackSendAarFailure, "Playground", reason, undefined);
    yield* put(testAarCreateMandate.failure(reason));
  }
}
