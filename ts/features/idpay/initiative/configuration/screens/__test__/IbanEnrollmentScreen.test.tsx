import * as React from "react";
import configureMockStore from "redux-mock-store";
import { interpret } from "xstate";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import { IDPayConfigurationRoutes } from "../../navigation/navigator";
import { createIDPayInitiativeConfigurationMachine } from "../../xstate/machine";
import { ConfigurationMachineContext } from "../../xstate/provider";
import IbanEnrollmentScreen from "../IbanEnrollmentScreen";
import I18n from "../../../../../../i18n";
import {
  ConfigurationMode,
  Context,
  INITIAL_CONTEXT
} from "../../xstate/context";

describe("IbanEnrollmentScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("should render the screen correctly", () => {
    const { component } = renderComponent();
    expect(component).toBeTruthy();
  });
  it("should render the screen with the right title", () => {
    const { component } = renderComponent();
    expect(component).toBeTruthy();
    expect(component).not.toBeNull();

    const titleComponent = component.queryByText(
      I18n.t("idpay.configuration.headerTitle")
    );
    expect(titleComponent).not.toBeNull();
  });
  it(`should render "continue" and "add new" button button`, () => {
    const { component } = renderComponent();
    expect(component).toBeTruthy();
    expect(component).not.toBeNull();

    const continueButtonComponent = component.queryByTestId(
      "continueButtonTestID"
    );
    expect(continueButtonComponent).not.toBeNull();

    const addIbanButtonComponent = component.queryByTestId(
      "addIbanButtonTestID"
    );
    expect(addIbanButtonComponent).not.toBeNull();
  });
});

describe("IbanEnrollmentScreen in IBAN only mode", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("should render the screen correctly", () => {
    const { component } = renderComponent({ mode: ConfigurationMode.IBAN });
    expect(component).toBeTruthy();
  });
  it("should render the screen with the right title", () => {
    const { component } = renderComponent({ mode: ConfigurationMode.IBAN });
    expect(component).toBeTruthy();
    expect(component).not.toBeNull();

    const titleComponent = component.queryByText(
      I18n.t("idpay.configuration.iban.title")
    );
    expect(titleComponent).not.toBeNull();
  });
  it(`should render only "add new" button button`, () => {
    const { component } = renderComponent({ mode: ConfigurationMode.IBAN });
    expect(component).toBeTruthy();
    expect(component).not.toBeNull();

    const continueButtonComponent = component.queryByTestId(
      "continueButtonTestID"
    );
    expect(continueButtonComponent).toBeNull();

    const addIbanButtonComponent = component.queryByTestId(
      "addIbanButtonTestID"
    );
    expect(addIbanButtonComponent).not.toBeNull();
  });
});

const renderComponent = (context?: Partial<Context>) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  const mockMachine = createIDPayInitiativeConfigurationMachine()
    .withConfig({
      services: {
        confirmIban: jest.fn(),
        enrollIban: jest.fn(),
        loadIbanList: jest.fn(),
        loadInitiative: jest.fn(),
        loadWalletInstruments: jest.fn(),
        loadInitiativeInstruments: jest.fn(),
        instrumentsEnrollmentService: jest.fn()
      },
      actions: {
        exitConfiguration: jest.fn(),
        navigateToAddPaymentMethodScreen: jest.fn(),
        navigateToConfigurationIntro: jest.fn(),
        navigateToConfigurationSuccessScreen: jest.fn(),
        navigateToIbanEnrollmentScreen: jest.fn(),
        navigateToIbanLandingScreen: jest.fn(),
        navigateToIbanOnboardingScreen: jest.fn(),
        navigateToInitiativeDetailScreen: jest.fn(),
        navigateToInstrumentsEnrollmentScreen: jest.fn(),
        showUpdateIbanToast: jest.fn(),
        showFailureToast: jest.fn(),
        showInstrumentFailureToast: jest.fn()
      }
    })
    .withContext({
      ...INITIAL_CONTEXT,
      ...context
    });

  const mockService = interpret(mockMachine);

  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => (
        <ConfigurationMachineContext.Provider value={mockService}>
          <IbanEnrollmentScreen />
        </ConfigurationMachineContext.Provider>
      ),
      IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT,
      {},
      store
    ),
    store
  };
};
