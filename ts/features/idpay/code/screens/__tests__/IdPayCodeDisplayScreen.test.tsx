import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent, within } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { IdPayCodeRoutes } from "../../navigation/routes";
import { IdPayCodeState } from "../../store/reducers";
import { IdPayCodeDisplayScreen } from "../IdPayCodeDisplayScreen";

const mockReplace = jest.fn();
const mockPop = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      replace: mockReplace,
      dispatch: jest.fn(),
      isFocused: jest.fn(),
      addListener: () => jest.fn(),
      removeListener: () => jest.fn(),
      getParent: () => undefined,
      pop: mockPop,
      setOptions: jest.fn
    })
  };
});

describe("IdPayCodeDisplayScreen", () => {
  it("should display the code", () => {
    const tCode = Array.from({ length: 5 }, () =>
      Math.floor(Math.random() * 9)
    ).join("");

    const { component } = renderComponent({ code: pot.some(tCode) });

    [...tCode].forEach((digit, index) => {
      const child = within(
        component.getByTestId(`idPayCodeDigit${index}TestID`)
      );
      expect(child.queryByText(digit)).not.toBeNull();
    });
  });

  describe("if it's onboarding", () => {
    it("should display the continue button", () => {
      const { component } = renderComponent({ code: pot.some("12345") }, true);
      const button = within(component.getByTestId("actionButtonTestID"));

      expect(
        button.queryByText(I18n.t("global.buttons.continue"))
      ).not.toBeNull();
    });

    it("should navigate to the result screen when button is pressed", () => {
      const { component } = renderComponent({ code: pot.some("12345") }, true);
      const button = component.getByTestId("actionButtonTestID");

      fireEvent(button, "onPress");

      expect(mockReplace).toHaveBeenCalledWith(
        IdPayCodeRoutes.IDPAY_CODE_MAIN,
        {
          screen: IdPayCodeRoutes.IDPAY_CODE_RESULT
        }
      );
    });
  });

  describe("if it's not onboarding", () => {
    it("should display the close button", () => {
      const { component } = renderComponent({ code: pot.some("12345") }, false);
      const button = within(component.getByTestId("actionButtonTestID"));

      expect(button.queryByText(I18n.t("global.buttons.close"))).not.toBeNull();
    });

    it("should navigate back when button is pressed", () => {
      const { component } = renderComponent({ code: pot.some("12345") }, false);
      const button = component.getByTestId("actionButtonTestID");

      fireEvent(button, "onPress");

      expect(mockPop).toHaveBeenCalled();
    });
  });
});

const renderComponent = (
  partialCodeState: Partial<IdPayCodeState>,
  isOnboarding?: boolean
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const finalState = {
    ...globalState,
    features: {
      ...globalState.features,
      idPay: {
        ...globalState.features.idPay,
        code: {
          ...globalState.features.idPay.code,
          ...partialCodeState
        }
      }
    }
  } as GlobalState;
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(finalState);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      IdPayCodeDisplayScreen,
      IdPayCodeRoutes.IDPAY_CODE_DISPLAY,
      { isOnboarding },
      store
    ),
    store
  };
};
