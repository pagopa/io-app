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
  trackSendAarMandateCieNotRelatedToDelegatorError,
  trackSendAarMandateCieDataError
} from "../../analytics";
import { isPnTestEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { AARProblemJson } from "../../../../../../definitions/pn/aar/AARProblemJson";

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
  trackSendAarMandateCieNotRelatedToDelegatorError: jest.fn(),
  trackSendAarMandateCieDataError: jest.fn()
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
          res.right.value?.errors,
          reason
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
    'should call "trackSendAarMandateCieExpiredError" for errorCode "%s"',
    code => {
      handleMixPanelCustomTrackingIfNeeded([{ code }], "Some reason");

      expect(trackSendAarMandateCieExpiredError).toHaveBeenCalledTimes(1);
      expect(trackSendAarMandateCieExpiredError).toHaveBeenCalledWith(
        "Some reason"
      );
      expect(
        trackSendAarMandateCieNotRelatedToDelegatorError
      ).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieDataError).not.toHaveBeenCalled();
    }
  );

  it.each([
    "CIE_NOT_RELATED_TO_DELEGATOR_ERROR",
    "cie_not_related_to_delegator_error",
    "Cie_Not_Related_To_Delegator_Error",
    "cIe_NoT_rElAtEd_To_DeLeGaToR_eRrOr"
  ])(
    'should call "trackSendAarMandateCieNotRelatedToDelegatorError" for errorCode "%s"',
    code => {
      handleMixPanelCustomTrackingIfNeeded([{ code }], "Some reason");

      expect(
        trackSendAarMandateCieNotRelatedToDelegatorError
      ).toHaveBeenCalledTimes(1);
      expect(
        trackSendAarMandateCieNotRelatedToDelegatorError
      ).toHaveBeenCalledWith("Some reason");
      expect(trackSendAarMandateCieExpiredError).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieDataError).not.toHaveBeenCalled();
    }
  );

  it.each([
    "PN_MANDATE_BADREQUEST",
    "PN_GENERIC_INVALIDPARAMETER",
    "PN_MANDATE_NOTFOUND",
    "PN_MANDATE_INVALIDVERIFICATIONCODE",
    "CIE_INVALID_INPUT",
    "CIE_INTEGRITY_ERROR",
    "CIE_SIGNATURE_ERROR",
    "CIE_CHECKER_SERVER_ERROR"
  ])(
    'should call "trackSendAarMandateCieDataError" for errorCode "%s"',
    code => {
      handleMixPanelCustomTrackingIfNeeded([{ code }], "Some reason");

      expect(trackSendAarMandateCieDataError).toHaveBeenCalledTimes(1);
      expect(trackSendAarMandateCieDataError).toHaveBeenCalledWith(
        "Some reason"
      );
      expect(
        trackSendAarMandateCieNotRelatedToDelegatorError
      ).not.toHaveBeenCalled();
      expect(trackSendAarMandateCieExpiredError).not.toHaveBeenCalled();
    }
  );

  it.each([
    {
      title: "CIE_EXPIRED_ERROR before CIE_NOT_RELATED_TO_DELEGATOR_ERROR",
      errors: [
        { code: "UNKNOWN_ERROR" },
        { code: "CIE_EXPIRED_ERROR" },
        { code: "CIE_NOT_RELATED_TO_DELEGATOR_ERROR" }
      ],
      expectedTracker: trackSendAarMandateCieExpiredError
    },
    {
      title: "CIE_NOT_RELATED_TO_DELEGATOR_ERROR before CIE_EXPIRED_ERROR",
      errors: [
        { code: "CIE_NOT_RELATED_TO_DELEGATOR_ERROR" },
        { code: "CIE_EXPIRED_ERROR" }
      ],
      expectedTracker: trackSendAarMandateCieNotRelatedToDelegatorError
    },
    {
      title: "CIE_INTEGRITY_ERROR before CIE_EXPIRED_ERROR",
      errors: [{ code: "CIE_INTEGRITY_ERROR" }, { code: "CIE_EXPIRED_ERROR" }],
      expectedTracker: trackSendAarMandateCieDataError
    },
    {
      title:
        "unknown codes followed by CIE_NOT_RELATED_TO_DELEGATOR_ERROR and CIE_INTEGRITY_ERROR",
      errors: [
        { code: "UNKNOWN_1" },
        { code: "UNKNOWN_2" },
        { code: "CIE_NOT_RELATED_TO_DELEGATOR_ERROR" },
        { code: "CIE_INTEGRITY_ERROR" }
      ],
      expectedTracker: trackSendAarMandateCieNotRelatedToDelegatorError
    }
  ])(
    "should only track the first mapped error for $title",
    ({ errors, expectedTracker }) => {
      handleMixPanelCustomTrackingIfNeeded(errors, "Some reason");

      expect(expectedTracker).toHaveBeenCalledTimes(1);
      expect(expectedTracker).toHaveBeenCalledWith("Some reason");

      const allTrackers = [
        trackSendAarMandateCieExpiredError,
        trackSendAarMandateCieNotRelatedToDelegatorError,
        trackSendAarMandateCieDataError
      ];
      allTrackers
        .filter(t => t !== expectedTracker)
        .forEach(t => expect(t).not.toHaveBeenCalled());
    }
  );

  it.each([
    {
      title: "undefined errors",
      errors: undefined
    },
    {
      title: "empty errors array",
      errors: [] as Array<{ code: string }>
    },
    {
      title: "unknown error code",
      errors: [{ code: "UNKNOWN_ERROR" }]
    },
    {
      title: "multiple unknown error codes",
      errors: [{ code: "UNKNOWN_1" }, { code: "UNKNOWN_2" }]
    }
  ])("should not call any tracking function for $title", ({ errors }) => {
    handleMixPanelCustomTrackingIfNeeded(errors, "Some reason");

    expect(trackSendAarMandateCieDataError).not.toHaveBeenCalled();
    expect(trackSendAarMandateCieExpiredError).not.toHaveBeenCalled();
    expect(
      trackSendAarMandateCieNotRelatedToDelegatorError
    ).not.toHaveBeenCalled();
  });
});
