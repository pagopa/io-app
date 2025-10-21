import * as E from "fp-ts/lib/Either";
import _ from "lodash";
import { testSaga } from "redux-saga-test-plan";
import { AARProblemJson } from "../../../../../../definitions/pn/aar/AARProblemJson";
import { ThirdPartyMessage } from "../../../../../../definitions/pn/aar/ThirdPartyMessage";
import { pnMessagingServiceIdSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isPnTestEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../../types/SessionToken";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { profileFiscalCodeSelector } from "../../../../settings/common/store/selectors";
import { SendAARClient } from "../../api/client";
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
import { trackPNNotificationLoadSuccess } from "../../../analytics";
import { getServiceDetails } from "../../../../services/common/saga/ getServiceDetails";

const mockCurrentState = {
  type: sendAARFlowStates.fetchingNotificationData,
  iun: "IUN123",
  mandateId: "MANDATE123",
  recipientInfo: {
    denomination: "Mario Rossi",
    taxId: "RSSMRA74D22A001Q"
  }
};

const { aarMessageDataPayloadFromResponse } = testable!;
const mockSessionToken = "token" as SessionToken;
const mockSessionTokenWithBearer = `Bearer ${mockSessionToken}` as SessionToken;
const mockIUn = "01K83208Z4CPBJXPFH7X9GDDMK";
const mockSubject = "Message subject";
const mockFiscalCode = "NMUVCN66S01F138R";
const mockSendMessage = {
  attachments: [{ id: "1", url: "https://an.url/path" }],
  details: {
    subject: mockSubject,
    iun: mockIUn,
    recipients: [
      {
        recipientType: "",
        taxId: mockFiscalCode,
        denomination: "A denomination",
        payment: {
          noticeCode: "111122223333444400",
          creditorTaxId: "01234567890"
        }
      }
    ],
    notificationStatusHistory: [
      {
        status: "ACCEPTED",
        activeFrom: new Date(),
        relatedTimelineElements: [
          "xo4h59s49o95a215uhd3o35453u32o435uqhwod84s6d4"
        ]
      }
    ]
  }
} as unknown as ThirdPartyMessage;

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
        .select(isPnTestEnabledSelector)
        .next(true)
        .isDone();
    });

    it("should handle left result and set KO state", () => {
      const mockFailure = E.left("error");
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
        .put(
          setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: mockCurrentState
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
      const mockResolved = { status: 400, value: mockSendMessage };
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
        .put(
          setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: mockCurrentState,
            error: mockResolved.value as unknown as AARProblemJson
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
        .put(
          setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: mockCurrentState
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
      const mockValue = E.right({ status: 200, value: mockSendMessage });
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
          mockSendMessage,
          mockCurrentState.mandateId
        )
        .next(undefined)
        .put(
          setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: mockCurrentState
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
      const mockValue = E.right({ status: 200, value: mockSendMessage });
      const fetchData = jest.fn().mockReturnValue(mockResolvedCall(mockValue));
      // mockResolvedValue(mockValue);
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
          mockSendMessage,
          mockCurrentState.mandateId
        )
        .next(mockEphemeralAarMessageDataActionPayload)
        .put(
          populateStoresWithEphemeralAarMessageData(
            mockEphemeralAarMessageDataActionPayload
          )
        )
        .next()
        .put(
          setAarFlowState({
            type: sendAARFlowStates.displayingNotificationData,
            notification: mockSendMessage,
            recipientInfo: mockCurrentState.recipientInfo,
            mandateId: mockEphemeralAarMessageDataActionPayload.mandateId,
            iun: mockEphemeralAarMessageDataActionPayload.iun,
            pnServiceId: mockEphemeralAarMessageDataActionPayload.pnServiceID
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
  [undefined, mockCurrentState.mandateId].forEach(mandateId => {
    it(`should return undefined if the 'details' field in the message data is missing (mandateId ${mandateId})`, () => {
      const { details, ...rest } = mockSendMessage;
      testSaga(aarMessageDataPayloadFromResponse, rest, mandateId)
        .next()
        .returns(undefined);
    });
    it(`should return undefined if no pnServiceId can be found in the store (mandateId ${mandateId})`, () => {
      testSaga(aarMessageDataPayloadFromResponse, mockSendMessage, mandateId)
        .next()
        .call(
          trackPNNotificationLoadSuccess,
          true,
          "ACCEPTED",
          "aar",
          mandateId != null ? "mandatory" : "recipient"
        )
        .next()
        .select(pnMessagingServiceIdSelector)
        .next(undefined)
        .returns(undefined);
    });
    it(`should return undefined if pnServiceDetails cannot be found or fetched (mandateId ${mandateId})`, () => {
      testSaga(aarMessageDataPayloadFromResponse, mockSendMessage, mandateId)
        .next()
        .call(
          trackPNNotificationLoadSuccess,
          true,
          "ACCEPTED",
          "aar",
          mandateId != null ? "mandatory" : "recipient"
        )
        .next()
        .select(pnMessagingServiceIdSelector)
        .next(mockEphemeralAarMessageDataActionPayload.pnServiceID)
        .call(
          getServiceDetails,
          mockEphemeralAarMessageDataActionPayload.pnServiceID
        )
        .next(undefined)
        .returns(undefined);
    });
    it(`should return undefined if no fiscal code can be found in the store (mandateId ${mandateId})`, () => {
      testSaga(aarMessageDataPayloadFromResponse, mockSendMessage, mandateId)
        .next()
        .call(
          trackPNNotificationLoadSuccess,
          true,
          "ACCEPTED",
          "aar",
          mandateId != null ? "mandatory" : "recipient"
        )
        .next()
        .select(pnMessagingServiceIdSelector)
        .next(mockEphemeralAarMessageDataActionPayload.pnServiceID)
        .call(
          getServiceDetails,
          mockEphemeralAarMessageDataActionPayload.pnServiceID
        )
        .next({})
        .select(profileFiscalCodeSelector)
        .next(undefined)
        .returns(undefined);
    });
    it(`should return a mapped object if a message with the required keys has been passed as parameter (mandateId ${mandateId})`, () => {
      testSaga(aarMessageDataPayloadFromResponse, mockSendMessage, mandateId)
        .next()
        .call(
          trackPNNotificationLoadSuccess,
          true,
          "ACCEPTED",
          "aar",
          mandateId != null ? "mandatory" : "recipient"
        )
        .next()
        .select(pnMessagingServiceIdSelector)
        .next(mockEphemeralAarMessageDataActionPayload.pnServiceID)
        .call(
          getServiceDetails,
          mockEphemeralAarMessageDataActionPayload.pnServiceID
        )
        .next({})
        .select(profileFiscalCodeSelector)
        .next(mockFiscalCode)
        .returns({
          iun: mockIUn,
          thirdPartyMessage: mockSendMessage,
          fiscalCode: mockFiscalCode,
          pnServiceID: mockEphemeralAarMessageDataActionPayload.pnServiceID,
          markdown:
            "*********************************************************************************",
          subject: mockSubject,
          mandateId
        });
    });
  });
});
