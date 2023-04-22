import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import configureMockStore from "redux-mock-store";
import { TagEnum as TagEnumBase } from "../../../../definitions/backend/MessageCategoryBase";
import { TagEnum as TagEnumPayment } from "../../../../definitions/backend/MessageCategoryPayment";
import { TagEnum as TagEnumPN } from "../../../../definitions/backend/MessageCategoryPN";
import { PnPreferences } from "../../../features/pn/store/reducers/preferences";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { AllPaginated } from "../../../store/reducers/entities/messages/allPaginated";
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import { GlobalState } from "../../../store/reducers/types";
import {
  baseBackendConfig,
  baseBackendState,
  baseRawBackendStatus
} from "../../../store/reducers/__mock__/backendStatus";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import { successReloadMessagesPayload } from "../../../__mocks__/messages";
import MessagesHomeScreen from "../MessagesHomeScreen";

jest.mock("../../../config", () => ({
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
      isFocused: jest.fn(),
      addListener: () => jest.fn(),
      removeListener: () => jest.fn(),
      getParent: () => undefined
    })
  };
});

const mockPresentBottomSheet = jest.fn();

jest.mock("../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: () => ({ present: mockPresentBottomSheet })
}));

describe("MessagesHomeScreen", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockPresentBottomSheet.mockReset();
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
          const { component } = renderComponent(
            { inboxMessages: [message] },
            true
          );
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

    describe("and PN is enabled", () => {
      const isPnEnabled = true;

      describe("when tapping on the message", () => {
        it("then a navigation should NOT be dispatched", () => {
          const { component } = renderComponent(
            { inboxMessages: [pnMessage] },
            isPnEnabled
          );
          fireEvent(component.getByText(pnMessage.title), "onPress");
          expect(mockNavigate).toHaveBeenCalledTimes(0);
        });
      });
    });

    describe("and PN is disabled", () => {
      const isPnEnabled = false;

      describe("when tapping on the message", () => {
        it("then a navigation should be dispatched", () => {
          const { component } = renderComponent(
            { inboxMessages: [pnMessage] },
            isPnEnabled
          );
          fireEvent(component.getByText(pnMessage.title), "onPress");
          expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MESSAGES_NAVIGATOR, {
            screen: ROUTES.MESSAGE_ROUTER_PAGINATED,
            params: {
              messageId: pnMessage.id,
              fromNotification: false
            }
          });
        });
      });
    });
  });
});

type InputState = {
  inboxMessages: ReadonlyArray<UIMessage>;
  pnPreferences?: PnPreferences;
};

const renderComponent = (
  state: InputState = { inboxMessages: [] },
  isPnEnabled: boolean
) => {
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
    },
    backendStatus: {
      ...baseBackendState,
      status: O.some({
        ...baseRawBackendStatus,
        config: {
          ...baseBackendConfig,
          pn: { enabled: isPnEnabled, frontend_url: "" }
        }
      })
    }
  } as GlobalState);

  const component = renderScreenWithNavigationStoreContext(
    MessagesHomeScreen,
    ROUTES.MESSAGES_HOME,
    {},
    store
  );

  return {
    component,
    store
  };
};
