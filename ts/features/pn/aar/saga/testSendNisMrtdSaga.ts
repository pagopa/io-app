import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
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
import { testAarCreateMandate } from "../store/actions";

export function* testAarCreateMandateSaga(
  sendAARClient: SendAARClient,
  sessionToken: SessionToken
) {
  try {
    const createAARMandateRequest = sendAARClient.createAARMandate({
      Bearer: `Bearer ${sessionToken}`,
      body: {
        aarQrCodeValue:
          "https://cittadini.notifichedigitali.it/io?aar=U0VORC1TRU5ELVNFTkQtMDAwMDA0LUEtMF9QRi0yMTg0ZGE3OC03YzU2LTQ2OGItYTAxNy0wOGVkODczZjA5NDZfOTBiNDllMmItZjVlNS00ZTdkLWI0Y2YtOWVlN2Y0NDFkNTE0"
        // "https://cittadini.uat.notifichedigitali.it/io/?aar=UldKRy1XSkFNLVdaTEgtMjAyNTEyLVYtMV9QRi0wZmNlMzc0Yy0wM2ViLTQwNmUtODM0NS01OGI4ZGYzMjk5MTdfNmFlNTZjZjAtMjhmYS00M2U1LTgyMWEtMjEwMjUxOTkzNTdh"
      }
      // TODO isTest
    });
    const result = (yield* call(
      withRefreshApiCall,
      createAARMandateRequest
    )) as unknown as SagaCallReturnType<typeof sendAARClient.createAARMandate>;

    if (E.isLeft(result)) {
      const reason = `Decoding failure (${readableReportSimplified(
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
        throw Error("401 Fast login expired");
      default:
        const reason = `HTTP request failed (${aarProblemJsonAnalyticsReport(
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

/*
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
*/
