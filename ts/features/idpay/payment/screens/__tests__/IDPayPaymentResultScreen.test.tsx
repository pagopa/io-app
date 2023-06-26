import * as O from "fp-ts/lib/Option";
import * as React from "react";
import configureMockStore from "redux-mock-store";
import { interpret } from "xstate";
import I18n from "../../../../../i18n";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import { IDPayPaymentRoutes } from "../../navigation/navigator";
import { Context, INITIAL_CONTEXT } from "../../xstate/context";
import { PaymentFailureEnum } from "../../xstate/failure";
import { createIDPayPaymentMachine } from "../../xstate/machine";
import { PaymentMachineContext } from "../../xstate/provider";
import { IDPayPaymentResultScreen } from "../IDPayPaymentResultScreen";

describe("Test IDPayPaymentResultScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("should render the screen correctly", () => {
    const { component } = renderComponent();
    expect(component).toBeTruthy();
  });
  it("should render the success screen", () => {
    const { component } = renderComponent();
    expect(component).toBeTruthy();

    expect(
      component.getByText(I18n.t("idpay.payment.result.success.title"))
    ).toBeTruthy();
  });

  it("should render the CANCELLED failure screen", () => {
    const { component } = renderComponent({
      failure: O.some(PaymentFailureEnum.CANCELLED)
    });
    expect(component).toBeTruthy();

    expect(
      component.getByText(
        I18n.t("idpay.payment.result.failure.CANCELLED.title")
      )
    ).toBeTruthy();
  });
  it("should render the GENERIC failure screen", () => {
    const { component } = renderComponent({
      failure: O.some(PaymentFailureEnum.GENERIC)
    });
    expect(component).toBeTruthy();

    expect(
      component.getByText(I18n.t("idpay.payment.result.failure.GENERIC.title"))
    ).toBeTruthy();
  });

  it("should render the REJECTED failure screen", () => {
    const { component } = renderComponent({
      failure: O.some(PaymentFailureEnum.REJECTED)
    });
    expect(component).toBeTruthy();

    expect(
      component.getByText(I18n.t("idpay.payment.result.failure.REJECTED.title"))
    ).toBeTruthy();
  });

  it("should render the BUDGET_EXHAUSTED failure screen", () => {
    const { component } = renderComponent({
      failure: O.some(PaymentFailureEnum.BUDGET_EXHAUSTED)
    });
    expect(component).toBeTruthy();

    expect(
      component.getByText(I18n.t("idpay.payment.result.failure.REJECTED.title"))
    ).toBeTruthy();
  });

  it("should render the EXPIRED failure screen", () => {
    const { component } = renderComponent({
      failure: O.some(PaymentFailureEnum.EXPIRED)
    });
    expect(component).toBeTruthy();

    expect(
      component.getByText(I18n.t("idpay.payment.result.failure.EXPIRED.title"))
    ).toBeTruthy();
  });
});

const renderComponent = (context?: Partial<Context>) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  const mockMachine = createIDPayPaymentMachine()
    .withConfig({
      services: {
        preAuthorizePayment: jest.fn(),
        authorizePayment: jest.fn()
      },
      actions: {
        exitAuthorization: jest.fn(),
        navigateToAuthorizationScreen: jest.fn(),
        navigateToResultScreen: jest.fn(),
        showErrorToast: jest.fn()
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
        <PaymentMachineContext.Provider value={mockService}>
          <IDPayPaymentResultScreen />
        </PaymentMachineContext.Provider>
      ),
      IDPayPaymentRoutes.IDPAY_PAYMENT_RESULT,
      {},
      store
    ),
    store
  };
};
