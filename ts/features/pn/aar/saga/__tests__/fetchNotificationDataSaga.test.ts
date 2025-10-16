import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import _ from "lodash";
import { testSaga } from "redux-saga-test-plan";
import { call } from "typed-redux-saga";
import { ThirdPartyMessage as PnThirdPartyMessage } from "../../../../../../definitions/pn/ThirdPartyMessage";
import { AARProblemJson } from "../../../../../../definitions/pn/aar/AARProblemJson";
import { ThirdPartyMessage as AarThirdPartyMessage } from "../../../../../../definitions/pn/aar/ThirdPartyMessage";
import { pnMessagingServiceIdSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isPnTestEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../../types/SessionToken";
import { profileFiscalCodeSelector } from "../../../../settings/common/store/selectors";
import { thirdPartyMessage } from "../../../__mocks__/pnMessage";
import {
  populateStoresWithEphemeralAarMessageData,
  setAarFlowState
} from "../../store/actions";
import { currentAARFlowData } from "../../store/selectors";
import { sendAARFlowStates } from "../../utils/stateUtils";
import {
  mockEphemeralAarMessageDataActionPayload,
  sendAarMockStates
} from "../../utils/testUtils";
import { fetchAarDataSaga, testable } from "../fetchNotificationDataSaga";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { SendAARClient } from "../../api/client";
import * as serviceDetailsSaga from "../../../../services/common/saga/getServiceDetails";
import { trackSendAARFailure } from "../../analytics";

const mockCurrentState = {
  type: sendAARFlowStates.fetchingNotificationData,
  iun: "IUN123",
  mandateId: "MANDATE123",
  fullNameDestinatario: "Mario Rossi"
};

const { aarMessageDataPayloadFromResponse } = testable!;
const mockSessionToken = "token" as SessionToken;
const mockSessionTokenWithBearer = `Bearer ${mockSessionToken}` as SessionToken;
const mockNotification = { foo: "bar" };

const mockResolvedCall = (resolved: any) =>
  new Promise((res, _reject) => res(resolved)) as unknown as ReturnType<
    SendAARClient["getAARNotification"]
  >;

describe("fetchAarDataSaga", () => {
  describe("error paths", () => {
    it("should early return if state is not fetchingNotificationData", () => {
      testSaga(fetchAarDataSaga, jest.fn(), mockSessionToken)
        .next()
        .select(currentAARFlowData)
        .next(sendAarMockStates[0])
        .call(
          trackSendAARFailure,
          "Fetch Notification",
          "Called in wrong state (none)"
        )
        .next()
        .isDone();
    });

    it("should handle left result and set KO state", () => {
      const mockFailure = E.left([]);
      const fetchData = jest
        .fn()
        .mockReturnValue(mockResolvedCall(mockFailure));
      testSaga(fetchAarDataSaga, fetchData, mockSessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockCurrentState)
        .select(isPnTestEnabledSelector)
        .next(true)
        .call(withRefreshApiCall, fetchData())
        .next(mockFailure)
        .call(trackSendAARFailure, "Fetch Notification", "Decoding failure ()")
        .next()
        .put(
          setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: mockCurrentState,
            debugData: {
              phase: "Fetch Notification",
              reason: `Decoding failure ()`
            }
          })
        )
        .next()
        .isDone();

      expect(fetchData).toHaveBeenCalledWith({
        Bearer: mockSessionTokenWithBearer,
        iun: mockCurrentState.iun,
        mandateId: mockCurrentState.mandateId,
        "x-pagopa-pn-io-src": "QRCODE",
        isTest: true
      });
    });

    it("should handle status !== 200 and set KO state", () => {
      const mockResolved = {
        status: 400,
        value: { status: 400, detail: "A detail" }
      };
      const mockResolvedEither = E.right(mockResolved);
      const fetchData = jest
        .fn()
        .mockReturnValue(mockResolvedCall(mockResolvedEither));

      testSaga(fetchAarDataSaga, fetchData, mockSessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockCurrentState)
        .select(isPnTestEnabledSelector)
        .next(true)
        .call(withRefreshApiCall, fetchData())
        .next(mockResolvedEither)
        .call(
          trackSendAARFailure,
          "Fetch Notification",
          "HTTP request failed (400 400 A detail)"
        )
        .next()
        .put(
          setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: mockCurrentState,
            error: mockResolved.value as unknown as AARProblemJson,
            debugData: {
              phase: "Fetch Notification",
              reason: `HTTP request failed (400 400 A detail)`
            }
          })
        )
        .next()
        .isDone();

      expect(fetchData).toHaveBeenCalledWith({
        Bearer: mockSessionTokenWithBearer,
        iun: mockCurrentState.iun,
        mandateId: mockCurrentState.mandateId,
        "x-pagopa-pn-io-src": "QRCODE",
        isTest: true
      });
    });
    it("should handle a saga error and set KO state", () => {
      const error = new Error("fail");
      const fetchData = jest.fn().mockImplementation(() => {
        throw error;
      });
      testSaga(fetchAarDataSaga, fetchData, mockSessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockCurrentState)
        .select(isPnTestEnabledSelector)
        .next(true)
        .call(
          trackSendAARFailure,
          "Fetch Notification",
          "An error was thrown (fail)"
        )
        .next()
        .put(
          setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: mockCurrentState,
            debugData: {
              phase: "Fetch Notification",
              reason: `An error was thrown (fail)`
            }
          })
        )
        .next()
        .isDone();

      expect(fetchData).toHaveBeenCalledWith({
        Bearer: mockSessionTokenWithBearer,
        iun: mockCurrentState.iun,
        mandateId: mockCurrentState.mandateId,
        "x-pagopa-pn-io-src": "QRCODE",
        isTest: true
      });
    });
  });
  describe("200 status path", () => {
    it("should handle a non-parsable success payload and return", () => {
      const mockValue = E.right({ status: 200, value: mockNotification });
      const fetchData = jest.fn().mockReturnValue(mockResolvedCall(mockValue));
      testSaga(fetchAarDataSaga, fetchData, mockSessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockCurrentState)
        .select(isPnTestEnabledSelector)
        .next(true)
        .call(withRefreshApiCall, fetchData())
        .next(mockValue)
        .call(
          aarMessageDataPayloadFromResponse,
          mockNotification,
          mockCurrentState.mandateId
        )
        .next(E.left("Unable to retrieve user fiscal code"))
        .call(
          trackSendAARFailure,
          "Fetch Notification",
          "An error was thrown (Unable to retrieve user fiscal code)"
        )
        .next()
        .put(
          setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: mockCurrentState,
            debugData: {
              phase: "Fetch Notification",
              reason:
                "An error was thrown (Unable to retrieve user fiscal code)"
            }
          })
        )
        .next()
        .isDone();

      expect(fetchData).toHaveBeenCalledWith({
        Bearer: mockSessionTokenWithBearer,
        iun: mockCurrentState.iun,
        mandateId: mockCurrentState.mandateId,
        "x-pagopa-pn-io-src": "QRCODE",
        isTest: true
      });
    });
    it("should handle a parsable success payload and dispatch the correct actions", () => {
      const mockPayload = mockEphemeralAarMessageDataActionPayload;
      const mockValue = E.right({ status: 200, value: mockNotification });
      const fetchData = jest.fn().mockReturnValue(mockResolvedCall(mockValue));
      testSaga(fetchAarDataSaga, fetchData, mockSessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockCurrentState)
        .select(isPnTestEnabledSelector)
        .next(true)
        .call(withRefreshApiCall, fetchData())
        .next(mockValue)
        .call(
          aarMessageDataPayloadFromResponse,
          mockNotification,
          mockCurrentState.mandateId
        )
        .next(E.right(mockPayload))
        .put(populateStoresWithEphemeralAarMessageData(mockPayload))
        .next()
        .put(
          setAarFlowState({
            type: sendAARFlowStates.displayingNotificationData,
            notification: mockNotification,
            fullNameDestinatario: mockCurrentState.fullNameDestinatario,
            mandateId: mockPayload.mandateId,
            iun: mockPayload.iun,
            pnServiceId: mockPayload.pnServiceID
          })
        )
        .next()
        .isDone();

      expect(fetchData).toHaveBeenCalledWith({
        Bearer: mockSessionTokenWithBearer,
        iun: mockCurrentState.iun,
        mandateId: mockCurrentState.mandateId,
        "x-pagopa-pn-io-src": "QRCODE",
        isTest: true
      });
    });
  });
});

