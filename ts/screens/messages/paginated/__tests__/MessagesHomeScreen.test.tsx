import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import configureMockStore from "redux-mock-store";
import { TagEnum as TagEnumBase } from "../../../../../definitions/backend/MessageCategoryBase";
import { TagEnum as TagEnumPayment } from "../../../../../definitions/backend/MessageCategoryPayment";
import { TagEnum as TagEnumPN } from "../../../../../definitions/backend/MessageCategoryPN";
import { PnPreferences } from "../../../../features/pn/store/reducers/preferences";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { AllPaginated } from "../../../../store/reducers/entities/messages/allPaginated";
import { UIMessage } from "../../../../store/reducers/entities/messages/types";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { successReloadMessagesPayload } from "../../../../__mocks__/messages";
import MessagesHomeScreen from "../MessagesHomeScreen";

jest.useFakeTimers();

jest.mock("../../../../config", () => ({
  pnEnabled: true
}));

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      dispatch: jest.fn(),
      addListener: () => jest.fn()
    })
  };
});

const mockPresentPNBottomSheet = jest.fn();
jest.mock(
  "../../../../features/pn/components/PnOpenConfirmationBottomSheet",
  () => ({
    usePnOpenConfirmationBottomSheet: () => ({
      present: mockPresentPNBottomSheet,
      dismiss: jest.fn()
    })
  })
);

describe("MessagesHomeScreen", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockPresentPNBottomSheet.mockReset();
  });

  [
    TagEnumBase.EU_COVID_CERT,
    TagEnumBase.GENERIC,
    TagEnumBase.LEGAL_MESSAGE,
    TagEnumPayment.PAYMENT
  ].forEach(tag => {
    describe(`given a ${tag} message`, () => {
      const message = {
        ...successReloadMessagesPayload.messages[0],
        category: { tag }
      } as UIMessage;

      describe("when tapping on it", () => {
        it("then a navigation should be dispatched", () => {
          const { component } = renderComponent({ inboxMessages: [message] });
          fireEvent(component.getByText(message.title), "onPress");
          expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MESSAGES_NAVIGATOR, {
            screen: ROUTES.MESSAGE_ROUTER_PAGINATED,
            params: {
              messageId: message.id,
              fromNotification: false
            }
          });
        });
      });
    });
  });

  describe("given a PN message", () => {
    const pnMessage = {
      ...successReloadMessagesPayload.messages[0],
      category: { tag: TagEnumPN.PN }
    } as UIMessage;

    describe("when tapping on it", () => {
      it("then a navigation should NOT be dispatched", () => {
        const { component } = renderComponent({ inboxMessages: [pnMessage] });
        fireEvent(component.getByText(pnMessage.title), "onPress");
        expect(mockNavigate).toHaveBeenCalledTimes(0);
      });

      it("and the bottom sheet for PN is presented", () => {
        const { component } = renderComponent({ inboxMessages: [pnMessage] });
        fireEvent(component.getByText(pnMessage.title), "onPress");
        expect(mockPresentPNBottomSheet).toHaveBeenCalledWith(pnMessage);
      });

      describe("and showAlertForMessageOpening is false", () => {
        // as required by legal for now the bottom sheet should always
        // be presented to the user, whether or not this flag is false
        it("then the bottom sheet for PN is ALWAYS presented", () => {
          const { component } = renderComponent({
            inboxMessages: [pnMessage],
            pnPreferences: { showAlertForMessageOpening: false }
          });
          fireEvent(component.getByText(pnMessage.title), "onPress");
          expect(mockPresentPNBottomSheet).toHaveBeenCalledWith(pnMessage);
        });
      });
    });
  });
});

type InputState = {
  inboxMessages: ReadonlyArray<UIMessage>;
  pnPreferences?: PnPreferences;
};

const renderComponent = (state: InputState = { inboxMessages: [] }) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const allPaginated = {
    archive: {
      data: pot.none,
      lastRequest: O.none
    },
    inbox: {
      data: pot.some({
        page: [...state.inboxMessages],
        previous: undefined,
        next: undefined
      }),
      lastRequest: O.none
    },
    migration: O.none
  } as AllPaginated;

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState,
    entities: {
      ...globalState.entities,
      messages: {
        ...globalState.entities.messages,
        allPaginated
      }
    },
    features: {
      ...globalState.features,
      pn: {
        ...globalState.features.pn,
        preferences: {
          ...globalState.features.pn.preferences,
          ...state.pnPreferences
        }
      }
    }
  } as GlobalState);
  const spyStoreDispatch = spyOn(store, "dispatch");

  const component = renderScreenWithNavigationStoreContext(
    MessagesHomeScreen,
    ROUTES.MESSAGES_HOME,
    {},
    store
  );

  return {
    component,
    store,
    spyStoreDispatch
  };
};
