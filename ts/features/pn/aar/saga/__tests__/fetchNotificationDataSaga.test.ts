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
import * as SAGA_UTILS from "../../../../services/common/saga/ getServiceDetails";
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
      const fetchData = jest.fn().mockResolvedValue(mockFailure);
      testSaga(fetchAarDataSaga, fetchData, mockSessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockCurrentState)
        .select(isPnTestEnabledSelector)
        .next(true)
        .call(fetchData, {
          Bearer: mockSessionTokenWithBearer,
          iun: mockCurrentState.iun,
          mandateId: mockCurrentState.mandateId,
          "x-pagopa-pn-io-src": "QRCODE",
          isTest: true
        })
        .next(mockFailure)
        .put(
          setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: mockCurrentState
          })
        )
        .next()
        .isDone();
    });

    it("should handle status !== 200 and set KO state", () => {
      const mockResolved = { status: 400, value: mockNotification };
      const mockResolvedEither = E.right(mockResolved);
      const fetchData = jest.fn().mockResolvedValue(mockResolvedEither);

      testSaga(fetchAarDataSaga, fetchData, mockSessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockCurrentState)
        .select(isPnTestEnabledSelector)
        .next(true)
        .call(fetchData, {
          Bearer: mockSessionTokenWithBearer,
          iun: mockCurrentState.iun,
          mandateId: mockCurrentState.mandateId,
          "x-pagopa-pn-io-src": "QRCODE",
          isTest: true
        })
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
        .call(fetchData, {
          Bearer: mockSessionTokenWithBearer,
          iun: mockCurrentState.iun,
          mandateId: mockCurrentState.mandateId,
          "x-pagopa-pn-io-src": "QRCODE",
          isTest: true
        })
        .throw(error)
        .put(
          setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: mockCurrentState
          })
        )
        .next()
        .isDone();
    });
  });
  describe("200 status path", () => {
    it("should handle a non-parsable success payload and return", () => {
      const mockValue = E.right({ status: 200, value: mockNotification });
      const fetchData = jest.fn().mockResolvedValue(mockValue);
      testSaga(fetchAarDataSaga, fetchData, mockSessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockCurrentState)
        .select(isPnTestEnabledSelector)
        .next(true)
        .call(fetchData, {
          Bearer: mockSessionTokenWithBearer,
          iun: mockCurrentState.iun,
          mandateId: mockCurrentState.mandateId,
          "x-pagopa-pn-io-src": "QRCODE",
          isTest: true
        })
        .next(mockValue)
        .call(
          aarMessageDataPayloadFromResponse,
          mockNotification,
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
    });
    it("should handle a parsable success payload and dispatch the correct actions", () => {
      const mockPayload = mockEphemeralAarMessageDataActionPayload;
      const mockValue = E.right({ status: 200, value: mockNotification });
      const fetchData = jest.fn().mockResolvedValue(mockValue);
      testSaga(fetchAarDataSaga, fetchData, mockSessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockCurrentState)
        .select(isPnTestEnabledSelector)
        .next(true)
        .call(fetchData, {
          Bearer: mockSessionTokenWithBearer,
          iun: mockCurrentState.iun,
          mandateId: mockCurrentState.mandateId,
          "x-pagopa-pn-io-src": "QRCODE",
          isTest: true
        })
        .next(mockValue)
        .call(
          aarMessageDataPayloadFromResponse,
          mockNotification,
          mockCurrentState.mandateId
        )
        .next(mockPayload)
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
    });
  });
});

describe("aarMessageDataPayloadFromResponse", () => {
  it("should return undefined if no pnServiceId can be found in the store", () => {
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
      .returns(undefined);
  });
  it("should return undefined if no fiscalCode can be found in the store", () => {
    const mockFn = jest.fn();
    const getDetails = function* (_sid: NonEmptyString) {
      yield* call(mockFn);
      return undefined;
    } as typeof SAGA_UTILS.getServiceDetails;
    jest.spyOn(SAGA_UTILS, "getServiceDetails").mockImplementation(getDetails);

    testSaga(
      aarMessageDataPayloadFromResponse,
      mockNotification,
      mockCurrentState.mandateId
    )
      .next()
      .select(profileFiscalCodeSelector)
      .next(undefined)
      .select(pnMessagingServiceIdSelector)
      .next("SID")
      .call(mockFn)
      .next()
      .returns(undefined);
  });
  it("should return undefined if pnServiceDetails cannot be found or fetched", () => {
    const mockFn = jest.fn();
    const getDetails = function* (_sid: NonEmptyString) {
      yield* call(mockFn);
      return undefined;
    } as typeof SAGA_UTILS.getServiceDetails;
    jest.spyOn(SAGA_UTILS, "getServiceDetails").mockImplementation(getDetails);

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
      .returns(undefined);
  });
  it("should return undefined if an invalid message has been passed as parameter", () => {
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
      .returns(undefined);
  });
  it("should return undefined if a message without a valid `details` key has been passed as parameter", () => {
    const message = _.omit(
      thirdPartyMessage.third_party_message as PnThirdPartyMessage,
      "details"
    );
    const mockFn = jest.fn();
    const getDetails = function* (_sid: NonEmptyString) {
      yield* call(mockFn);
      return { id: "SID" } as any;
    } as typeof SAGA_UTILS.getServiceDetails;
    jest.spyOn(SAGA_UTILS, "getServiceDetails").mockImplementation(getDetails);

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
      .returns(undefined);
  });
  it("should return a mapped object if a message with the required keys has been passed as parameter", () => {
    const message =
      thirdPartyMessage.third_party_message as PnThirdPartyMessage;
    const mockFn = jest.fn();
    const getDetails = function* (_sid: NonEmptyString) {
      yield* call(mockFn);
      return { id: "SID" } as any;
    } as typeof SAGA_UTILS.getServiceDetails;
    jest.spyOn(SAGA_UTILS, "getServiceDetails").mockImplementation(getDetails);

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
      .returns({
        iun: message.details?.iun,
        thirdPartyMessage: message,
        fiscalCode: message.details?.recipients?.[0]?.taxId ?? "CF",
        pnServiceID: "SID",
        markdown: "*".repeat(81) as NonEmptyString,
        subject: message.details?.subject,
        mandateId: mockCurrentState.mandateId
      });
  });
});