describe("aarMessageDataPayloadFromResponse", () => {
  it("should return left etiher if no pnServiceId can be found in the store", () => {
    testSaga(
      aarMessageDataPayloadFromResponse,
      mockNotification,
      mockCurrentState.mandateId
    )
      .next()
      .select(profileFiscalCodeSelector)
      .next("CF")
      .select(pnMessagingServiceIdSelector)
      .next(undefined)
      .returns(E.left("Unable to retrieve sendServiceId"));
  });
  it("should return left either if no fiscalCode can be found in the store", () => {
    testSaga(
      aarMessageDataPayloadFromResponse,
      mockNotification,
      mockCurrentState.mandateId
    )
      .next()
      .select(profileFiscalCodeSelector)
      .next(undefined)
      .returns(E.left(`Unable to retrieve user fiscal code`));
  });
  it("should return left either if an invalid message has been passed as parameter", () => {
    testSaga(
      aarMessageDataPayloadFromResponse,
      {
        details: { notificationStatusHistory: "WRONG_DATA_KIND" }
      } as unknown as AarThirdPartyMessage,
      mockCurrentState.iun
    )
      .next()
      .select(profileFiscalCodeSelector)
      .next("CF")
      .select(pnMessagingServiceIdSelector)
      .next("SID")
      // function fails to decode the message
      .returns(
        E.left(
          `Unable to decode AAR notification into SEND ThirdPartyMessage (value undefined at root.details.subject is not a valid [string]\nvalue undefined at root.details.iun is not a valid [string]\nvalue undefined at root.details.recipients is not a valid [array of NotificationRecipient]\nvalue "WRONG_DATA_KIND" at root.details.notificationStatusHistory is not a valid [array of NotificationStatusHistoryElement])`
        )
      );
  });
  it("should return left either if SEND service preferences cannot be retrieved", () => {
    const mockFn = jest.fn();
    const getDetails = function* (_sid: NonEmptyString) {
      yield* call(mockFn);
      return undefined;
    };
    jest
      .spyOn(serviceDetailsSaga, "getServiceDetails")
      .mockImplementation(getDetails);

    testSaga(
      aarMessageDataPayloadFromResponse,
      mockNotification,
      mockCurrentState.mandateId
    )
      .next()
      .select(profileFiscalCodeSelector)
      .next("CF")
      .select(pnMessagingServiceIdSelector)
      .next("SID")
      .call(mockFn)
      .next(undefined)
      .returns(E.left(`Unable to retrieve SEND service details`));
  });
  it("should return left either if a message without a valid `details` key has been passed as parameter", () => {
    const message = _.omit(
      thirdPartyMessage.third_party_message as PnThirdPartyMessage,
      "details"
    );
    const mockFn = jest.fn();
    const getDetails = function* (_sid: NonEmptyString) {
      yield* call(mockFn);
      return { id: "SID" } as any;
    } as typeof serviceDetailsSaga.getServiceDetails;
    jest
      .spyOn(serviceDetailsSaga, "getServiceDetails")
      .mockImplementation(getDetails);

    testSaga(
      aarMessageDataPayloadFromResponse,
      message as AarThirdPartyMessage,
      mockCurrentState.mandateId
    )
      .next()
      .select(profileFiscalCodeSelector)
      .next("CF")
      .select(pnMessagingServiceIdSelector)
      .next("SID")
      .call(mockFn)
      .next({ id: "SID" } as any)
      .returns(E.left(`Field 'details' in the AAR Notification is missing`));
  });
  it("should return a right either with mapped object if a message with the required keys has been passed as parameter", () => {
    const message =
      thirdPartyMessage.third_party_message as PnThirdPartyMessage;
    const mockFn = jest.fn();
    const getDetails = function* (_sid: NonEmptyString) {
      yield* call(mockFn);
      return { id: "SID" } as any;
    } as typeof serviceDetailsSaga.getServiceDetails;
    jest
      .spyOn(serviceDetailsSaga, "getServiceDetails")
      .mockImplementation(getDetails);

    testSaga(
      aarMessageDataPayloadFromResponse,
      message as AarThirdPartyMessage,
      mockCurrentState.mandateId
    )
      .next()
      .select(profileFiscalCodeSelector)
      .next("CF")
      .select(pnMessagingServiceIdSelector)
      .next("SID")
      .call(mockFn)
      .next({ id: "SID" } as any)
      .returns(
        E.right({
          iun: message.details?.iun,
          thirdPartyMessage: message,
          fiscalCode: message.details?.recipients?.[0]?.taxId ?? "CF",
          pnServiceID: "SID",
          markdown: "*".repeat(81) as NonEmptyString,
          subject: message.details?.subject,
          mandateId: mockCurrentState.mandateId
        })
      );
  });
});
