import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import {
  AcceptMandateSuccessfulResponse,
  testable,
  validateMandateSaga
} from "../validateMandateSaga";
import { AARFlowState, sendAARFlowStates } from "../../utils/stateUtils";
import {
  sendAarMockStateFactory,
  sendAarMockStates
} from "../../utils/testUtils";
import { SessionToken } from "../../../../../types/SessionToken";
import { setAarFlowState } from "../../store/actions";
import {
  aarProblemJsonAnalyticsReport,
  trackSendAARFailure,
  trackSendAarMandateCieExpiredError,
  trackSendAarMandateCieNotRelatedToDelegatorError
} from "../../analytics";
import { isPnTestEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { AARProblemJson } from "../../../../../../definitions/pn/aar/AARProblemJson";
import { HttpStatusCode } from "../../../../../../definitions/pagopa/ecommerce/HttpStatusCode";

const { handleMixPanelCustomTrackingIfNeeded } = testable!;

const mockValidatingMandateState = sendAarMockStateFactory.validatingMandate();
const mockValidatingMandateAction = setAarFlowState(mockValidatingMandateState);
const aarStatesWithoutValidatingMandate = sendAarMockStates.filter(
  ({ type }) => type !== mockValidatingMandateState.type
);
const sessionToken = "test-session-token" as SessionToken;
const sessionTokenWithBearer = `Bearer ${sessionToken}` as SessionToken;

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

jest.mock("../../analytics", () => ({
  ...jest.requireActual("../../analytics"),
  trackSendAarMandateCieExpiredError: jest.fn(),
  trackSendAarMandateCieNotRelatedToDelegatorError: jest.fn()
}));

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
          `Called in wrong state (${payload.type})`
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
    E.right({
      status: 500,
      value: { status: 500, detail: "A detail" }
    }),
    E.right({
      status: 404,
      value: { status: 404, detail: "A detail" }
    }),
    E.right({
      status: 418,
      value: { status: 418, detail: "A detail" }
    }),
    E.right({
      status: 422,
      value: {
        status: 422,
        detail: "A detail",
        errors: [{ code: "CIE_EXPIRED_ERROR" }]
      }
    }),
    E.right({
      status: 422,
      value: {
        status: 422,
        detail: "A detail",
        errors: [{ code: "CIE_NOT_RELATED_TO_DELEGATOR_ERROR" }]
      }
    })
  ] as Array<AcceptMandateSuccessfulResponse>)(
    "should dispatch a KO state when the response is %o",
    res => {
      const error = res.right.value;
      const reason = `HTTP request failed (${aarProblemJsonAnalyticsReport(
        res.right.value!.status,
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
        .call(
          handleMixPanelCustomTrackingIfNeeded,
          res.right.status,
          res.right.value
        )
        .next()
        .call(trackSendAARFailure, "Validate Mandate", reason)
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
      .call(trackSendAARFailure, "Validate Mandate", "Fast login expiration")
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
      .call(trackSendAARFailure, "Validate Mandate", "An error was thrown ()")
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
      .call(trackSendAARFailure, "Validate Mandate", failureReason)
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

describe("handleMixPanelCustomTrackingIfNeeded", () => {
  beforeEach(jest.clearAllMocks);

  it.each([
    "CIE_EXPIRED_ERROR",
    "cie_expired_error",
    "Cie_Expired_Error",
    "cIe_ExPiReD_eRrOr"
  ])(
    'should call "trackSendAarMandateCieExpiredError" event for status 422 and errorCode "%s"',
    code => {
      handleMixPanelCustomTrackingIfNeeded(422, {
        detail: "A detail",
        status: 422 as HttpStatusCode,
        errors: [{ code }]
      });

      expect(trackSendAarMandateCieExpiredError).toHaveBeenCalledTimes(1);
      expect(
        trackSendAarMandateCieNotRelatedToDelegatorError
      ).not.toHaveBeenCalled();
    }
  );

  it.each([
    "CIE_NOT_RELATED_TO_DELEGATOR_ERROR",
    "cie_not_related_to_delegator_error",
    "Cie_Not_Related_To_Delegator_Error",
    "cIe_NoT_rElAtEd_To_DeLeGaToR_eRrOr"
  ])(
    'should call "trackSendAarMandateCieNotRelatedToDelegatorError" event for status 422 and errorCode "%s"',
    code => {
      handleMixPanelCustomTrackingIfNeeded(422, {
        detail: "A detail",
        status: 422 as HttpStatusCode,
        errors: [{ code }]
      });

      expect(
        trackSendAarMandateCieNotRelatedToDelegatorError
      ).toHaveBeenCalledTimes(1);
      expect(trackSendAarMandateCieExpiredError).not.toHaveBeenCalled();
    }
  );

  it.each([
    {
      status: 400
    },

    {
      status: 400,
      errors: [{ code: "CIE_EXPIRED_ERROR" }]
    },
    {
      status: 400,
      errors: [{ code: "CIE_NOT_RELATED_TO_DELEGATOR_ERROR" }]
    },
    {
      status: 422
    },
    {
      status: 422,
      errors: [{ code: "ANY_ERROR_CODE" }]
    },
    {
      status: 422,
      errors: [{ code: "NOT_A_CIE_NOT_RELATED_TO_DELEGATOR_ERROR" }]
    },
    {
      status: 422,
      errors: [{ code: "NOT_A_CIE_EXPIRED_ERROR" }]
    },
    {
      status: 500
    },
    {
      status: 500,
      errors: [{ code: "CIE_NOT_RELATED_TO_DELEGATOR_ERROR" }]
    },
    {
      status: 500,
      errors: [{ code: "CIE_EXPIRED_ERROR" }]
    }
  ] as Array<{ status: 400 | 422 | 500; errors?: Array<{ code: string }> }>)(
    "should not track any event for %o",
    ({ status, errors }) => {
      handleMixPanelCustomTrackingIfNeeded(status, {
        detail: "A detail",
        status: status as HttpStatusCode,
        errors
      });

      expect(
        trackSendAarMandateCieNotRelatedToDelegatorError
      ).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieExpiredError).not.toHaveBeenCalled();
    }
  );
});
