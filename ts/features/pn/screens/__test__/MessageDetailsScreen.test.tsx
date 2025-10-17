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
import * as analytics from "../../aar/analytics";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

jest.mock("../../components/MessageDetails");

describe("MessageDetailsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  [true, false].forEach(isAar => {
    it(`should match the snapshot when there is an error${
      isAar ? "and dispatch trackSendAARFailure" : ""
    }`, () => {
      const spiedOnMockedTrackSendAARFailure = jest
        .spyOn(analytics, "trackSendAARFailure")
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

      const { component } = renderComponent(store, isAar);
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
        .spyOn(analytics, "trackSendAARFailure")
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

      const { component } = renderComponent(store, isAar);
      expect(component).toMatchSnapshot();

      expect(spiedOnMockedTrackSendAARFailure.mock.calls.length).toBe(0);
    });
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

      renderComponent(store, isAARNotification);

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

const renderComponent = (store: Store<GlobalState>, isAAr: boolean) => {
  const { id, sender_service_id } = message_1;

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      MessageDetailsScreen,
      PN_ROUTES.MESSAGE_DETAILS,
      {
        firstTimeOpening: false,
        messageId: id,
        serviceId: sender_service_id,
        isAarMessage: isAAr
      },
      store
    )
  };
};
