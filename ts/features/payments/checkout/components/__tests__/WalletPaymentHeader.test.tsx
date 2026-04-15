import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import configureMockStore from "redux-mock-store";
import I18n from "i18next";
import { Config } from "../../../../../../definitions/content/Config";
import { useHardwareBackButton } from "../../../../../hooks/useHardwareBackButton";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { baseRawBackendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsCheckoutRoutes } from "../../navigation/routes";
import { walletPaymentSetCurrentStep } from "../../store/actions/orchestration";
import { WalletPaymentStepEnum } from "../../types";
import { WalletPaymentHeader } from "../WalletPaymentHeader";

const mockSetOptions = jest.fn();
const mockGoBack = jest.fn();
const mockNavigate = {
  navigate: jest.fn(),
  goBack: mockGoBack,
  getParent: jest.fn().mockReturnValue({
    setOptions: mockSetOptions
  })
};

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => mockNavigate
}));

jest.mock("../../../../../hooks/useHardwareBackButton", () => ({
  useHardwareBackButton: jest.fn()
}));

const globalState = appReducer(undefined, applicationChangeState("active"));
const mockStore = configureMockStore<GlobalState>();

describe("WalletPaymentHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (state: GlobalState, currentStep: number) => {
    const store = mockStore(state);

    return {
      component: renderScreenWithNavigationStoreContext<GlobalState>(
        () => <WalletPaymentHeader currentStep={currentStep} />,
        PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_MAKE,
        {},
        store
      ),
      store
    };
  };

  it("should call goBack when on first step and back button is pressed", () => {
    const { component } = renderComponent(
      globalState,
      WalletPaymentStepEnum.PICK_PAYMENT_METHOD
    );
    const { getByLabelText } = component;
    const backButton = getByLabelText(I18n.t("global.buttons.back"));
    fireEvent.press(backButton);
    expect(mockGoBack).toHaveBeenCalled();
  });

  it("should set the stepper to previous state at CONFIRM_TRANSACTION back", () => {
    const enrichedState = {
      ...globalState,
      features: {
        ...globalState.features,
        payments: {
          ...globalState.features.payments,
          checkout: {
            ...globalState.features.payments.checkout,
            currentStep: WalletPaymentStepEnum.CONFIRM_TRANSACTION,
            pspList: pot.some([
              {
                onUs: false,
                idBundle: "1",
                taxPayerFee: 1
              }
            ])
          }
        }
      }
    };

    const { component, store } = renderComponent(
      enrichedState,
      WalletPaymentStepEnum.CONFIRM_TRANSACTION
    );
    const { getByLabelText } = component;
    const backButton = getByLabelText(I18n.t("global.buttons.back"));
    fireEvent.press(backButton);
    expect(store.getActions()).toContainEqual(
      walletPaymentSetCurrentStep(WalletPaymentStepEnum.PICK_PAYMENT_METHOD)
    );
  });

  it("should go back to PICK_PAYMENT_METHOD when at CONFIRM_TRANSACTION with one PSP", () => {
    const enrichedState = {
      ...globalState,
      features: {
        ...globalState.features,
        payments: {
          ...globalState.features.payments,
          checkout: {
            ...globalState.features.payments.checkout,
            currentStep: WalletPaymentStepEnum.CONFIRM_TRANSACTION,
            pspList: pot.some([
              {
                onUs: false,
                idBundle: "psp-123",
                taxPayerFee: 1
              }
            ])
          }
        }
      }
    };

    const { component, store } = renderComponent(
      enrichedState,
      WalletPaymentStepEnum.CONFIRM_TRANSACTION
    );

    const backButton = component.getByLabelText(I18n.t("global.buttons.back"));
    fireEvent.press(backButton);

    expect(store.getActions()).toContainEqual(
      walletPaymentSetCurrentStep(WalletPaymentStepEnum.PICK_PAYMENT_METHOD)
    );
  });

  it("should not handle back when webView is enabled and payload exists", () => {
    const enrichedState = {
      ...globalState,
      remoteConfig: O.some({
        ...baseRawBackendStatus.config,
        newPaymentSection: {
          min_app_version: {
            android: "1.0.0.0",
            ios: "1.0.0.0"
          }
        }
      } as Config),
      features: {
        ...globalState.features,

        payments: {
          ...globalState.features.payments,
          checkout: {
            ...globalState.features.payments.checkout,
            webViewPaymentPayload: { some: "payload" }
          }
        }
      }
    };

    renderComponent(enrichedState, WalletPaymentStepEnum.PICK_PSP);

    (useHardwareBackButton as jest.Mock).mockImplementation(handler => {
      handler();
      expect(handler()).toBe(true);
    });

    expect(useHardwareBackButton).toHaveBeenCalled();
  });
});
