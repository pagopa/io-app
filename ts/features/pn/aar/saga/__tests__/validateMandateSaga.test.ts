import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { AARProblemJson } from "../../../../../../definitions/pn/aar/AARProblemJson";
import { isPnTestEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import {
  aarProblemJsonAnalyticsReport,
  trackSendAARFailure
} from "../../analytics";
import { setAarFlowState } from "../../store/actions";
import { AARFlowState, sendAARFlowStates } from "../../utils/stateUtils";
import {
  sendAarMockStateFactory,
  sendAarMockStates
} from "../../utils/testUtils";
import {
  AcceptMandateSuccessfulResponse,
  validateMandateSaga
} from "../validateMandateSaga";

const mockValidatingMandateState = sendAarMockStateFactory.validatingMandate();
const mockValidatingMandateAction = setAarFlowState(mockValidatingMandateState);
const aarStatesWithoutValidatingMandate = sendAarMockStates.filter(
  ({ type }) => type !== mockValidatingMandateState.type
);
const sessionToken = "mock-session-token";
const sessionTokenWithBearer = `Bearer ${sessionToken}`;

const mockAcceptMandate = jest.fn();

const getMockKoState = (
  prevState: AARFlowState,
  error: AARProblemJson | undefined,
  reason: string
): AARFlowState => ({
  type: "ko",
  previousState: { ...prevState },
  ...(error != null && { error }),
  debugData: {
    phase: "Validate Mandate",
    reason
  }
});

jest.mock("../../analytics");

describe("validateMandateSaga", () => {
  afterEach(jest.clearAllMocks);

  it.each([false, true])(
    'should call "acceptIOMandate" with the right values (isSendUATEnvironment: %s)',
    isSendUATEnvironment => {
      testSaga(
        validateMandateSaga,
        mockAcceptMandate,
        sessionToken,
        mockValidatingMandateAction
      )
        .next()
        .select(isPnTestEnabledSelector)
        .next(isSendUATEnvironment);

      const { mandateId, nisData, mrtdData, signedVerificationCode } =
        mockValidatingMandateState;

      expect(mockAcceptMandate).toHaveBeenCalledWith({
        Bearer: sessionTokenWithBearer,
        body: {
          nisData: {
            nis: nisData.nis,
            pub_key: nisData.publicKey,
            sod: nisData.sod
          },
          signedNonce: signedVerificationCode,
          mrtdData
        },
        isTest: isSendUATEnvironment,
        mandateId
      });
    }
  );

  it.each(aarStatesWithoutValidatingMandate)(
    'should exit early when called with state "$type"',
    payload => {
      testSaga(
        validateMandateSaga,
        mockAcceptMandate,
        sessionToken,
        setAarFlowState(payload)
      )
        .next()
        .call(
          trackSendAARFailure,
          "Validate Mandate",
          `Called in wrong state (${payload.type})`,
          undefined
        )
        .next()
        .isDone();
    }
  );

  it(`should dispatch "setAarFlowState" with type: "${sendAARFlowStates.fetchingNotificationData}" on a 204`, () => {
    const successState: AARFlowState = {
      type: sendAARFlowStates.fetchingNotificationData,
      iun: mockValidatingMandateState.iun,
      recipientInfo: { ...mockValidatingMandateState.recipientInfo },
      mandateId: mockValidatingMandateState.mandateId
    };

    testSaga(
      validateMandateSaga,
      mockAcceptMandate,
      sessionToken,
      mockValidatingMandateAction
    )
      .next()
      .select(isPnTestEnabledSelector)
      .next(true)
      .call(
        withRefreshApiCall,
        mockAcceptMandate(),
        mockValidatingMandateAction
      )
      .next(
        E.right({
          headers: {},
          status: 204
        })
      )
      .put(setAarFlowState(successState))
      .next()
      .isDone();
  });

  it.each([
    {
      name: "500 generic error",
      res: E.right({
        status: 500,
        value: { status: 500, detail: "A detail" }
      })
    },
    {
      name: "404 generic error",
      res: E.right({
        status: 404,
        value: { status: 404, detail: "A detail" }
      })
    },
    {
      name: "418 generic error",
      res: E.right({
        status: 418,
        value: { status: 418, detail: "A detail" }
      })
    },
    {
      name: "422 CIE_EXPIRED_ERROR",
      res: E.right({
        status: 422,
        value: {
          status: 422,
          detail: "A detail",
          errors: [{ code: "CIE_EXPIRED_ERROR" }]
        }
      })
    },
    {
      name: "422 CIE_NOT_RELATED_TO_DELEGATOR_ERROR",
      res: E.right({
        status: 422,
        value: {
          status: 422,
          detail: "A detail",
          errors: [{ code: "CIE_NOT_RELATED_TO_DELEGATOR_ERROR" }]
        }
      })
    },
    {
      name: "500 with body status 422 CIE_NOT_RELATED_TO_DELEGATOR_ERROR",
      res: E.right({
        status: 500,
        value: {
          status: 422,
          detail: "A detail",
          errors: [{ code: "CIE_NOT_RELATED_TO_DELEGATOR_ERROR" }]
        }
      })
    },
    {
      name: "500 with body status 422 CIE_EXPIRED_ERROR",
      res: E.right({
        status: 500,
        value: {
          status: 422,
          detail: "A detail",
          errors: [{ code: "CIE_EXPIRED_ERROR" }]
        }
      })
    }
  ] as Array<{ name: string; res: AcceptMandateSuccessfulResponse }>)(
    "should dispatch the correct KO state for $name",
    ({ res }) => {
      const error = res.right.value;
      const reason = `HTTP request failed (${aarProblemJsonAnalyticsReport(
        res.right.status,
        res.right.value!
      )})`;

      testSaga(
        validateMandateSaga,
        mockAcceptMandate,
        sessionToken,
        mockValidatingMandateAction
      )
        .next()
        .select(isPnTestEnabledSelector)
        .next(true)
        .call(
          withRefreshApiCall,
          mockAcceptMandate(),
          mockValidatingMandateAction
        )
        .next(res)
        .call(trackSendAARFailure, "Validate Mandate", reason, error)
        .next()
        .put(
          setAarFlowState(
            getMockKoState(mockValidatingMandateState, error, reason)
          )
        )
        .next()
        .isDone();
    }
  );

  it('should call "trackSendAARFailure" with "Fast login expiration" and stop on 401', () => {
    testSaga(
      validateMandateSaga,
      mockAcceptMandate,
      sessionToken,
      mockValidatingMandateAction
    )
      .next()
      .select(isPnTestEnabledSelector)
      .next(true)
      .call(
        withRefreshApiCall,
        mockAcceptMandate(),
        mockValidatingMandateAction
      )
      .next(
        E.right({
          headers: {},
          status: 401,
          value: {}
        })
      )
      .call(
        trackSendAARFailure,
        "Validate Mandate",
        "Fast login expiration",
        undefined
      )
      .next()
      .isDone();
  });

  it("should dispatch KO state on exception throw", () => {
    testSaga(
      validateMandateSaga,
      mockAcceptMandate,
      sessionToken,
      mockValidatingMandateAction
    )
      .next()
      .select(isPnTestEnabledSelector)
      .next(true)
      .call(
        withRefreshApiCall,
        mockAcceptMandate(),
        mockValidatingMandateAction
      )
      .throw(new Error())
      .call(
        trackSendAARFailure,
        "Validate Mandate",
        "An error was thrown ()",
        undefined
      )
      .next()
      .put(
        setAarFlowState(
          getMockKoState(
            mockValidatingMandateState,
            undefined,
            `An error was thrown ()`
          )
        )
      )
      .next()
      .isDone();
  });
  it("should dispatch KO state on a decoding failure", () => {
    const failureReason = "An error was thrown (Decoding failure ())";

    testSaga(
      validateMandateSaga,
      mockAcceptMandate,
      sessionToken,
      mockValidatingMandateAction
    )
      .next()
      .select(isPnTestEnabledSelector)
      .next(true)
      .call(
        withRefreshApiCall,
        mockAcceptMandate(),
        mockValidatingMandateAction
      )
      .next(E.left([]))
      .call(trackSendAARFailure, "Validate Mandate", failureReason, undefined)
      .next()
      .put(
        setAarFlowState(
          getMockKoState(mockValidatingMandateState, undefined, failureReason)
        )
      )
      .next()
      .isDone();
  });
});
