import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/Either";
import { testSaga } from "redux-saga-test-plan";
import { isPnTestEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import {
  aarProblemJsonAnalyticsReport,
  trackSendAARFailure
} from "../../analytics";
import { SendAARClient } from "../../api/client";
import { setAarFlowState } from "../../store/actions";
import { currentAARFlowData } from "../../store/selectors";
import { sendAARFlowStates } from "../../utils/stateUtils";
import { sendAarMockStateFactory } from "../../utils/testUtils";
import { createAarMandateSaga } from "../createAarMandateSaga";

const sessionToken = "token" as any;
const mockAction = setAarFlowState({
  type: "creatingMandate",
  qrCode: "qr",
  iun: "iun",
  recipientInfo: {}
} as any);

const mockResolvedCall = (resolved: any) =>
  new Promise((res, _reject) => res(resolved)) as unknown as ReturnType<
    SendAARClient["createAARMandate"]
  >;
const currentState = sendAarMockStateFactory.creatingMandate();
describe("createAarMandateSaga", () => {
  it("should early exit and track failure if not in creatingMandate state", () => {
    testSaga(createAarMandateSaga, jest.fn(), sessionToken, mockAction)
      .next()
      .select(currentAARFlowData)
      .next({ type: "otherState" })
      .call(
        trackSendAARFailure,
        "Create Mandate",
        "Called in wrong state (otherState)"
      )
      .next()
      .isDone();
  });
  it("should handle an api response that cannot be decoded", () => {
    const failureDecodingResponse = E.left([]);
    const createAarMandate = jest
      .fn()
      .mockReturnValue(mockResolvedCall(failureDecodingResponse));

    const failureReason = "An error was thrown (Decoding failure ())";
    testSaga(createAarMandateSaga, createAarMandate, sessionToken, mockAction)
      .next()
      .select(currentAARFlowData)
      .next(currentState)
      .select(isPnTestEnabledSelector)
      .next(false)
      .call(withRefreshApiCall, createAarMandate(), mockAction)
      .next(failureDecodingResponse)
      .call(trackSendAARFailure, "Create Mandate", failureReason)
      .next()
      .put(
        setAarFlowState({
          type: sendAARFlowStates.ko,
          previousState: currentState,
          debugData: {
            phase: "Create Mandate",
            reason: failureReason
          }
        })
      )
      .next()
      .isDone();
  });
  it("should handle a 201 success response", () => {
    const mandate = {
      verificationCode: "code" as NonEmptyString,
      mandateId: "id" as NonEmptyString
    };
    const mandateResponse = {
      status: 201,
      value: { mandate }
    };

    const createAarMandate = jest
      .fn()
      .mockReturnValue(mockResolvedCall(E.right(mandateResponse)));

    testSaga(createAarMandateSaga, createAarMandate, sessionToken, mockAction)
      .next()
      .select(currentAARFlowData)
      .next(currentState)
      .select(isPnTestEnabledSelector)
      .next(true)
      .call(withRefreshApiCall, createAarMandate(), mockAction)
      .next(E.right(mandateResponse))
      .put(
        setAarFlowState({
          type: "cieCanAdvisory",
          iun: currentState.iun,
          recipientInfo: currentState.recipientInfo,
          mandateId: mandate.mandateId,
          verificationCode: mandate.verificationCode
        })
      )
      .next()
      .isDone();
  });
  it("should handle a 401 response", () => {
    const mandateResponse = E.right({
      status: 401,
      value: {}
    });

    const createAarMandate = jest
      .fn()
      .mockReturnValue(mockResolvedCall(mandateResponse));

    testSaga(createAarMandateSaga, createAarMandate, sessionToken, mockAction)
      .next()
      .select(currentAARFlowData)
      .next(currentState)
      .select(isPnTestEnabledSelector)
      .next(true)
      .call(withRefreshApiCall, createAarMandate(), mockAction)
      .next(mandateResponse)
      .call(trackSendAARFailure, "Create Mandate", "Fast login expiration")
      .next()
      .isDone();
  });
  [404, 500, 400, 418].forEach(status => {
    it(`should handle and track a ${status} response `, () => {
      const mandateResponse = E.right({
        status,
        value: {
          status,
          detail: "detail"
        }
      });

      const errorReason = `An error was thrown (HTTP request failed (${aarProblemJsonAnalyticsReport(
        status,
        {
          status: status as 599,
          detail: "detail"
        }
      )}))`;

      const createAarMandate = jest
        .fn()
        .mockReturnValue(mockResolvedCall(mandateResponse));

      testSaga(createAarMandateSaga, createAarMandate, sessionToken, mockAction)
        .next()
        .select(currentAARFlowData)
        .next(currentState)
        .select(isPnTestEnabledSelector)
        .next(true)
        .call(withRefreshApiCall, createAarMandate(), mockAction)
        .next(mandateResponse)
        .call(trackSendAARFailure, "Create Mandate", errorReason)
        .next()
        .put(
          setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: currentState,
            debugData: {
              phase: "Create Mandate",
              reason: errorReason
            }
          })
        )
        .next()
        .isDone();
    });
  });
});
