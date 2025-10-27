import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { Action, Store } from "redux";
import configureMockStore from "redux-mock-store";
import { fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { reproduceSequence } from "../../../../utils/tests";
import { message_1 } from "../../../messages/__mocks__/message";
import { service_1 } from "../../../messages/__mocks__/messages";
import {
  loadMessageById,
  loadMessageDetails,
  loadThirdPartyMessage
} from "../../../messages/store/actions";
import {
  toUIMessage,
  toUIMessageDetails
} from "../../../messages/store/reducers/transformers";
import { loadServiceDetail } from "../../../services/details/store/actions/details";
import * as commonSelectors from "../../../settings/common/store/selectors";
import { thirdPartyMessage } from "../../__mocks__/pnMessage";
import { sendAarMockStateFactory } from "../../aar/utils/testUtils";
import PN_ROUTES from "../../navigation/routes";
import { startPNPaymentStatusTracking } from "../../store/actions";
import { MessageDetailsScreen } from "../MessageDetailsScreen";
import * as REDUCERS from "../../store/reducers";
import { PNMessage } from "../../store/types/types";
import * as AAR_SELECTORS from "../../aar/store/selectors";
import { ATTACHMENT_CATEGORY } from "../../../messages/types/attachmentCategory";
import * as AAR_ANALYTICS from "../../aar/analytics";
import * as SEND_ANALYTICS from "../../analytics";
import * as HARDWARE_BACK_BUTTON from "../../../../hooks/useHardwareBackButton";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

jest.mock("../../components/MessageDetails");
jest.mock("../../aar/components/SendAARMessageDetailBottomSheetComponent");

describe("MessageDetailsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // eslint-disable-next-line sonarjs/cognitive-complexity
  [true, false].forEach(isAar => {
    it(`should match the snapshot when there is an error${
      isAar ? "and dispatch trackSendAARFailure" : ""
    }`, () => {
      const spiedOnMockedTrackSendAARFailure = jest
        .spyOn(AAR_ANALYTICS, "trackSendAARFailure")
        .mockImplementation();
      const sequenceOfActions: ReadonlyArray<Action> = [
        applicationChangeState("active")
      ];

      const id = message_1.id;
      const state: GlobalState = reproduceSequence(
        {
          entities: {
            messages: {
              thirdPartyById: {
                [id]: pot.some({ third_party_message: {} })
              }
            }
          }
        } as unknown as GlobalState,
        appReducer,
        sequenceOfActions
      );
      const mockStore = configureMockStore<GlobalState>();
      const store: Store<GlobalState> = mockStore(state);

      const { component } = renderComponent(store, false, isAar);
      expect(component).toMatchSnapshot();

      if (isAar) {
        expect(spiedOnMockedTrackSendAARFailure.mock.calls.length).toBe(1);
        expect(spiedOnMockedTrackSendAARFailure.mock.calls[0].length).toBe(2);
        expect(spiedOnMockedTrackSendAARFailure.mock.calls[0][0]).toBe(
          "Show Notification"
        );
        expect(spiedOnMockedTrackSendAARFailure.mock.calls[0][1]).toBe(
          "Screen rendering with undefined SEND message"
        );
      } else {
        expect(spiedOnMockedTrackSendAARFailure.mock.calls.length).toBe(0);
      }
    });

    it(`should match the snapshot when everything went fine -- aar:${isAar} and not dispatch trackSendAARFailure`, () => {
      const spiedOnMockedTrackSendAARFailure = jest
        .spyOn(AAR_ANALYTICS, "trackSendAARFailure")
        .mockImplementation();
      jest
        .spyOn(commonSelectors, "profileFiscalCodeSelector")
        .mockImplementation(_state => "DifferentFromTaxId");
      const sequenceOfActions: ReadonlyArray<Action> = [
        applicationChangeState("active"),
        loadMessageById.success(toUIMessage(message_1)),
        loadServiceDetail.success(service_1),
        loadMessageDetails.success(toUIMessageDetails(message_1)),
        loadThirdPartyMessage.success({
          id: message_1.id,
          content: { kind: "TPM", ...thirdPartyMessage }
        })
      ];

      const state: GlobalState = reproduceSequence(
        {} as GlobalState,
        appReducer,
        sequenceOfActions
      );
      const mockStore = configureMockStore<GlobalState>();
      const store: Store<GlobalState> = mockStore(state);

      const { component } = renderComponent(store, false, isAar);
      expect(component).toMatchSnapshot();

      expect(spiedOnMockedTrackSendAARFailure.mock.calls.length).toBe(0);
    });

    [false, true].forEach(firstTimeOpening =>
      [0, 1].forEach(paymentCount =>
        [false, true].forEach(isCancelled =>
          [false, true].forEach(containsF24 => {
            const fakeProfileFiscalCode = "XXXYYY99Z00A123B";
            const sendMessage = {
              notificationStatusHistory: [],
              isCancelled,
              recipients:
                paymentCount > 0
                  ? [{ taxId: fakeProfileFiscalCode, payment: {} }]
                  : [],
              attachments: containsF24
                ? [
                    {
                      category: ATTACHMENT_CATEGORY.F24
                    }
                  ]
                : []
            } as unknown as PNMessage;
            [
              pot.none,
              pot.noneLoading,
              pot.noneUpdating(O.none),
              pot.noneError(Error()),
              pot.some(O.none),
              pot.some(O.some(sendMessage)),
              pot.someLoading(O.none),
              pot.someLoading(O.some(sendMessage)),
              pot.someUpdating(O.none, O.some(sendMessage)),
              pot.someUpdating(O.some(sendMessage), O.none),
              pot.someError(O.none, Error()),
              pot.someError(O.some(sendMessage), Error())
            ].forEach(messagePot =>
              [false, true].forEach(isDelegate => {
                const isSomePot = pot.isSome(messagePot);
                const isSomeOption =
                  isSomePot && O.isSome(pot.getOrElse(messagePot, O.none));
                const potOptionDescription = isSomePot
                  ? `pot ${messagePot.kind} option ${
                      isSomeOption ? "some" : "none"
                    }`
                  : `pot ${messagePot.kind}`;
                it(`should ${
                  messagePot.kind === "PotSome" ? "" : "not "
                }call 'trackPNUxSuccess' with proper parameters (${potOptionDescription} isAAR ${isAar} firstTimeOpening ${firstTimeOpening} paymentCount ${paymentCount} isCancelled ${isCancelled} containsF24 ${containsF24} isDelegate ${isDelegate})`, () => {
                  jest
                    .spyOn(commonSelectors, "profileFiscalCodeSelector")
                    .mockImplementation(_state => fakeProfileFiscalCode);
                  jest
                    .spyOn(REDUCERS, "pnMessageFromIdSelector")
                    .mockImplementation((_state, _id) => messagePot);
                  jest
                    .spyOn(AAR_SELECTORS, "isAarMessageDelegatedSelector")
                    .mockImplementation((_state, _messageId) => isDelegate);
                  const spiedOnMockedTrackPNExSuccess = jest
                    .spyOn(SEND_ANALYTICS, "trackPNUxSuccess")
                    .mockImplementation();

                  const globalState = appReducer(
                    undefined,
                    applicationChangeState("active")
                  );
                  const mockStore = configureMockStore<GlobalState>();
                  const store: Store<GlobalState> = mockStore(globalState);

                  renderComponent(store, firstTimeOpening, isAar);

                  if (messagePot.kind === "PotSome") {
                    expect(
                      spiedOnMockedTrackPNExSuccess.mock.calls.length
                    ).toBe(1);
                    expect(
                      spiedOnMockedTrackPNExSuccess.mock.calls[0].length
                    ).toBe(6);
                    expect(spiedOnMockedTrackPNExSuccess.mock.calls[0][0]).toBe(
                      isSomeOption ? paymentCount : 0
                    );
                    expect(spiedOnMockedTrackPNExSuccess.mock.calls[0][1]).toBe(
                      firstTimeOpening
                    );
                    expect(spiedOnMockedTrackPNExSuccess.mock.calls[0][2]).toBe(
                      isSomeOption ? isCancelled : false
                    );
                    expect(spiedOnMockedTrackPNExSuccess.mock.calls[0][3]).toBe(
                      isSomeOption ? containsF24 : false
                    );
                    expect(spiedOnMockedTrackPNExSuccess.mock.calls[0][4]).toBe(
                      isAar ? "aar" : "message"
                    );
                    expect(spiedOnMockedTrackPNExSuccess.mock.calls[0][5]).toBe(
                      !isAar
                        ? "not_set"
                        : isDelegate
                        ? "mandatory"
                        : "recipient"
                    );
                  } else {
                    expect(
                      spiedOnMockedTrackPNExSuccess.mock.calls.length
                    ).toBe(0);
                  }
                });
              })
            );
          })
        )
      )
    );
  });
  [false, true].forEach(isAARNotification => {
    [false, true].forEach(isDelegate => {
      it(`should dispatch startPNPaymentStatusTracking (isAARNotification ${isAARNotification} isDelegate ${isDelegate})`, () => {
        const state = {
          entities: {
            messages: {
              thirdPartyById: {}
            }
          },
          features: {
            connectivityStatus: {},
            ingress: {},
            itWallet: {
              issuance: {
                integrityKeyTag: O.none
              }
            },
            pn: {
              aarFlow: isAARNotification
                ? sendAarMockStateFactory.displayingNotificationData()
                : sendAarMockStateFactory.none()
            }
          },
          remoteConfig: O.none,
          profile: pot.none
        } as GlobalState;
        const mockStore = configureMockStore<GlobalState>();
        const store: Store<GlobalState> = mockStore(state);

        jest
          .spyOn(AAR_SELECTORS, "isAarMessageDelegatedSelector")
          .mockImplementation((_state, _messageId) => isDelegate);

        renderComponent(store, false, isAARNotification);

        expect(mockDispatch.mock.calls.length).toBe(1);
        expect(mockDispatch.mock.calls[0].length).toBe(1);
        expect(mockDispatch.mock.calls[0][0]).toEqual(
          startPNPaymentStatusTracking({
            isAARNotification,
            isDelegate,
            messageId: message_1.id
          })
        );
      });
    });
  });

  [undefined, false, true].forEach(isAarMessage =>
    [false, true].forEach(isDelegate =>
      it(`should ${
        isAarMessage ? "" : "not "
      }call trackSendAarNotificationClosure with proper parameters upon pressing the android back button (is AAR message ${isAarMessage}, is delegate ${isDelegate})`, () => {
        const baseState = appReducer(
          undefined,
          applicationChangeState("active")
        );
        const mockStore = configureMockStore<GlobalState>();
        const store: Store<GlobalState> = mockStore(baseState);

        const sendMessage = {
          attachments: [],
          created_at: new Date(),
          iun: "A IUN",
          notificationStatusHistory: [],
          recipients: [],
          subject: "A subject"
        } as unknown as PNMessage;
        const sendMessagePotOption = pot.some(O.some(sendMessage));

        jest
          .spyOn(commonSelectors, "profileFiscalCodeSelector")
          .mockImplementation(_state => "XXXYYY99Z88W777I");
        jest
          .spyOn(REDUCERS, "pnMessageFromIdSelector")
          .mockImplementation((_state, _id) => sendMessagePotOption);
        jest
          .spyOn(AAR_SELECTORS, "isAarMessageDelegatedSelector")
          .mockImplementation((_state, _messageId) => isDelegate);
        const spiedOnMockedTrackSendAARNotificationClosure = jest
          .spyOn(SEND_ANALYTICS, "trackSendAarNotificationClosure")
          .mockImplementation();
        const spiedOnMockedUseHardwareBackButton = jest
          .spyOn(HARDWARE_BACK_BUTTON, "useHardwareBackButton")
          .mockImplementation();

        renderComponent(store, false, !!isAarMessage);

        expect(spiedOnMockedUseHardwareBackButton.mock.calls.length).toBe(1);
        expect(spiedOnMockedUseHardwareBackButton.mock.calls[0].length).toBe(1);
        expect(
          spiedOnMockedUseHardwareBackButton.mock.calls[0][0]
        ).toBeDefined();

        const useHardwareBackButtonCallback =
          spiedOnMockedUseHardwareBackButton.mock.calls[0][0];
        expect(typeof useHardwareBackButtonCallback).toBe("function");
        const result = useHardwareBackButtonCallback();

        if (isAarMessage) {
          expect(
            spiedOnMockedTrackSendAARNotificationClosure.mock.calls.length
          ).toBe(1);
          expect(
            spiedOnMockedTrackSendAARNotificationClosure.mock.calls[0].length
          ).toBe(1);
          expect(
            spiedOnMockedTrackSendAARNotificationClosure.mock.calls[0][0]
          ).toBe(isDelegate ? "mandatory" : "recipient");
          expect(result).toBe(true);
        } else {
          expect(
            spiedOnMockedTrackSendAARNotificationClosure.mock.calls.length
          ).toBe(0);
          expect(result).toBe(false);
        }
      })
    )
  );

  [undefined, false, true].forEach(isAarMessage =>
    [false, true].forEach(isDelegate =>
      it(`should ${
        isAarMessage ? "" : "not "
      }call trackSendAarNotificationClosure with proper parameters upon pressing the header's close button (is AAR message ${isAarMessage}, is delegate ${isDelegate})`, () => {
        const baseState = appReducer(
          undefined,
          applicationChangeState("active")
        );
        const mockStore = configureMockStore<GlobalState>();
        const store: Store<GlobalState> = mockStore(baseState);

        const sendMessage = {
          attachments: [],
          created_at: new Date(),
          iun: "A IUN",
          notificationStatusHistory: [],
          recipients: [],
          subject: "A subject"
        } as unknown as PNMessage;
        const sendMessagePotOption = pot.some(O.some(sendMessage));

        jest
          .spyOn(commonSelectors, "profileFiscalCodeSelector")
          .mockImplementation(_state => "XXXYYY99Z88W777I");
        jest
          .spyOn(REDUCERS, "pnMessageFromIdSelector")
          .mockImplementation((_state, _id) => sendMessagePotOption);
        jest
          .spyOn(AAR_SELECTORS, "isAarMessageDelegatedSelector")
          .mockImplementation((_state, _messageId) => isDelegate);
        const spiedOnMockedTrackSendAARNotificationClosure = jest
          .spyOn(SEND_ANALYTICS, "trackSendAarNotificationClosure")
          .mockImplementation();

        const { component } = renderComponent(store, false, !!isAarMessage);

        if (isAarMessage) {
          const headerCloseButton = component.getByTestId("AAR_close_button");
          fireEvent.press(headerCloseButton);

          expect(
            spiedOnMockedTrackSendAARNotificationClosure.mock.calls.length
          ).toBe(1);
          expect(
            spiedOnMockedTrackSendAARNotificationClosure.mock.calls[0].length
          ).toBe(1);
          expect(
            spiedOnMockedTrackSendAARNotificationClosure.mock.calls[0][0]
          ).toBe(isDelegate ? "mandatory" : "recipient");
        } else {
          component.getByTestId("support_close_button");

          expect(
            spiedOnMockedTrackSendAARNotificationClosure.mock.calls.length
          ).toBe(0);
        }
      })
    )
  );
});

const renderComponent = (
  store: Store<GlobalState>,
  firstTimeOpening: boolean,
  isAAr: boolean
) => {
  const { id, sender_service_id } = message_1;

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      MessageDetailsScreen,
      PN_ROUTES.MESSAGE_DETAILS,
      {
        firstTimeOpening,
        messageId: id,
        serviceId: sender_service_id,
        isAarMessage: isAAr
      },
      store
    )
  };
};
