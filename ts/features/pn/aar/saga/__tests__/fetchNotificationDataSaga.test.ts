import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { StackActions } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { testSaga } from "redux-saga-test-plan";
import { call } from "typed-redux-saga";
import { MessageBodyMarkdown } from "../../../../../../definitions/backend/MessageBodyMarkdown";
import { ThirdPartyMessage as PnThirdPartyMessage } from "../../../../../../definitions/pn/ThirdPartyMessage";
import { ThirdPartyMessage as AarThirdPartyMessage } from "../../../../../../definitions/pn/aar/ThirdPartyMessage";
import NavigationService from "../../../../../navigation/NavigationService";
import { pnMessagingServiceIdSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { SessionToken } from "../../../../../types/SessionToken";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import * as SAGA_UTILS from "../../../../messages/saga/utils";
import { profileFiscalCodeSelector } from "../../../../settings/common/store/selectors";
import { thirdPartyMessage } from "../../../__mocks__/pnMessage";
import PN_ROUTES from "../../../navigation/routes";
import {
  populateStoresWithEphemeralAarMessageData,
  setAarFlowState
} from "../../store/actions";
import { currentAARFlowData } from "../../store/reducers";
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

const mockSessionToken = "token" as SessionToken;
const mockNotification = { foo: "bar" };

describe("fetchAarDataSaga", () => {
  describe("error paths", () => {
    it("should early return if state is not fetchingNotificationData", () => {
      testSaga(fetchAarDataSaga, jest.fn(), mockSessionToken)
        .next()
        .select(currentAARFlowData)
        .next(sendAarMockStates[0])
        .isDone();
    });

    it("should handle left result and set KO state", () => {
      const mockFailure = E.left("error");
      const fetchData = jest.fn().mockResolvedValue(mockFailure);
      testSaga(fetchAarDataSaga, fetchData, mockSessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockCurrentState)
        .call(fetchData, {
          Bearer: mockSessionToken,
          iun: mockCurrentState.iun,
          mandateId: mockCurrentState.mandateId
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
      const mockResolved = E.right({ status: 400, value: mockNotification });
      const fetchData = jest.fn().mockResolvedValue(mockResolved);

      testSaga(fetchAarDataSaga, fetchData, mockSessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockCurrentState)
        .call(fetchData, {
          Bearer: mockSessionToken,
          iun: mockCurrentState.iun,
          mandateId: mockCurrentState.mandateId
        })
        .next(mockResolved)
        .put(
          setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: mockCurrentState
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
        .call(fetchData, {
          Bearer: mockSessionToken,
          iun: mockCurrentState.iun,
          mandateId: mockCurrentState.mandateId
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
        .call(fetchData, {
          Bearer: mockSessionToken,
          iun: mockCurrentState.iun,
          mandateId: mockCurrentState.mandateId
        })
        .next(mockValue)
        .call(
          testable!.aarMessageDataPayloadFromResponse,
          mockNotification,
          mockCurrentState
        )
        .next(O.none)
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
        .call(fetchData, {
          Bearer: mockSessionToken,
          iun: mockCurrentState.iun,
          mandateId: mockCurrentState.mandateId
        })
        .next(mockValue)
        .call(
          testable!.aarMessageDataPayloadFromResponse,
          mockNotification,
          mockCurrentState
        )
        .next(O.some(mockPayload))
        .put(populateStoresWithEphemeralAarMessageData(mockPayload))
        .next()
        .call(
          NavigationService.dispatchNavigationAction,
          StackActions.push(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
            screen: PN_ROUTES.MAIN,
            params: {
              screen: PN_ROUTES.MESSAGE_DETAILS,
              params: {
                messageId: mockPayload.iun,
                serviceId: mockPayload.pnServiceID,
                firstTimeOpening: true
              }
            }
          })
        )
        .next()
        .put(
          setAarFlowState({
            type: sendAARFlowStates.displayingNotificationData,
            notification: mockNotification,
            fullNameDestinatario: mockCurrentState.fullNameDestinatario,
            mandateId: mockCurrentState.mandateId
          })
        )
        .next()
        .isDone();
    });
  });
});

describe("aarMessageDataPayloadFromResponse", () => {
  const { aarMessageDataPayloadFromResponse } = testable!;

  it("should return None if no pnServiceId can be found in the store", () => {
    testSaga(
      aarMessageDataPayloadFromResponse,
      mockNotification,
      mockCurrentState
    )
      .next()
      .select(profileFiscalCodeSelector)
      .next("CF")
      .select(pnMessagingServiceIdSelector)
      .next(undefined)
      .returns(O.none);
  });
  it("should return None if no fiscalCode can be found in the store", () => {
    const mockFn = jest.fn();
    const getDetails = function* (_sid: NonEmptyString) {
      yield* call(mockFn);
      return undefined;
    } as typeof SAGA_UTILS.getServiceDetails;
    jest.spyOn(SAGA_UTILS, "getServiceDetails").mockImplementation(getDetails);

    testSaga(
      aarMessageDataPayloadFromResponse,
      mockNotification,
      mockCurrentState
    )
      .next()
      .select(profileFiscalCodeSelector)
      .next(undefined)
      .select(pnMessagingServiceIdSelector)
      .next("SID")
      .call(mockFn)
      .next()
      .returns(O.none);
  });
  it("should return None if pnServiceDetails cannot be found or fetched", () => {
    const mockFn = jest.fn();
    const getDetails = function* (_sid: NonEmptyString) {
      yield* call(mockFn);
      return undefined;
    } as typeof SAGA_UTILS.getServiceDetails;
    jest.spyOn(SAGA_UTILS, "getServiceDetails").mockImplementation(getDetails);

    testSaga(
      aarMessageDataPayloadFromResponse,
      mockNotification,
      mockCurrentState
    )
      .next()
      .select(profileFiscalCodeSelector)
      .next("CF")
      .select(pnMessagingServiceIdSelector)
      .next("SID")
      .call(mockFn)
      .next(undefined)
      .returns(O.none);
  });
  it("should return None if an invalid message has been passed as parameter", () => {
    const mockFn = jest.fn();
    const getDetails = function* (_sid: NonEmptyString) {
      yield* call(mockFn);
      return { id: "SID" } as any;
    } as typeof SAGA_UTILS.getServiceDetails;
    jest.spyOn(SAGA_UTILS, "getServiceDetails").mockImplementation(getDetails);

    testSaga(
      aarMessageDataPayloadFromResponse,
      mockNotification,
      mockCurrentState
    )
      .next()
      .select(profileFiscalCodeSelector)
      .next("CF")
      .select(pnMessagingServiceIdSelector)
      .next("SID")
      .call(mockFn)
      .next({ id: "SID" } as any)
      .returns(O.none);
  });
  it("should return None if a message with no 'details' key has been passed as parameter", () => {
    const message: PnThirdPartyMessage = {
      attachments: []
    };
    const mockFn = jest.fn();
    const getDetails = function* (_sid: NonEmptyString) {
      yield* call(mockFn);
      return { id: "SID" } as any;
    } as typeof SAGA_UTILS.getServiceDetails;
    jest.spyOn(SAGA_UTILS, "getServiceDetails").mockImplementation(getDetails);

    testSaga(
      aarMessageDataPayloadFromResponse,
      message as AarThirdPartyMessage,
      mockCurrentState
    )
      .next()
      .select(profileFiscalCodeSelector)
      .next("CF")
      .select(pnMessagingServiceIdSelector)
      .next("SID")
      .call(mockFn)
      .next({ id: "SID" } as any)
      .returns(O.none);
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
      mockCurrentState
    )
      .next()
      .select(profileFiscalCodeSelector)
      .next("CF")
      .select(pnMessagingServiceIdSelector)
      .next("SID")
      .call(mockFn)
      .next({ id: "SID" } as any)
      .returns(
        O.some({
          iun: message.details?.iun,
          thirdPartyMessage: message,
          fiscalCode: message.details?.recipients?.[0]?.taxId ?? "CF",
          pnServiceID: "SID",
          markDown: "*".repeat(81) as MessageBodyMarkdown,
          subject: message.details?.subject,
          mandateId: mockCurrentState.mandateId
        })
      );
  });
});
