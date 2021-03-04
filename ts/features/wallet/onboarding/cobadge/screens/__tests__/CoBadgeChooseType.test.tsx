import { fireEvent } from "@testing-library/react-native";
import { none } from "fp-ts/lib/Option";
import { NavigationActions, NavigationParams } from "react-navigation";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import WALLET_ONBOARDING_COBADGE_ROUTES from "../../navigation/routes";
import CoBadgeChooseType from "../CoBadgeChooseType";

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));
describe("CoBadgeChooseType component", () => {
  beforeEach(() => jest.useFakeTimers());
  it("should dispatch navigateToWalletAddCreditCard action if press the enabled item", () => {
    const { component, store } = getComponent(undefined, 1);
    const enabledItem = component.queryByTestId("enabledItem");

    expect(component).not.toBeNull();
    expect(enabledItem).not.toBeNull();

    const expectedPayload = [
      {
        type: NavigationActions.BACK,
        key: undefined
      },
      {
        type: NavigationActions.NAVIGATE,
        routeName: ROUTES.WALLET_ADD_CARD,
        params: { inPayment: none }
      }
    ];

    if (enabledItem) {
      fireEvent.press(enabledItem);
      expect(store.getActions()).toEqual(expectedPayload);
    }
  });
  it("should dispatch walletAddCoBadgeStart action if press disabled or unknown item", () => {
    const anAbi = "1234";
    const { component, store } = getComponent(anAbi, 1);
    const disabledItem = component.queryByTestId("disabledItem");
    const unknownItem = component.queryByTestId("unknownItem");

    expect(disabledItem).not.toBeNull();
    expect(unknownItem).not.toBeNull();

    const expectedPayload = {
      type: WALLET_ONBOARDING_COBADGE_ROUTES.START,
      payload: anAbi
    };
    if (disabledItem) {
      fireEvent.press(disabledItem);
      expect(store.getActions()).toEqual([expectedPayload]);
    }
    if (unknownItem) {
      fireEvent.press(unknownItem);
      expect(store.getActions()).toEqual([expectedPayload, expectedPayload]);
    }
  });
});

const getComponent = (abi?: string, legacyAddCreditCardBack?: number) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      CoBadgeChooseType,
      ROUTES.WALLET_BPAY_DETAIL,
      { abi, legacyAddCreditCardBack },
      store
    ),
    store
  };
};
