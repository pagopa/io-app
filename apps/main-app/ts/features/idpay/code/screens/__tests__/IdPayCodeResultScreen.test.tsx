import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { getGenericError } from "../../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { IdPayCodeRoutes } from "../../navigation/routes";
import { IdPayCodeState } from "../../store/reducers";
import { IdPayCodeResultScreen } from "../IdPayCodeResultScreen";

const mockPop = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      replace: jest.fn(),
      dispatch: jest.fn(),
      isFocused: jest.fn(),
      addListener: () => jest.fn(),
      removeListener: () => jest.fn(),
      getParent: () => undefined,
      pop: mockPop
    })
  };
});

describe("IdPayCodeResultScreen", () => {
  const tCode = Array.from({ length: 5 }, () =>
    Math.floor(Math.random() * 9)
  ).join("");

  describe("when continue button si pressed", () => {
    it("should reset the store and pop the screen", () => {
      expect(mockPop).not.toHaveBeenCalled();

      const { component } = renderComponent({ code: pot.some(tCode) });
      const continueButton = component.getByTestId("actionButtonTestID");

      fireEvent(continueButton, "onPress");

      expect(mockPop).toHaveBeenCalled();
    });
  });

  describe("when code is generated with success", () => {
    it("should display the success screen", () => {
      const { component } = renderComponent({ code: pot.some(tCode) });

      expect(
        component.queryByText(
          I18n.t(
            `idpay.initiative.discountDetails.IDPayCode.successScreen.header`
          )
        )
      ).not.toBeNull();
    });
  });

  describe("when code was not generated successfully", () => {
    it("should display the failure screen", () => {
      const { component } = renderComponent({
        code: pot.noneError(getGenericError(new Error("")))
      });

      expect(
        component.queryByText(
          I18n.t(
            `idpay.initiative.discountDetails.IDPayCode.failureScreen.header.GENERIC`
          )
        )
      ).not.toBeNull();
    });
  });

  describe("when code was not enrolled to the initiative successfully", () => {
    it("should display the failure screen", () => {
      const { component } = renderComponent({
        enrollmentRequest: pot.noneError(getGenericError(new Error("")))
      });

      expect(
        component.queryByText(
          I18n.t(
            `idpay.initiative.discountDetails.IDPayCode.failureScreen.header.GENERIC`
          )
        )
      ).not.toBeNull();
    });
  });
});

const renderComponent = (partialCodeState: Partial<IdPayCodeState>) => {
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
      IdPayCodeResultScreen,
      IdPayCodeRoutes.IDPAY_CODE_RESULT,
      {},
      store
    ),
    store
  };
};
