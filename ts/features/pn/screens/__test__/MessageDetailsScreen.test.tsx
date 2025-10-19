import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { Action, Store } from "redux";
import configureMockStore from "redux-mock-store";
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
import * as ANALYTICS from "../../analytics";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

jest.mock("../../components/MessageDetails");

describe("MessageDetailsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // eslint-disable-next-line sonarjs/cognitive-complexity
  [true, false].forEach(isAar => {
    it(`should match the snapshot when there is an error -- aar:${isAar}`, () => {
      const sequenceOfActions: ReadonlyArray<Action> = [
        applicationChangeState("active")
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
    });

    it(`should match the snapshot when everything went fine -- aar:${isAar}`, () => {
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
                    .spyOn(ANALYTICS, "trackPNUxSuccess")
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
    it(`should dispatch startPNPaymentStatusTracking (isAARNotification ${isAARNotification})`, () => {
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

      renderComponent(store, false, isAARNotification);

      expect(mockDispatch.mock.calls.length).toBe(1);
      expect(mockDispatch.mock.calls[0].length).toBe(1);
      expect(mockDispatch.mock.calls[0][0]).toEqual(
        startPNPaymentStatusTracking({
          isAARNotification,
          messageId: message_1.id
        })
      );
    });
  });
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
