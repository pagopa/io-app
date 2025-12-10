import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/Either";
import { testSaga } from "redux-saga-test-plan";
import { isPnTestEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import {
  aarProblemJsonAnalyticsReport,
  trackSendAARFailure
} from "../../analytics";
import { setAarFlowState } from "../../store/actions";
import { sendAARFlowStates } from "../../utils/stateUtils";
import {
  sendAarMockStateFactory,
  sendAarMockStates
} from "../../utils/testUtils";
import { createAarMandateSaga } from "../createAarMandateSaga";

const sessionToken = "token" as any;
const createAarMandateMock = jest.fn();
const currentState = sendAarMockStateFactory.creatingMandate();
const mockAction = setAarFlowState(currentState);

describe("createAarMandateSaga", () => {
  sendAarMockStates
    .filter(state => state.type !== sendAARFlowStates.creatingMandate)
    .forEach(state => {
      it(`should early exit and track failure if not in creatingMandate state -- state: ${state.type}`, () => {
        testSaga(
          createAarMandateSaga,
          jest.fn(),
          sessionToken,
          setAarFlowState(state)
        )
          .next()
          .call(
            trackSendAARFailure,
            "Create Mandate",
            `Called in wrong state (${state.type})`
          )
          .next()
          .isDone();
      });
    });
  it("should handle an api response that cannot be decoded", () => {
    const failureDecodingResponse = E.left([]);

    const failureReason = "An error was thrown (Decoding failure ())";
    testSaga(
      createAarMandateSaga,
      createAarMandateMock,
      sessionToken,
      mockAction
    )
      .next()
      .select(isPnTestEnabledSelector)
      .next(false)
      .call(withRefreshApiCall, createAarMandateMock(), mockAction)
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
    const mandateResponse = E.right({
      status: 201,
      value: { mandate }
    });

    testSaga(
      createAarMandateSaga,
      createAarMandateMock,
      sessionToken,
      mockAction
    )
      .next()
      .select(isPnTestEnabledSelector)
      .next(true)
      .call(withRefreshApiCall, createAarMandateMock(), mockAction)
      .next(mandateResponse)
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
  it("should handle a mandate with missing fields in 201 response", () => {
    const errorReason =
      "An error was thrown (invalid mandateId or verification code)";
    const mandate = {
      verificationCode: undefined,
      mandateId: undefined
    };
    const mandateResponse = E.right({
      status: 201,
      value: { mandate }
    });

    testSaga(
      createAarMandateSaga,
      createAarMandateMock,
      sessionToken,
      mockAction
    )
      .next()
      .select(isPnTestEnabledSelector)
      .next(true)
      .call(withRefreshApiCall, createAarMandateMock(), mockAction)
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
  it("should handle a 401 response", () => {
    const mandateResponse = E.right({
      status: 401,
      value: {}
    });

    testSaga(
      createAarMandateSaga,
      createAarMandateMock,
      sessionToken,
      mockAction
    )
      .next()
      .select(isPnTestEnabledSelector)
      .next(true)
      .call(withRefreshApiCall, createAarMandateMock(), mockAction)
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

      testSaga(
        createAarMandateSaga,
        createAarMandateMock,
        sessionToken,
        mockAction
      )
        .next()
        .select(isPnTestEnabledSelector)
        .next(true)
        .call(withRefreshApiCall, createAarMandateMock(), mockAction)
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
